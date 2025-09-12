import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listRituals, type Ritual } from '@/services/ritualService';
import { useTheme } from './ThemeContext';
import { Stack, useRouter } from 'expo-router';

const tones = [
  { id: 'all', label: 'All' },
  { id: 'gentle', label: 'Gentle' },
  { id: 'empowering', label: 'Empowering' },
  { id: 'grounding', label: 'Grounding' },
  { id: 'uplifting', label: 'Uplifting' },
  { id: 'healing', label: 'Healing' },
] as const;

const phases = [
  { id: 'motherhood', label: 'Motherhood' },
  { id: 'any', label: 'Any' },
  { id: 'all', label: 'All' },
] as const;

export default function RitualsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [tone, setTone] = React.useState<(typeof tones)[number]['id']>('all');
  const [phase, setPhase] = React.useState<(typeof phases)[number]['id']>('motherhood');
  const [items, setItems] = React.useState<Ritual[]>([]);

  const fetchData = React.useCallback(async () => {
    const data = await listRituals({
      ordering: '-created_at',
      search: search || undefined,
      for_life_phase: phase,
      emotional_tone: tone,
    });
    setItems(Array.isArray(data) ? data : []);
  }, [search, phase, tone]);

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

  const visible = items;

  const renderItem = ({ item }: { item: Ritual }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/rituals/[id]', params: { id: String(item.id) } } as never)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <View style={[styles.pill, { borderColor: colors.border }]}> 
          <Ionicons name="time" size={12} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, marginLeft: 4, fontSize: 12 }}>{item.duration_minutes}m</Text>
        </View>
      </View>
      {!!item.description && (
        <Text numberOfLines={2} style={[styles.subtitle, { color: colors.textSecondary }]}>{item.description}</Text>
      )}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <View style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.emotional_tone}</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.ritual_type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Stack.Screen
        options={{
          title: 'Rituals',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/rituals/history' } as never)}
              accessibilityLabel="Open history"
              style={{ paddingHorizontal: 12 }}
            >
              <Ionicons name="time" size={20} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      {/* Search and filters */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Search rituals... (server)"
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={(t) => setSearch(t)}
            style={{ flex: 1, color: colors.text, marginLeft: 8 }}
            returnKeyType="search"
          />
        </View>
        {/* Life phase filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {phases.map(p => {
              const active = phase === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setPhase(p.id)}
                  style={[styles.filterChip, {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  }]}
                >
                  <Text style={{ color: active ? '#fff' : colors.text }}>{p.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {tones.map(t => {
              const active = tone === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTone(t.id)}
                  style={[styles.filterChip, {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  }]}
                >
                  <Text style={{ color: active ? '#fff' : colors.text }}>{t.label}</Text>
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
          data={visible}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={{ padding: 16 }}>
              <Text style={{ textAlign: 'center', color: colors.textSecondary }}>No rituals found.</Text>
            </View>
          }
        />
      )}

      {/* Detail handled via /rituals/[id] screen */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  detailSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  detailTitle: { fontSize: 18, fontWeight: '700' },
});
