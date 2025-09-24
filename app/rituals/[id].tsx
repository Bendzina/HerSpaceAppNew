import React from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';
import { translations } from '@/i18n/translations';
import { getRitual, type Ritual } from '@/services/ritualService';
import { Ionicons } from '@expo/vector-icons';
import { trackRitualUsage } from '@/services/wellnessService';

export default function RitualDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [loading, setLoading] = React.useState(true);
  const [ritual, setRitual] = React.useState<Ritual | null>(null);
  const [tracking, setTracking] = React.useState(false);
  // Inline completion controls (no overlay)
  const [wasHelpful, setWasHelpful] = React.useState<boolean | null>(null);
  const [rating, setRating] = React.useState<number>(0);
  const [notes, setNotes] = React.useState<string>('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await getRitual(id);
          setRitual(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Stack.Screen
        options={{
          title: ritual?.title || t.ritualDetails.notFound,
          headerTitleStyle: { color: colors.text },
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          headerBackTitle: '',
        }}/>

      <View style={[styles.header, { backgroundColor: colors.background, paddingTop: insets.top + 4 }]}> 
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back" style={{ paddingRight: 8, paddingVertical: 4 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : ritual ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {ritual.title}
          </Text>

          {/* Chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <View style={[styles.chip, { borderColor: 'transparent', backgroundColor: colors.surface }]}>
              <Ionicons name="leaf" size={12} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 6 }}>{ritual.emotional_tone}</Text>
            </View>
            <View style={[styles.chip, { borderColor: 'transparent', backgroundColor: colors.surface }]}>
              <Ionicons name="heart" size={12} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 6 }}>{ritual.for_life_phase}</Text>
            </View>
            <View style={[styles.chip, { borderColor: 'transparent', backgroundColor: colors.surface }]}>
              <Ionicons name="time" size={12} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 6 }}>{ritual.duration_minutes}m</Text>
            </View>
          </View>

          {/* Description */}
          {!!ritual.description && (
            <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: 10 }]}>
              {ritual.description}
            </Text>
          )}
      {/* Done + Rating Sheet */}
      {/* Inline completion controls */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={{ color: colors.textSecondary }}>{t.ritualDetails.helpful}</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <TouchableOpacity onPress={() => setWasHelpful(true)} style={[styles.choice, { borderColor: wasHelpful === true ? colors.primary : colors.border, backgroundColor: wasHelpful === true ? colors.primary + '22' : 'transparent' }]}>
            <Ionicons name="happy" size={18} color={wasHelpful === true ? colors.primary : colors.textSecondary} />
            <Text style={{ marginLeft: 6, color: colors.text }}>{t.ritualDetails.helpful}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setWasHelpful(false)} style={[styles.choice, { borderColor: wasHelpful === false ? colors.primary : colors.border, backgroundColor: wasHelpful === false ? colors.primary + '22' : 'transparent' }]}>
            <Ionicons name="sad" size={18} color={wasHelpful === false ? colors.primary : colors.textSecondary} />
            <Text style={{ marginLeft: 6, color: colors.text }}>{t.ritualDetails.notReally}</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: colors.textSecondary, marginTop: 14 }}>{t.ritualDetails.rate}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          {[1,2,3,4,5].map(n => (
            <TouchableOpacity key={n} onPress={() => setRating(n)} style={[styles.rateDot, { backgroundColor: n <= rating ? colors.primary : 'transparent', borderColor: colors.primary }]} />
          ))}
        </View>

        <Text style={{ color: colors.textSecondary, marginTop: 14 }}>{t.ritualDetails.notes}</Text>
        <TextInput
          placeholder={t.ritualDetails.notesPlaceholder}
          placeholderTextColor={colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
          style={[styles.notes, { color: colors.text, borderColor: colors.border }]}
          multiline
        />
      </View>

          {/* Content card */}
          <View style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={{ color: colors.text, lineHeight: 24, fontSize: 16 }}>
              {ritual.content}
            </Text>
          </View>

          {/* CTA: Start and Done (stacked) */}
          <View style={{ paddingHorizontal: 16, gap: 10, marginTop: 8 }}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: tracking ? 0.7 : 1 }]}
              activeOpacity={0.85}
              disabled={tracking}
              onPress={async () => {
                if (!ritual) return;
                try {
                  setTracking(true);
                  await trackRitualUsage({ ritual: ritual.id });
                } catch (e: any) {
                  Alert.alert('', e?.message || t.ritualDetails.failedStart);
                } finally {
                  setTracking(false);
                }
              }}
            >
              <Text style={styles.primaryBtnText}>{tracking ? t.ritualDetails.starting : t.ritualDetails.start}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: submitting ? 0.7 : 1 }]}
              activeOpacity={0.85}
              disabled={submitting}
              onPress={async () => {
                if (!ritual) return;
                setSubmitting(true);
                try {
                  await trackRitualUsage({
                    ritual: ritual.id,
                    was_helpful: wasHelpful ?? undefined,
                    effectiveness_rating: rating || undefined,
                    notes: notes || undefined,
                  });
                  Alert.alert('', t.ritualDetails.saved);
                } catch (e: any) {
                  Alert.alert('', e?.message || t.ritualDetails.failedSave);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <Text style={styles.primaryBtnText}>{submitting ? t.ritualDetails.saving : t.ritualDetails.done}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>{t.ritualDetails.notFound}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  title: { fontSize: 28, fontWeight: '800' },
  chip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: { fontSize: 13 },
  contentCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  primaryBtn: {
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  // Sheet styles
  sheetOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700' },
  choice: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  notes: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
