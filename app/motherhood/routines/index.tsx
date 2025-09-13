import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';
import { translations } from '@/i18n/translations';
import { listRoutines, type ChildcareRoutine } from '@/services/motherhoodRoutinesService';

const local = {
  en: { feeding: 'Feeding', sleep: 'Sleep', play: 'Play', health: 'Health', other: 'Other', empty: 'No routines yet. Tap + to add one.' },
  ka: { feeding: 'კვება', sleep: 'ძილი', play: 'თამაში', health: 'ჯანმრთელობა', other: 'სხვა', empty: 'ჯერჯერობით არ არის რუტინა. დაამატე +' },
};
const kinds = [
  { id: 'all' as const, labelKey: 'all' },
  { id: 'feeding' as const, labelKey: 'feeding' },
  { id: 'sleep' as const, labelKey: 'sleep' },
  { id: 'play' as const, labelKey: 'play' },
  { id: 'health' as const, labelKey: 'health' },
  { id: 'other' as const, labelKey: 'other' },
];

export default function RoutinesListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [kind, setKind] = React.useState<(typeof kinds)[number]['id']>('all');
  const [items, setItems] = React.useState<ChildcareRoutine[]>([]);

  const fetchData = React.useCallback(async () => {
    const data = await listRoutines({
      search: search || undefined,
      ordering: '-created_at',
      routine_type: kind === 'all' ? undefined : kind,
      is_active: true,
    });
    setItems(Array.isArray(data) ? data : []);
  }, [search, kind]);

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

  const renderItem = ({ item }: { item: ChildcareRoutine }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/motherhood/routines/edit', params: { id: String(item.id) } } as never)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        {!!item.time_of_day && (
          <View style={[styles.pill, { borderColor: colors.border }]}>
            <Ionicons name="time" size={12} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginLeft: 4, fontSize: 12 }}>{item.time_of_day}</Text>
          </View>
        )}
      </View>
      {!!item.description && (
        <Text numberOfLines={2} style={{ color: colors.textSecondary, marginTop: 6 }}>{item.description}</Text>
      )}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {!!item.routine_type && (
          <View style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.routine_type}</Text>
          </View>
        )}
        {!!item.duration_minutes && (
          <View style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.duration_minutes}m</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen 
        options={({ navigation }) => ({
          title: t.routines || 'Routines',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/motherhood/routines/edit' as never)} style={{ paddingHorizontal: 12 }}>
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
            {kinds.map(k => {
              const active = kind === k.id;
              return (
                <TouchableOpacity key={k.id} onPress={() => setKind(k.id)} style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border }]}>
                  <Text style={{ color: active ? '#fff' : colors.text }}>
                    {k.labelKey === 'all' ? t.all : (local[language as 'en' | 'ka'] || local.en)[k.labelKey as keyof typeof local.en]}
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
                {(local[language as 'en' | 'ka'] || local.en).empty}
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
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  searchBox: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
});
