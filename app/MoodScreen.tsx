import React, { useState } from "react";
export const href = null;
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ScrollView,
  TextInput,
  Alert 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { createMoodCheckIn, updateMoodCheckIn, listMoodCheckIns, type EmotionalSupportOption, type MoodCheckIn } from "@/services/moodService";
import { getProfile } from "@/services/wellnessProfileService";
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { translations as sharedTranslations } from '@/i18n/translations';

const { width, height } = Dimensions.get('window');

// Translation types
type TranslationKeys = 
  | 'moodTitle' 
  | 'moodSubtitle' 
  | 'saveProgress' 
  | 'next' 
  | 'selectMoodFirst'
  | 'progressSaved';

type Translations = Record<'en' | 'ka', Record<TranslationKeys, string>>;

const translations: Translations = {
  en: {
    moodTitle: 'How are you feeling today?',
    moodSubtitle: 'Your emotions matter. Take a moment to check in with yourself.',
    saveProgress: 'Save Progress',
    next: 'Continue Journey',
    selectMoodFirst: 'Please select your mood first',
    progressSaved: 'Your mood has been saved ✨'
  },
  ka: {
    moodTitle: 'როგორ გრძნობთ თავს დღეს?',
    moodSubtitle: 'თქვენი ემოციები მნიშვნელოვანია. დაუთმეთ დრო საკუთარ თავთან ურთიერთობას.',
    saveProgress: 'პროგრესის შენახვა',
    next: 'მოგზაურობის გაგრძელება',
    selectMoodFirst: 'გთხოვთ პირველ ამოირჩიეთ გუნება',
    progressSaved: 'თქვენი გუნება შენახულია ✨'
  },
};

const moods = [
  // Must match backend MOOD_CHOICES: happy, sad, anxious, calm
  { id: 'happy', emoji: '😊', color: '#FFD93D' },
  { id: 'calm', emoji: '😌', color: '#6BCF7F' },
  { id: 'sad', emoji: '😔', color: '#74A9FF' },
  { id: 'anxious', emoji: '😰', color: '#FFAB40' },
] as const;

// removed duplicate moodLabel helper; see later definition using a narrowed 'lang'

