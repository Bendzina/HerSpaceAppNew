import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';
import { translations } from '@/i18n/translations';
import { listJournal, type MotherhoodJournalEntry } from '@/services/motherhoodJournalService';

const moods = [
  { id: 'all' as const, key: 'all' },
  { id: 'happy' as const, key: 'moodHappy' },
  { id: 'calm' as const, key: 'moodCalm' },
  { id: 'sad' as const, key: 'moodSad' },
  { id: 'anxious' as const, key: 'moodAnxious' },
] as const;

export default function MotherhoodJournalList() {
  const { colors } = useTheme();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [mood, setMood] = React.useState<(typeof moods)[number]['id']>('all');
  const [items, setItems] = React.useState<MotherhoodJournalEntry[]>([]);

  const fetchData = React.useCallback(async () => {
    const data = await listJournal({
      search: search || undefined,
      ordering: '-created_at',
      mood: mood === 'all' ? undefined : (mood as any),
    });
    setItems(Array.isArray(data) ? data : []);
  }, [search, mood]);

  React.useEffect(() => {
    (async () => {
      try { setLoading(true); await fetchData(); } finally { setLoading(false); }
    })();
  }, [fetchData]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try { await fetchData(); } finally { setRefreshing(false); }
  }, [fetchData]);

  const renderItem = ({ item }: { item: MotherhoodJournalEntry }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/motherhood/journal/new', params: { id: String(item.id) } } as never)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      {!!item.content && (
        <Text numberOfLines={2} style={{ color: colors.textSecondary, marginTop: 6 }}>{item.content}</Text>
      )}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {!!item.mood && (
          <View style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{String(item.mood)}</Text>
          </View>
        )}
        {!!item.created_at && (
          <View style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <Ionicons name="time" size={12} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen 
        options={({ navigation }) => ({
          title: t.journal || 'Journal',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/motherhood/journal/new' as never)} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="add" size={22} color={colors.text} />
            </TouchableOpacity>
          )
        })}
      />

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
            {moods.map(m => {
              const active = mood === m.id;
              return (
                <TouchableOpacity key={m.id} onPress={() => setMood(m.id)} style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border }]}>
                  <Text style={{ color: active ? '#fff' : colors.text }}>
                    {m.key === 'all' ? t.all : (t as any)[m.key]}
                  </Text>
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
                {language === 'ka' ? 'ჯერჯერობით არ არის ჩანაწერი. დაწერე ახალი +' : 'No entries yet. Tap + to write one.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700' },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  searchBox: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
});
