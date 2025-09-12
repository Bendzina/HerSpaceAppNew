import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';
import { translations } from '@/i18n/translations';
import { listCommunityPosts, type CommunityPost, type CommunityPostType } from '@/services/communityService';

const chips: { id: 'all' | CommunityPostType; key: string }[] = [
  { id: 'all', key: 'all' },
  { id: 'support', key: 'support' },
  { id: 'celebration', key: 'celebration' },
  { id: 'advice', key: 'advice' },
  { id: 'story', key: 'story' },
  { id: 'question', key: 'question' },
  { id: 'gratitude', key: 'gratitude' },
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

  const renderItem = ({ item }: { item: CommunityPost }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/community/[id]', params: { id: String(item.id) } } as never)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      {!!item.content && (
        <Text style={{ color: colors.textSecondary, marginTop: 4 }} numberOfLines={3}>
          {item.content}
        </Text>
      )}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'center' }}>
        <View style={[styles.chip, { borderColor: 'transparent', backgroundColor: colors.surface }]}> 
          <Ionicons name="chatbubbles-outline" size={12} color={colors.textSecondary} />
          <Text style={{ marginLeft: 6, color: colors.textSecondary, fontSize: 12 }}>{item.comment_count || 0}</Text>
        </View>
        <View style={[styles.chip, { borderColor: 'transparent', backgroundColor: colors.surface }]}> 
          <Ionicons name="heart-outline" size={12} color={colors.textSecondary} />
          <Text style={{ marginLeft: 6, color: colors.textSecondary, fontSize: 12 }}>{item.reaction_count || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ 
        title: t.community,
        headerRight: () => (
          <TouchableOpacity onPress={() => router.push('/community/new' as never)} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="add" size={22} color={colors.text} />
          </TouchableOpacity>
        )
      }} />

      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            placeholder={t.searchPlaceholder}
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: colors.text, marginLeft: 8 }}
            returnKeyType="search"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {chips.map(c => {
              const active = type === c.id;
              return (
                <TouchableOpacity key={c.id} onPress={() => setType(c.id)} style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border }]}>
                  <Text style={{ color: active ? '#fff' : colors.text }}>{(t as any)[c.key]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={{ padding: 16 }}>
              <Text style={{ textAlign: 'center', color: colors.textSecondary }}>
                {language === 'ka' ? 'ჯერჯერობით პოსტები არ არის.' : 'No posts yet.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700' },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
