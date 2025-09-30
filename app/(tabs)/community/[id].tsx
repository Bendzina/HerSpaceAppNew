import React from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';
import { translations } from '@/i18n/translations';
import {
  getCommunityPost,
  listCommunityComments,
  addCommunityComment,
  listCommunityReactions,
  toggleCommunityReaction,
  type CommunityComment,
  type ReactionType,
  type CommunityReaction
} from '@/services/communityService';

const ANONYMOUS_AVATAR = 'https://ui-avatars.com/api/?name=Anonymous&background=random';

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval}${unit[0]} ago`;
    }
  }
  return 'Just now';
};

const reactionOrder: ReactionType[] = ['heart', 'support', 'prayer', 'celebration', 'hug'];
const reactionIcon: Record<ReactionType, keyof typeof Ionicons.glyphMap> = {
  heart: 'heart',
  support: 'thumbs-up',
  prayer: 'happy',
  celebration: 'sparkles',
  hug: 'heart-circle',
};

const Avatar = ({ name, isAnonymous, size = 32 }: { name?: string; isAnonymous: boolean; size?: number }) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
    {isAnonymous ? (
      <Image 
        source={{ uri: ANONYMOUS_AVATAR }} 
        style={{ width: size, height: size, borderRadius: size / 2 }} 
      />
    ) : (
      <View style={[styles.avatarFallback, { backgroundColor: '#e1e1e1' }]}>
        <Text style={{ color: '#666', fontWeight: '600' }}>{(name || '?')[0].toUpperCase()}</Text>
      </View>
    )}
  </View>
);

const ReactionButton = ({ 
  type, 
  count, 
  onPress, 
  onCountPress,
  isActive = false,
  colors 
}: { 
  type: ReactionType; 
  count: number; 
  onPress: () => void; 
  onCountPress?: () => void;
  isActive?: boolean;
  colors: any;
}) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[
      styles.reactionButton, 
      { 
        backgroundColor: isActive ? `${colors.primary}22` : colors.surface,
        borderColor: isActive ? colors.primary : colors.border
      }
    ]}
  >
    <Ionicons 
      name={reactionIcon[type]} 
      size={16} 
      color={isActive ? colors.primary : colors.textSecondary} 
    />
    {count > 0 && (
      <TouchableOpacity onPress={onCountPress} style={styles.reactionCountContainer}>
        <Text 
          style={[
            styles.reactionCount, 
            { color: isActive ? colors.primary : colors.textSecondary }
          ]}
        >
          {count}
        </Text>
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  
  const L = {
    back: t.back,
    comments: t.comments,
    addCommentPh: t.addCommentPh,
    anonymous: t.anonymous,
    anonymousUser: t.anonymousUser,
    send: t.send,
    noComments: t.noComments,
    failedLoad: t.failedLoad,
    failedSend: t.failedSend,
  };

  const [loading, setLoading] = React.useState(true);
  const [post, setPost] = React.useState<any | null>(null);
  const [userReaction, setUserReaction] = React.useState<ReactionType | null>(null); // Changed: only one reaction
  const [reactions, setReactions] = React.useState<Record<ReactionType, number>>({ heart: 0, support: 0, prayer: 0, celebration: 0, hug: 0 });
  const [reactionsWithUsers, setReactionsWithUsers] = React.useState<Record<ReactionType, CommunityReaction[]>>({} as Record<ReactionType, CommunityReaction[]>);
  const [comments, setComments] = React.useState<CommunityComment[]>([]);
  const [commentText, setCommentText] = React.useState('');
  const [anonymous, setAnonymous] = React.useState(true);
  const [reactionsModalVisible, setReactionsModalVisible] = React.useState(false);
  const [selectedReactionType, setSelectedReactionType] = React.useState<ReactionType | null>(null);
  const [sending, setSending] = React.useState(false);

  const loadAll = React.useCallback(async () => {
    if (!id) return;
    const [p, cs, rs] = await Promise.all([
      getCommunityPost(id),
      listCommunityComments(id),
      listCommunityReactions(id),
    ]);
    setPost(p);
    setComments(cs || []);
    
    // Changed: user can only have one reaction
    const userReactions = (p.user_reactions || []) as ReactionType[];
    setUserReaction(userReactions.length > 0 ? userReactions[0] : null);
    
    const counts: Record<ReactionType, number> = { heart: 0, support: 0, prayer: 0, celebration: 0, hug: 0 };
    const users: Record<ReactionType, CommunityReaction[]> = { heart: [], support: [], prayer: [], celebration: [], hug: [] };
    (rs || []).forEach(r => {
      counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
      users[r.reaction_type].push(r);
    });
    setReactions(counts);
    setReactionsWithUsers(users);
  }, [id]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadAll();
      } catch (e: any) {
        Alert.alert('', e?.message || L.failedLoad);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadAll, L.failedLoad]);

  const onReact = async (kind: ReactionType) => {
    try {
      const prevReaction = userReaction;
      
      // Optimistic update
      if (prevReaction === kind) {
        // Remove reaction
        setUserReaction(null);
        setReactions(prev => ({ ...prev, [kind]: Math.max((prev[kind] || 0) - 1, 0) }));
      } else if (prevReaction) {
        // Change reaction
        setUserReaction(kind);
        setReactions(prev => ({
          ...prev,
          [prevReaction]: Math.max((prev[prevReaction] || 0) - 1, 0),
          [kind]: (prev[kind] || 0) + 1
        }));
      } else {
        // Add new reaction
        setUserReaction(kind);
        setReactions(prev => ({ ...prev, [kind]: (prev[kind] || 0) + 1 }));
      }

      // Call backend
      await toggleCommunityReaction(id!, kind, true);
      
      // Reload to sync with server
      await loadAll();
    } catch (e: any) {
      Alert.alert('', e?.message || L.failedLoad);
      // Reload on error to fix state
      await loadAll();
    }
  };

  const showWhoReacted = (reactionType: ReactionType) => {
    setSelectedReactionType(reactionType);
    setReactionsModalVisible(true);
  };

  const hideReactionsModal = () => {
    setReactionsModalVisible(false);
    setSelectedReactionType(null);
  };

  const onSend = async () => {
    if (!commentText.trim()) return;
    try {
      setSending(true);
      await addCommunityComment(id!, { content: commentText.trim(), is_anonymous: anonymous });
      setCommentText('');
      await loadAll();
    } catch (e: any) {
      Alert.alert('', e?.message || L.failedSend);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={[styles.header, { backgroundColor: colors.background, paddingTop: insets.top + 6 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel={L.back}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>{L.back}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : post ? (
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.postHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.postHeaderContent}>
                <Avatar name={post.user?.name} isAnonymous={post.is_anonymous} size={40} />
                <View style={styles.postHeaderText}>
                  <Text style={[styles.postAuthor, { color: colors.text }]}>
                    {post.is_anonymous ? L.anonymous : (post.user?.name || L.anonymousUser)}
                  </Text>
                  <Text style={[styles.postTime, { color: colors.textSecondary }]}>
                    {formatTimeAgo(post.created_at)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.postType, { backgroundColor: `${colors.primary}22`, color: colors.primary }]}>
                {post.post_type}
              </Text>
            </View>

            <View style={styles.postContent}>
              <Text style={[styles.postTitle, { color: colors.text }]}>{post.title}</Text>
              {!!post.content && (
                <Text style={[styles.postText, { color: colors.textSecondary }]}>{post.content}</Text>
              )}
            </View>

            <View style={[styles.reactionsContainer, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
              <View style={styles.reactionsRow}>
                {reactionOrder.map(r => (
                  <ReactionButton
                    key={r}
                    type={r}
                    count={reactions[r] || 0}
                    onPress={() => onReact(r)}
                    onCountPress={() => showWhoReacted(r)}
                    colors={colors}
                    isActive={userReaction === r}
                  />
                ))}
              </View>
            </View>

            <View style={styles.commentsSection}>
              <View style={styles.commentsHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{L.comments}</Text>
                <Text style={[styles.commentsCount, { color: colors.textSecondary }]}>{comments.length}</Text>
              </View>

              {comments.length === 0 ? (
                <View style={styles.noComments}>
                  <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                  <Text style={[styles.noCommentsText, { color: colors.textSecondary }]}>{L.noComments}</Text>
                </View>
              ) : (
                <View style={styles.commentsList}>
                  {comments.map((c) => (
                    <View
                      key={c.id}
                      style={[
                        styles.comment,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          shadowColor: colors.shadow
                        }
                      ]}
                    >
                      <View style={styles.commentHeader}>
                        <Avatar name={c.user?.name} isAnonymous={c.is_anonymous} size={32} />
                        <View style={styles.commentInfo}>
                          <Text style={[styles.commentAuthor, { color: colors.text }]}>
                            {c.is_anonymous ? L.anonymous : (c.user?.name || L.anonymousUser)}
                          </Text>
                          <Text style={[styles.commentTime, { color: colors.textSecondary }]}>
                            {formatTimeAgo(c.created_at)}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.commentText, { color: colors.text }]}>{c.content}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.addCommentContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.commentInputContainer}>
                <TextInput
                  placeholder={L.addCommentPh}
                  placeholderTextColor={colors.textSecondary}
                  value={commentText}
                  onChangeText={setCommentText}
                  style={[styles.commentInput, { color: colors.text }]}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
                <View style={styles.commentActions}>
                  <TouchableOpacity
                    onPress={() => setAnonymous(!anonymous)}
                    style={[styles.anonymousToggle, {
                      backgroundColor: anonymous ? `${colors.primary}22` : colors.background,
                      borderColor: anonymous ? colors.primary : colors.border
                    }]}
                  >
                    <Ionicons
                      name={anonymous ? 'eye-off-outline' : 'eye-outline'}
                      size={16}
                      color={anonymous ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[
                      styles.anonymousText,
                      {
                        color: anonymous ? colors.primary : colors.textSecondary,
                        marginLeft: 4
                      }
                    ]}>
                      {L.anonymous}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onSend}
                    disabled={sending || !commentText.trim()}
                    style={[
                      styles.sendButton,
                      {
                        backgroundColor: colors.primary,
                        opacity: (sending || !commentText.trim()) ? 0.5 : 1
                      }
                    ]}
                  >
                    {sending ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Ionicons name="send" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>—</Text>
          </View>
        )}

        {reactionsModalVisible && selectedReactionType && (
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Ionicons name={reactionIcon[selectedReactionType]} size={24} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {reactionsWithUsers[selectedReactionType]?.length || 0} {selectedReactionType}(s)
                </Text>
                <TouchableOpacity onPress={hideReactionsModal} style={styles.modalClose}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                {reactionsWithUsers[selectedReactionType]?.length > 0 ? (
                  reactionsWithUsers[selectedReactionType].map((reaction) => (
                    <View key={reaction.id} style={[styles.reactionUserItem, { borderBottomColor: colors.border }]}>
                      <Avatar
                        name={reaction.user?.name}
                        isAnonymous={reaction.is_anonymous === true}
                        size={36}
                      />
                      <View style={styles.reactionUserInfo}>
                        <Text style={[styles.reactionUserName, { color: colors.text }]}>
                          {reaction.is_anonymous === true ? L.anonymous : (reaction.user?.name || 'User')}
                        </Text>
                        <Text style={[styles.reactionTime, { color: colors.textSecondary }]}>
                          {formatTimeAgo(reaction.created_at)}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noReactions}>
                    <Ionicons name="heart-outline" size={32} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                    <Text style={[styles.noReactionsText, { color: colors.textSecondary }]}>
                      No {selectedReactionType} reactions yet
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  postHeader: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postHeaderText: {
    marginLeft: 12,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.7,
  },
  postType: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  postContent: {
    padding: 16,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 26,
  },
  postText: {
    fontSize: 16,
    lineHeight: 22,
  },
  reactionsContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  reactionCount: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  reactionCountContainer: {
    marginLeft: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  commentsSection: {
    padding: 16,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  commentsCount: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.7,
  },
  noComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  noCommentsText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  commentsList: {
    marginTop: 8,
  },
  comment: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentInfo: {
    marginLeft: 10,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentTime: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
  },
  addCommentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 12,
    paddingBottom: 100, // Increased padding to account for keyboard
  },
  commentInputContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  commentInput: {
    minHeight: 100,
    maxHeight: 150,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  anonymousText: {
    fontSize: 13,
    marginLeft: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  modalClose: {
    padding: 4,
  },
  modalList: {
    maxHeight: 300,
  },
  reactionUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  reactionUserInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reactionUserName: {
    fontSize: 16,
    fontWeight: '500',
  },
  reactionTime: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  noReactions: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  noReactionsText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
});