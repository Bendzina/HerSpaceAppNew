import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { listEntries, JournalEntry } from '@/services/journalService';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';

export default function JournalScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();
  const { language } = useLanguage();

  const t = language === 'ka'
    ? {
        newEntry: 'ახალი ჩანაწერი',
        noEntries: 'ჩანაწერები არ არის. შექმენი პირველი!',
        untitled: 'უსათაურო',
      }
    : {
        newEntry: 'New Entry',
        noEntries: 'No entries yet. Create your first one!',
        untitled: 'Untitled',
      };

  const load = async () => {
    try {
      const data = await listEntries({ ordering: '-created_at' });
      setEntries(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load entries');
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await load();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-refresh when screen gains focus (after creating/editing/deleting)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try { await load(); } catch {}
      })();
      return () => { active = false; };
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ height: 20 }} />

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/journal/new-entry' as any)}
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>{t.newEntry}</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : error ? (
        <Text style={{ color: colors.error }}>{error}</Text>
      ) : entries.length === 0 ? (
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>{t.noEntries}</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          refreshing={loading}
          onRefresh={async () => {
            setLoading(true);
            await load();
            setLoading(false);
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.entryItem, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => router.push({ pathname: '/(tabs)/journal/[id]', params: { id: String(item.id) } } as any)}
            >
              <Text style={[styles.entryTitle, { color: colors.text }]} numberOfLines={1}>{item.title || t.untitled}</Text>
              {item.content ? (
                <Text style={[styles.entryPreview, { color: colors.textSecondary }]} numberOfLines={2}>{item.content}</Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center' },
  button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, marginTop: 12 },
  entryItem: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  entryTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  entryPreview: { fontSize: 14 },
});