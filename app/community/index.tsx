import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';
import { translations } from '@/i18n/translations';
import { listCommunityPosts, type CommunityPost, type CommunityPostType } from '@/services/communityService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const chips: { 
  id: 'all' | CommunityPostType; 
  key: string;
  emoji: string;
  gradient: string[];
  color: string;
}[] = [
  { id: 'all', key: 'all', emoji: '✨', gradient: ['#FFE5F1', '#F8E8FF'], color: '#FF6B9D' },
  { id: 'support', key: 'support', emoji: '🤝', gradient: ['#E8F4FD', '#F0F9FF'], color: '#06B6D4' },
  { id: 'celebration', key: 'celebration', emoji: '🎉', gradient: ['#FEF3C7', '#FEF7CD'], color: '#F59E0B' },
  { id: 'advice', key: 'advice', emoji: '💡', gradient: ['#ECFDF5', '#F0FDF4'], color: '#10B981' },
  { id: 'story', key: 'story', emoji: '📖', gradient: ['#F3E8FF', '#FAF5FF'], color: '#8B5CF6' },
  { id: 'question', key: 'question', emoji: '❓', gradient: ['#FFF1F2', '#FDF2F8'], color: '#EC4899' },
  { id: 'gratitude', key: 'gratitude', emoji: '🙏', gradient: ['#FFFBEB', '#FEF7CD'], color: '#D97706' },
];

export default function CommunityFeedScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState<typeof chips[number]['id']>('all');
  const [items, setItems] = React.useState<CommunityPost[]>([]);

  const fetchData = React.useCallback(async () => {
    const data = await listCommunityPosts({
      search: search || undefined,
      ordering: '-created_at',
      post_type: type !== 'all' ? (type as CommunityPostType) : undefined,
    });
    setItems(Array.isArray(data) ? data : []);
  }, [search, type]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchData();
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchData]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try { await fetchData(); } finally { setRefreshing(false); }
  }, [fetchData]);

  const getPostEmoji = (postType: string) => {
    const chip = chips.find(c => c.id === postType);
    return chip?.emoji || '💬';
  };

  const getPostGradient = (postType: string) => {
    const chip = chips.find(c => c.id === postType);
    return chip?.gradient || ['#FFE5F1', '#F8E8FF'];
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderItem = ({ item, index }: { item: CommunityPost; index: number }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/community/[id]', params: { id: String(item.id) } } as never)}
      style={[
        styles.postCard,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
      activeOpacity={0.9}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.postTypeIcon, { backgroundColor: getPostGradient(item.post_type)[0] + '40' }]}>
          <Text style={styles.postEmoji}>{getPostEmoji(item.post_type)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.postTypeBadge}>
            <Text style={[styles.postTypeText, { color: chips.find(c => c.id === item.post_type)?.color || '#FF6B9D' }]}>
              {(t as any)[item.post_type] || item.post_type}
            </Text>
          </View>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {item.created_at ? formatTimeAgo(item.created_at) : 'Now'}
          </Text>
        </View>
        <View style={[styles.postNumber, { backgroundColor: colors.background }]}>
          <Text style={[styles.postNumberText, { color: colors.textSecondary }]}>
            #{(index + 1).toString().padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <Text style={[styles.postTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {!!item.content && (
          <Text style={[styles.postPreview, { color: colors.textSecondary }]} numberOfLines={3}>
            {item.content}
          </Text>
        )}
      </View>

      {/* Card Footer - Engagement Stats */}
      <View style={styles.cardFooter}>
        <View style={styles.engagementStats}>
          <View style={[styles.statItem, { backgroundColor: colors.background }]}>
            <Ionicons name="chatbubbles" size={14} color="#06B6D4" />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {item.comment_count || 0}
            </Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.background }]}>
            <Ionicons name="heart" size={14} color="#EC4899" />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {item.reaction_count || 0}
            </Text>
          </View>
        </View>
        <Text style={styles.readMoreText}>Read more →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Community',
          headerTitleStyle: { fontSize: 24, fontWeight: '700' },
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/community/new' as never)} 
              style={styles.headerButton}
            >
              <LinearGradient
                colors={['#FF6B9D', '#C44569']}
                style={styles.headerButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )
        }} 
      />

      {/* Hero Section */}
      <LinearGradient
        colors={['#FFE5F1', '#F8E8FF', '#E8F4FD']}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.heroTitle}>💕 Our Safe Space</Text>
        <Text style={styles.heroSubtitle}>Share, support, and grow together</Text>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        {/* Search Box */}
        <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
          <Ionicons name="search-outline" size={20} color="#FF6B9D" />
          <TextInput
            placeholder="Search our community stories..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
          />
        </View>

        {/* Category Filters */}
        <Text style={[styles.filterLabel, { color: colors.text }]}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {chips.map(c => {
              const active = type === c.id;
              return (
                <TouchableOpacity 
                  key={c.id} 
                  onPress={() => setType(c.id)} 
                  style={[
                    styles.categoryChip, 
                    { 
                      backgroundColor: active ? c.color : colors.surface, 
                      borderColor: active ? c.color : colors.border 
                    }
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                  <Text style={[styles.categoryText, { color: active ? '#fff' : colors.text }]}>
                    {(t as any)[c.key]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading our community...
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#FF6B9D']}
              tintColor="#FF6B9D"
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {language === 'ka' ? 'ჯერჯერობით პოსტები არ არის' : 'No posts yet'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {language === 'ka' 
                  ? 'იყავი პირველი ვინც გააზიარებს სტორს' 
                  : 'Be the first to share your story'
                }
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    fontWeight: '500',
  },
  headerButton: {
    marginRight: 8,
  },
  headerButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  filterLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  postCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  postTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  postEmoji: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  postTypeBadge: {
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  postTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  postNumber: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  postNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    marginBottom: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 8,
  },
  postPreview: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engagementStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
});