import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { getRitualHistory, type RitualHistoryItem, type RitualHistoryResponse } from '@/services/wellnessService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RitualHistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [data, setData] = React.useState<RitualHistoryResponse | null>(null);

  const fetchData = React.useCallback(async () => {
    const resp = await getRitualHistory();
    setData(resp);
  }, []);

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

  const renderItem = ({ item }: { item: RitualHistoryItem }) => {
    const dt = new Date(item.used_at);
    const dateStr = dt.toLocaleDateString();
    const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.title, { color: colors.text }]}>{item.ritual_title}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{dateStr} • {timeStr}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center' }}>
          {typeof item.was_helpful === 'boolean' && (
            <View style={[styles.chip, { borderColor: 'transparent', backgroundColor: colors.surface }]}> 
              <Ionicons name={item.was_helpful ? 'happy' : 'sad'} size={14} color={colors.textSecondary} />
              <Text style={{ marginLeft: 6, color: colors.textSecondary, fontSize: 12 }}>
                {item.was_helpful ? 'Helpful' : 'Not really'}
              </Text>
            </View>
          )}
          {typeof item.effectiveness_rating === 'number' && (
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {[1,2,3,4,5].map(n => (
                <Ionicons key={n} name={n <= (item.effectiveness_rating || 0) ? 'star' : 'star-outline'} size={14} color={colors.primary} />
              ))}
            </View>
          )}
        </View>
        {!!item.notes && (
          <Text style={{ color: colors.textSecondary, marginTop: 6 }}>{item.notes}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: colors.background, paddingTop: insets.top + 6 }]}> 
        <TouchableOpacity onPress={() => router.replace('/rituals')} accessibilityLabel="Go back to rituals" style={{ paddingHorizontal: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.ritualHistory.myRituals}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={data?.history || []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={data ? (
            <View style={[styles.stats, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{data.stats.total_rituals_used}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.ritualHistory.total}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{data.stats.helpful_rituals}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.ritualHistory.helpful}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{data.stats.average_rating ?? '—'}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.ritualHistory.avgRating}</Text>
              </View>
            </View>
          ) : null}
          ListEmptyComponent={
            <View style={{ padding: 16 }}>
              <Text style={{ textAlign: 'center', color: colors.textSecondary }}>{t.ritualHistory.noHistory}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  stats: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  card: {
    padding: 14,
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
