import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listRituals, type Ritual } from '@/services/ritualService';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function RitualsScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  
  // Get translations for tones and phases
  const toneLabels = t.rituals.filters;
  const phaseLabels = t.rituals.phases;
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState('');
  
  const tones = [
    { id: 'all', label: toneLabels.all, emoji: '✨', gradient: ['#FFE5F1', '#F8E8FF'] },
    { id: 'gentle', label: toneLabels.gentle, emoji: '🌸', gradient: ['#FFE5F1', '#FFF0F5'] },
    { id: 'empowering', label: toneLabels.empowering, emoji: '💪', gradient: ['#FF6B9D', '#C44569'] },
    { id: 'grounding', label: toneLabels.grounding, emoji: '🌱', gradient: ['#8FBC8F', '#98D8C8'] },
    { id: 'uplifting', label: toneLabels.uplifting, emoji: '☀️', gradient: ['#F8B500', '#FFD700'] },
    { id: 'healing', label: toneLabels.healing, emoji: '💜', gradient: ['#DDA0DD', '#E6E6FA'] },
  ] as const;
  
  const phases = [
    { id: 'motherhood', label: phaseLabels.motherhood, emoji: '🤱', color: '#FF6B9D' },
    { id: 'any', label: phaseLabels.any, emoji: '🌟', color: '#8B5CF6' },
    { id: 'all', label: phaseLabels.all, emoji: '🌙', color: '#06B6D4' },
  ] as const;
  
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

  const getRitualEmoji = (ritualType: string) => {
    const emojiMap: { [key: string]: string } = {
      'meditation': '🧘‍♀️',
      'breathing': '🌬️',
      'movement': '💃',
      'journaling': '📝',
      'mindfulness': '🌺',
      'self-care': '🛁',
      'gratitude': '🙏',
      'affirmation': '💕',
      'default': '✨'
    };
    return emojiMap[ritualType.toLowerCase()] || emojiMap.default;
  };

  const renderItem = ({ item, index }: { item: Ritual; index: number }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/rituals/[id]', params: { id: String(item.id) } } as never)}
      style={[
        styles.ritualCard,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
      activeOpacity={0.9}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.ritualIcon}>
          <Text style={styles.ritualEmoji}>{getRitualEmoji(item.ritual_type)}</Text>
        </View>
        <View style={styles.durationBadge}>
          <Ionicons name="time-outline" size={12} color="#FF6B9D" />
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
            {item.duration_minutes} {t.rituals.minutes}
          </Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <Text style={[styles.ritualTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {!!item.description && (
          <Text numberOfLines={3} style={[styles.ritualDescription, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        )}
      </View>

      {/* Card Tags */}
      <View style={styles.tagsContainer}>
        <View style={[styles.toneTag, { backgroundColor: getToneColor(item.emotional_tone) }]}>
          <Text style={styles.tagText}>{item.emotional_tone}</Text>
        </View>
        <View style={[styles.typeTag, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.tagText, { color: colors.textSecondary }]}>{item.ritual_type}</Text>
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardNumber}>
          #{(index + 1).toString().padStart(2, '0')}
        </Text>
        <Text style={styles.startText}>{t.common.start}</Text>
      </View>
    </TouchableOpacity>
  );

  const getToneColor = (toneName: string) => {
    const tone = tones.find(t => t.label.toLowerCase() === toneName.toLowerCase());
    return tone ? tone.gradient[0] + '40' : '#FFE5F1';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: t.rituals.sacredRituals,
          headerTitleStyle: { fontSize: 24, fontWeight: '700' },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/rituals/history' } as never)}
              accessibilityLabel={t.rituals.openHistory}
              style={styles.headerButton}
            >
              <LinearGradient
                colors={['#FF6B9D', '#C44569']}
                style={styles.headerButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="time-outline" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Hero Section */}
      <LinearGradient
        colors={['#FFE5F1', '#F8E8FF', '#E8F4FD']}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.heroTitle}>{t.rituals.sacredRituals}</Text>
        <Text style={styles.heroSubtitle}>{t.rituals.nurtureYourSoul}</Text>
      </LinearGradient>

      {/* Search and filters */}
      <View style={styles.filtersContainer}>
        {/* Search Box */}
        <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={20} color="#FF6B9D" />
          <TextInput
            placeholder={t.rituals.searchYourPerfectRitual}
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={(t) => setSearch(t)}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
          />
        </View>

        {/* Life phase filter */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t.rituals.lifePhase}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {phases.map(p => {
              const active = phase === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setPhase(p.id)}
                  style={[
                    styles.phaseChip,
                    {
                      backgroundColor: active ? p.color : colors.surface,
                      borderColor: active ? p.color : colors.border,
                    }
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.phaseEmoji}>{p.emoji}</Text>
                  <Text style={[styles.phaseText, { color: active ? '#fff' : colors.text }]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Tone filter */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t.rituals.filterByTone}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {tones.map(t => {
              const active = tone === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTone(t.id)}
                  style={[
                    styles.toneChip,
                    {
                      backgroundColor: active ? t.gradient[0] : colors.surface,
                      borderColor: active ? t.gradient[0] : colors.border,
                    }
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.toneEmoji}>{t.emoji}</Text>
                  <Text style={[styles.toneText, { color: active ? '#2D3748' : colors.text }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Finding your perfect rituals...
          </Text>
        </View>
      ) : (
        <FlatList
          data={visible}
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
              <Text style={styles.emptyEmoji}>🌸</Text>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t.rituals.noRitualsFound}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Try adjusting your filters to discover new practices
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
    flex: 1 
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
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginTop: 8,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
  },
  phaseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  phaseEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toneEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  toneText: {
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
  ritualCard: {
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
  ritualIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ritualEmoji: {
    fontSize: 24,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE5F1',
  },
  durationText: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'SpaceMono',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    marginLeft: 16,
  },
  cardContent: {
    marginBottom: 16,
  },
  ritualTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 8,
  },
  ritualDescription: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toneTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.7,
  },
  startText: {
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