import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/app/LanguageContext';
import { useTheme } from '@/app/ThemeContext';
import { JournalEntry, listEntries } from '@/services/journalService';
import { Ionicons } from '@expo/vector-icons';

export default function JournalScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();
  const { language } = useLanguage();

  const t = language === 'ka'
    ? {
        myJournal: 'ჩემი დღიური',
        newEntry: '✨ ახალი ჩანაწერი',
        noEntries: 'შენი პირველი ისტორია აქ იქნება...',
        noEntriesSubtext: 'დაიწყე შენი მოგზაურობა',
        untitled: 'უსათაურო',
        manifestation: 'მანიფესტაცია',
        manifestationInstructions: 'დაწერე რა გინდა მოხდეს შენს ცხოვრებაში. იყავი დეტალური და დადებითი. რა ემოციებს გრძნობ? რა ხედავ?',
        asceticism: 'ასკეტიზმი',
        asceticismInstructions: 'აღწერე შენი დღევანდელი თავშეკავება ან დისციპლინა. რა გააკეთე სიმარტივისთვის? რა ისწავლე?',
      }
    : {
        myJournal: 'My Journal',
        newEntry: '✨ New Entry',
        noEntries: 'Your first story will be here...',
        noEntriesSubtext: 'Start your journey',
        untitled: 'Untitled',
        manifestation: 'Manifestation',
        manifestationInstructions: 'Write about what you want to manifest in your life. Be specific and positive. What emotions do you feel? What do you see?',
        asceticism: 'Asceticism',
        asceticismInstructions: 'Describe your daily discipline or self-restraint. What did you do for simplicity? What did you learn?',
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

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try { await load(); } catch {}
      })();
      return () => { active = false; };
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* New Entry Button */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/journal/new-entry' as any)}
        style={styles.newEntryButton}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FF6B9D', '#C44569', '#F8B500']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>{t.newEntry}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {/* Special Journal Sections */}
        <View style={styles.specialSections}>
          <TouchableOpacity
            style={[styles.specialCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push({ pathname: '/(tabs)/journal/new-entry', params: { type: 'manifestation' } } as any)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.specialIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.specialIconText}>🌟</Text>
            </LinearGradient>
            <View style={styles.specialContent}>
              <Text style={[styles.specialTitle, { color: colors.text }]}>{t.manifestation}</Text>
              <Text style={[styles.specialInstructions, { color: colors.textSecondary }]} numberOfLines={3}>
                {t.manifestationInstructions}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.specialCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push({ pathname: '/(tabs)/journal/new-entry', params: { type: 'asceticism' } } as any)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#48BB78', '#38A169']}
              style={styles.specialIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.specialIconText}>🧘‍♀️</Text>
            </LinearGradient>
            <View style={styles.specialContent}>
              <Text style={[styles.specialTitle, { color: colors.text }]}>{t.asceticism}</Text>
              <Text style={[styles.specialInstructions, { color: colors.textSecondary }]} numberOfLines={3}>
                {t.asceticismInstructions}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B9D" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading your memories...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>💔</Text>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📖</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.noEntries}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t.noEntriesSubtext}
            </Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            refreshing={loading}
            onRefresh={async () => {
              setLoading(true);
              await load();
              setLoading(false);
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.entryCard,
                  { backgroundColor: colors.card, borderColor: colors.border }
                ]}
                onPress={() => router.push({ 
                  pathname: '/(tabs)/journal/[id]', 
                  params: { id: String(item.id) } 
                } as any)}
                activeOpacity={0.9}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.dateContainer}>
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                      {item.created_at ? formatDate(item.created_at) : 'Today'}
                    </Text>
                  </View>
                  <View style={[styles.cardNumber, { backgroundColor: '#FFE5F1' }]}>
                    <Text style={styles.cardNumberText}>{(index + 1).toString().padStart(2, '0')}</Text>
                  </View>
                </View>

                {/* Card Content */}
                <View style={styles.cardContent}>
                  <Text style={[styles.entryTitle, { color: colors.text }]} numberOfLines={2}>
                    {item.title || t.untitled}
                  </Text>
                  {item.content && (
                    <Text style={[styles.entryPreview, { color: colors.textSecondary }]} numberOfLines={3}>
                      {item.content}
                    </Text>
                  )}
                </View>

                {/* Card Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.moodIndicator}>
                    <Text style={styles.moodEmoji}>✨</Text>
                  </View>
                  <Text style={[styles.readMore, { color: '#FF6B9D' }]}>Read more →</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 16,
  },
  newEntryButton: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 25,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  entryCard: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C44569',
  },
  cardContent: {
    marginBottom: 16,
  },
  entryTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 8,
  },
  entryPreview: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodIndicator: {
    backgroundColor: '#FFF5F5',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 16,
  },
  specialSections: {
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  specialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  specialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  specialIconText: {
    fontSize: 24,
  },
  specialContent: {
    flex: 1,
  },
  specialTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  specialInstructions: {
    fontSize: 14,
    lineHeight: 20,
  },
  readMore: {
    fontSize: 14,
    fontWeight: '600',
  },
});