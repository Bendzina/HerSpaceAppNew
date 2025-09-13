import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';
import { translations } from '@/i18n/translations';
import { listSupportGroups, type SupportGroup } from '@/services/motherhoodSupportService';

const types = [
  { id: 'all' as const, key: 'all' },
  { id: 'online' as const, key: 'online' },
  { id: 'local' as const, key: 'local' },
] as const;

export default function SupportGroupsList() {
  const { colors } = useTheme();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [kind, setKind] = React.useState<(typeof types)[number]['id']>('all');
  const [items, setItems] = React.useState<SupportGroup[]>([]);

  const fetchData = React.useCallback(async () => {
    const data = await listSupportGroups({
      search: search || undefined,
      ordering: '-created_at',
      group_type: kind === 'all' ? undefined : kind,
      is_active: true,
    });
    setItems(Array.isArray(data) ? data : []);
  }, [search, kind]);

  React.useEffect(() => {
    (async () => {
      try { setLoading(true); await fetchData(); } finally { setLoading(false); }
    })();
  }, [fetchData]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try { await fetchData(); } finally { setRefreshing(false); }
  }, [fetchData]);

  const renderItem = ({ item }: { item: SupportGroup }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/motherhood/support-groups/[id]', params: { id: String(item.id) } } as never)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
      {!!item.description && (
        <Text numberOfLines={2} style={{ color: colors.textSecondary, marginTop: 6 }}>{item.description}</Text>
      )}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {!!item.group_type && (
          <View style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.group_type}</Text>
          </View>
        )}
        {typeof item.current_members === 'number' && typeof item.max_members === 'number' && (
          <View style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <Ionicons name="people" size={12} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>{item.current_members}/{item.max_members}</Text>
          </View>
        )}
        {item.is_private ? (
          <View style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}> 
            <Ionicons name="lock-closed" size={12} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>Private</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen 
        options={({ navigation }) => ({
          title: t.supportGroups || 'Support Groups',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
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
            {types.map(k => {
              const active = kind === k.id;
              return (
                <TouchableOpacity key={k.id} onPress={() => setKind(k.id)} style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border }]}>
                  <Text style={{ color: active ? '#fff' : colors.text }}>{(t as any)[k.key]}</Text>
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
                {language === 'ka' ? 'ჯგუფები ვერ მოიძებნა.' : 'No groups found.'}
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