export default function MoodScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createdId, setCreatedId] = useState<MoodCheckIn["id"] | null>(null);
  const [recent, setRecent] = useState<MoodCheckIn[]>([]);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(false);

  // Step 3 state
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [needsToday, setNeedsToday] = useState<string>("");
  const [gratitudeMoment, setGratitudeMoment] = useState<string>("");
  const [supportNeeded, setSupportNeeded] = useState<EmotionalSupportOption | null>(null);

  const currentTranslations = translations[language] || translations.en;

  const refreshRecent = async () => {
    try {
      setLoadingRecent(true);
      const rows = await listMoodCheckIns({ ordering: '-created_at' });
      setRecent(Array.isArray(rows) ? rows.slice(0, 5) : []);
    } catch (e) {
      // silently ignore in UI; can add toasts if desired
    } finally {
      setLoadingRecent(false);
    }
  };

  React.useEffect(() => {
    refreshRecent();
  }, []);

  const handleSaveProgress = async () => {
    if (!selectedMood || isSaving) {
      if (!selectedMood) Alert.alert('', currentTranslations.selectMoodFirst);
      return;
    }
    try {
      setIsSaving(true);
      const result = await createMoodCheckIn({ mood: selectedMood });
      setCreatedId(result?.id ?? null);
      setIsSaved(true);
      Alert.alert('', currentTranslations.progressSaved);
      // Redirect to Motherhood if profile focus is motherhood
      try {
        const profile = await getProfile();
        if (String(profile?.current_mood_context || '').toLowerCase() === 'motherhood') {
          router.replace('/motherhood');
          return;
        }
      } catch {}
      setTimeout(() => setIsSaved(false), 2000);
      refreshRecent();
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('already submitted') || msg.includes('already') || msg.includes('unique')) {
        Alert.alert('', 'You have already submitted today\'s mood.');
      } else {
        Alert.alert('', msg || 'Failed to save mood');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitDetails = async () => {
    if (!selectedMood) {
      Alert.alert('', currentTranslations.selectMoodFirst);
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        mood: selectedMood,
        energy_level: energyLevel ?? null,
        needs_today: needsToday.trim() || null,
        gratitude_moment: gratitudeMoment.trim() || null,
        emotional_support_needed: supportNeeded ?? null,
      } as const;

      if (createdId != null) {
        await updateMoodCheckIn(createdId, payload);
      } else {
        const created = await createMoodCheckIn(payload);
        setCreatedId(created.id);
      }
      Alert.alert('', language === 'ka' ? 'დეტალები შენახულია ✨' : 'Details saved ✨');
      // Redirect to Motherhood if profile focus is motherhood
      try {
        const profile = await getProfile();
        if (String(profile?.current_mood_context || '').toLowerCase() === 'motherhood') {
          router.replace('/motherhood');
          return;
        }
      } catch {}
      refreshRecent();
    } catch (e: any) {
      const msg = String(e?.message || '');
      Alert.alert('', msg || (language === 'ka' ? 'შენახვა ვერ მოხერხდა' : 'Failed to save'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (!selectedMood) {
      Alert.alert('', currentTranslations.selectMoodFirst);
      return;
    }
    
    if (focus === 'motherhood') {
      router.push('/motherhood');
    } else {
      router.push('/NotificationsScreen');
    }
  };

  const handleContinue = handleNext;

  // Dynamic styles based on theme
  const containerStyle = [
    styles.container,
    { backgroundColor: isDark ? '#1a1a1a' : '#f8f6f3' }
  ];

  const titleStyle = [
    styles.title,
    { color: isDark ? '#ffffff' : '#2c2c2c' }
  ];

  const subtitleStyle = [
    styles.subtitle,
    { color: isDark ? '#cccccc' : '#666666' }
  ];

  const selectedMoodObj = moods.find(mood => mood.id === selectedMood);
  const moodLabel = (id: string) => {
    const lang = language === 'ka' ? 'ka' : 'en';
    switch (id) {
      case 'happy':
        return sharedTranslations[lang].moodHappy;
      case 'calm':
        return sharedTranslations[lang].moodCalm;
      case 'sad':
        return sharedTranslations[lang].moodSad;
      case 'anxious':
        return sharedTranslations[lang].moodAnxious;
      case 'neutral':
        return lang === 'ka' ? 'ნეიტრალური' : 'Neutral';
      case 'stressed':
        return lang === 'ka' ? 'სტრესული' : 'Stressed';
      default:
        return id;
    }
  };

  return (
    <ScrollView style={containerStyle} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={titleStyle}>{currentTranslations.moodTitle}</Text>
        <Text style={subtitleStyle}>{currentTranslations.moodSubtitle}</Text>
      </View>

      {/* Mood Selection Grid */}
      <View style={styles.moodGrid}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodOption,
              { 
                backgroundColor: isDark ? '#2c2c2c' : '#ffffff',
                borderColor: selectedMood === mood.id ? mood.color : (isDark ? '#404040' : '#e0e0e0'),
                borderWidth: selectedMood === mood.id ? 3 : 1,
              },
              selectedMood === mood.id && { 
                transform: [{ scale: 1.05 }],
                shadowColor: mood.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }
            ]}
            onPress={() => setSelectedMood(mood.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[
              styles.moodLabel,
              { 
                color: selectedMood === mood.id ? mood.color : (isDark ? '#ffffff' : '#333333'),
                fontWeight: selectedMood === mood.id ? '700' : '500'
              }
            ]}>
              {moodLabel(mood.id)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Mood Display */}
      {selectedMoodObj && (
        <View style={[
          styles.selectedMoodDisplay,
          { 
            backgroundColor: isDark ? '#2c2c2c' : '#ffffff',
            borderColor: selectedMoodObj.color 
          }
        ]}>
          <Text style={styles.selectedMoodEmoji}>{selectedMoodObj.emoji}</Text>
          <Text style={[
            styles.selectedMoodText,
            { color: isDark ? '#ffffff' : '#333333' }
          ]}>
            {language === 'ka'
              ? `დღეს შენი გუნება არის: ${moodLabel(selectedMoodObj.id).toLowerCase()}`
              : `You're feeling ${moodLabel(selectedMoodObj.id).toLowerCase()} today`}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { 
              backgroundColor: isSaved ? '#4CAF50' : (isDark ? '#404040' : '#e0e0e0'),
              opacity: selectedMood ? 1 : 0.5 
            }
          ]}
          onPress={handleSaveProgress}
          disabled={!selectedMood}
        >
          <Text style={[
            styles.saveButtonText,
            { 
              color: isSaved ? '#ffffff' : (isDark ? '#cccccc' : '#666666')
            }
          ]}>
            {isSaved ? '✓ Saved' : currentTranslations.saveProgress}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            { 
              backgroundColor: selectedMood ? '#8b5fbf' : '#cccccc',
              opacity: selectedMood ? 1 : 0.5 
            }
          ]}
          onPress={handleContinue}
          disabled={!selectedMood || isSaving}
        >
          <Text style={styles.continueButtonText}>
            {currentTranslations.next}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={[
          styles.progressText,
          { color: isDark ? '#cccccc' : '#666666' }
        ]}>
          Step 2 of 3
        </Text>
      </View>

      {/* Step 3: Gentle Details */}
      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#2c2c2c', fontSize: 22, marginBottom: 10 }]}>
          {language === 'ka' ? 'ნაბიჯი 3: დეტალები (სურვილისამებრ)' : 'Step 3: Gentle details (optional)'}
        </Text>

        {/* Energy level selector */}
        <Text style={[styles.subtitle, { color: isDark ? '#cccccc' : '#666666', marginBottom: 8 }]}>
          {language === 'ka' ? 'ენერგიის დონე' : 'Energy level'}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          {[1,2,3,4,5].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              onPress={() => setEnergyLevel(lvl)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: energyLevel === lvl ? '#8b5fbf' : (isDark ? '#2c2c2c' : '#ffffff'),
                borderWidth: 1,
                borderColor: energyLevel === lvl ? '#8b5fbf' : (isDark ? '#404040' : '#e0e0e0'),
              }}
              disabled={isSaving}
            >
              <Text style={{ color: energyLevel === lvl ? '#fff' : (isDark ? '#fff' : '#333') }}>{lvl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Needs today */}
        <Text style={[styles.subtitle, { color: isDark ? '#cccccc' : '#666666', marginBottom: 8 }]}>
          {language === 'ka' ? 'რას გრძნობ რომ გჭირდება დღეს?' : 'What do you need today?'}
        </Text>
        <TextInput
          value={needsToday}
          onChangeText={setNeedsToday}
          placeholder={language === 'ka' ? 'მაგ: დრო საკუთარ თავთან, მოთმინება...' : 'e.g., time for myself, patience...'}
          placeholderTextColor={isDark ? '#888888' : '#999999'}
          multiline
          style={{
            minHeight: 90,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? '#404040' : '#e0e0e0',
            backgroundColor: isDark ? '#2c2c2c' : '#ffffff',
            color: isDark ? '#ffffff' : '#333333',
            marginBottom: 16,
            textAlignVertical: 'top'
          }}
          editable={!isSaving}
        />

        {/* Gratitude */}
        <Text style={[styles.subtitle, { color: isDark ? '#cccccc' : '#666666', marginBottom: 8 }]}>
          {language === 'ka' ? 'რისთვის ხარ მადლიერი?' : 'A moment of gratitude'}
        </Text>
        <TextInput
          value={gratitudeMoment}
          onChangeText={setGratitudeMoment}
          placeholder={language === 'ka' ? 'მაგ: დილის მზე, თბილი ყავა...' : 'e.g., morning sun, warm coffee...'}
          placeholderTextColor={isDark ? '#888888' : '#999999'}
          multiline
          style={{
            minHeight: 90,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? '#404040' : '#e0e0e0',
            backgroundColor: isDark ? '#2c2c2c' : '#ffffff',
            color: isDark ? '#ffffff' : '#333333',
            marginBottom: 16,
            textAlignVertical: 'top'
          }}
          editable={!isSaving}
        />

        {/* Emotional support needed */}
        <Text style={[styles.subtitle, { color: isDark ? '#cccccc' : '#666666', marginBottom: 8 }]}>
          {language === 'ka' ? 'რა სახის მხარდაჭერა გჭირდება?' : 'What kind of support would help?'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {[
            { k: 'listening', l: language === 'ka' ? 'მომისმინე' : 'Listening' },
            { k: 'guidance', l: language === 'ka' ? 'რბილი რჩევა' : 'Guidance' },
            { k: 'encouragement', l: language === 'ka' ? 'შთავეგონე' : 'Encouragement' },
            { k: 'grounding', l: language === 'ka' ? 'დამეყრდენი' : 'Grounding' },
            { k: 'celebration', l: language === 'ka' ? 'გავიხაროთ' : 'Celebration' },
          ].map((opt) => {
            const active = supportNeeded === (opt.k as EmotionalSupportOption);
            return (
              <TouchableOpacity
                key={opt.k}
                onPress={() => setSupportNeeded(opt.k as EmotionalSupportOption)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  backgroundColor: active ? '#8b5fbf' : (isDark ? '#2c2c2c' : '#ffffff'),
                  borderWidth: 1,
                  borderColor: active ? '#8b5fbf' : (isDark ? '#404040' : '#e0e0e0'),
                  marginRight: 6,
                  marginBottom: 6,
                }}
                disabled={isSaving}
              >
                <Text style={{ color: active ? '#fff' : (isDark ? '#fff' : '#333'), fontWeight: '600' }}>{opt.l}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: '#8b5fbf', opacity: isSaving ? 0.6 : 1 }]}
          disabled={isSaving}
          onPress={handleSubmitDetails}
        >
          <Text style={styles.continueButtonText}>{language === 'ka' ? 'დასრულება' : 'Finish'}</Text>
        </TouchableOpacity>

        {(createdId !== null) && (
          <View
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? '#404040' : '#e0e0e0',
              backgroundColor: isDark ? '#1f1f1f' : '#fafafa',
            }}
          >
            <Text style={{ fontWeight: '700', marginBottom: 8, color: isDark ? '#fff' : '#333' }}>
              {language === 'ka' ? 'დღევანდელი ჩანაწერი' : "Today's entry"}
            </Text>
            <View style={{ gap: 4 }}>
              <Text style={{ color: isDark ? '#ddd' : '#444' }}>
                {language === 'ka' ? 'განწყობა: ' : 'Mood: '}
                <Text style={{ fontWeight: '600' }}>{selectedMood}</Text>
              </Text>
              {energyLevel != null && (
                <Text style={{ color: isDark ? '#ddd' : '#444' }}>
                  {language === 'ka' ? 'ენერგიის დონე: ' : 'Energy level: '}
                  <Text style={{ fontWeight: '600' }}>{energyLevel}</Text>
                </Text>
              )}
              {!!needsToday.trim() && (
                <Text style={{ color: isDark ? '#ddd' : '#444' }}>
                  {language === 'ka' ? 'საჭიროება: ' : 'Need: '}
                  <Text style={{ fontWeight: '600' }}>{needsToday.trim()}</Text>
                </Text>
              )}
              {!!gratitudeMoment.trim() && (
                <Text style={{ color: isDark ? '#ddd' : '#444' }}>
                  {language === 'ka' ? 'მადლიერება: ' : 'Gratitude: '}
                  <Text style={{ fontWeight: '600' }}>{gratitudeMoment.trim()}</Text>
                </Text>
              )}
              {supportNeeded && (
                <Text style={{ color: isDark ? '#ddd' : '#444' }}>
                  {language === 'ka' ? 'მხარდაჭერა: ' : 'Support: '}
                  <Text style={{ fontWeight: '600' }}>{supportNeeded}</Text>
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Recent check-ins */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontWeight: '700', marginBottom: 8, color: isDark ? '#fff' : '#333' }}>
            {language === 'ka' ? 'ბოლო ჩანაწერები' : 'Recent check-ins'}
          </Text>
          {loadingRecent ? (
            <Text style={{ color: isDark ? '#ccc' : '#666' }}>
              {language === 'ka' ? 'იტვირთება...' : 'Loading...'}
            </Text>
          ) : recent.length === 0 ? (
            <Text style={{ color: isDark ? '#ccc' : '#666' }}>
              {language === 'ka' ? 'ჯერჯერობით არ არის ჩანაწერი' : 'No entries yet'}
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {recent.map((r) => (
                <View
                  key={String(r.id)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: isDark ? '#404040' : '#e0e0e0',
                    backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
                  }}
                >
                  <Text style={{ color: isDark ? '#fff' : '#333', fontWeight: '600' }}>
                    {String(r.mood)} • {new Date(r.date).toLocaleDateString()}
                  </Text>
                  {typeof r.energy_level === 'number' && (
                    <Text style={{ color: isDark ? '#ddd' : '#555' }}>
                      {language === 'ka' ? 'ენერგია: ' : 'Energy: '}{r.energy_level}
                    </Text>
                  )}
                  {!!r.notes && (
                    <Text style={{ color: isDark ? '#ccc' : '#666' }}>{r.notes}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    minHeight: height,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 50,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 10,
    fontWeight: '400',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  moodOption: {
    width: (width - 60) / 2,
    aspectRatio: 1.2,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    padding: 15,
  },
  moodEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  moodLabel: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedMoodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 30,
  },
  selectedMoodEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  selectedMoodText: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  buttonSection: {
    gap: 15,
    marginBottom: 30,
  },
  saveButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: 18,
    paddingHorizontal: 80,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#8b5fbf',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  progressBar: {
    width: width * 0.6,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5fbf',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
});