// app/AppPreferencesScreen.tsx
import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View, SafeAreaView, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import { getReminderConfig, enableReminder, disableReminder, sendTestNotification } from '@/services/notificationService';

const { width } = Dimensions.get('window');

// translations ობიექტი
const translations = {
  en: {
    appPreferences: 'App Preferences',
    darkMode: 'Dark Mode',
    fontSize: 'Font Size',
    language: 'Language',
    english: 'English',
    georgian: 'Georgian',
    back: 'Back',
  },
  ka: {
    appPreferences: 'აპის პარამეტრები',
    darkMode: 'მუქი თემა',
    fontSize: 'ტექსტის ზომა',
    language: 'ენა',
    english: 'English',
    georgian: 'ქართული',
    back: 'უკან',
  },
};

export default function AppPreferencesScreen() {
  const router = useRouter();
  const { isDark, setIsDark } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  // Reminders state
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
  const [hour, setHour] = useState<number>(20);
  const [minute, setMinute] = useState<number>(0);
  const [savingReminder, setSavingReminder] = useState<boolean>(false);

  // Safe access to translations
  const currentTranslations = translations[language as keyof typeof translations] || translations.en;

  // Theme Toggle Handler
  const handleThemeToggle = (value: boolean) => {
    console.log('Theme toggle pressed:', value);
    setIsDark(value);
  };

  // Language Change Handler
  const handleLanguageChange = (newLanguage: 'en' | 'ka') => {
    console.log('Language change pressed:', newLanguage);
    setLanguage(newLanguage);
  };

  // Font Size Change Handler
  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    console.log('Font size changed:', size);
    setFontSize(size);
  };

  // Load reminder config
  React.useEffect(() => {
    (async () => {
      try {
        const cfg = await getReminderConfig();
        setReminderEnabled(cfg.enabled);
        setHour(cfg.hour);
        setMinute(cfg.minute);
      } catch (e) {
        // no-op
      }
    })();
  }, []);

  const onToggleReminder = async (value: boolean) => {
    setSavingReminder(true);
    try {
      if (value) {
        await enableReminder(hour, minute);
        setReminderEnabled(true);
        Alert.alert('', language === 'ka' ? 'შეხსენება ჩართულია' : 'Daily reminder enabled');
      } else {
        await disableReminder();
        setReminderEnabled(false);
        Alert.alert('', language === 'ka' ? 'შეხსენება გამორთულია' : 'Daily reminder disabled');
      }
    } catch (e: any) {
      Alert.alert('', e?.message || (language === 'ka' ? 'ვერ შევცვალე შეხსენება' : 'Failed to update reminder'));
    } finally {
      setSavingReminder(false);
    }
  };

  const adjustTime = (field: 'hour' | 'minute', delta: number) => {
    if (field === 'hour') setHour(h => (h + delta + 24) % 24);
    else setMinute(m => (m + delta + 60) % 60);
  };

  const onSaveReminderTime = async () => {
    if (!reminderEnabled) return;
    setSavingReminder(true);
    try {
      await enableReminder(hour, minute);
      Alert.alert('', language === 'ka' ? 'დრო განახლებულია' : 'Reminder time updated');
    } catch (e: any) {
      Alert.alert('', e?.message || (language === 'ka' ? 'ვერ შეიცვალა დრო' : 'Failed to update time'));
    } finally {
      setSavingReminder(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          title: currentTranslations.appPreferences 
        }} 
      />
      
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F0F23' : '#F8F9FA' }]}>
        {/* Header with gradient background */}
        <LinearGradient
          colors={isDark ? ['#1A1A2E', '#16213E', '#0F0F23'] : ['#E8F4FD', '#F0E8FF', '#FFE5F1']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF6B9D', '#C44569']}
              style={styles.backButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="arrow-back" size={20} color="#FFF" />
              <Text style={styles.backButtonText}>{currentTranslations.back}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <LinearGradient
                colors={['#667EEA', '#764BA2', '#F093FB']}
                style={styles.headerIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.headerIconText}>⚙️</Text>
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>{currentTranslations.appPreferences}</Text>
            <Text style={styles.headerSubtitle}>💫 Customize your experience</Text>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Theme Switch Card */}
          <View style={[styles.card, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? '#2D1B69' : '#FFE5F1' }]}>
                <Text style={styles.cardIconEmoji}>{isDark ? '🌙' : '☀️'}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
                  {currentTranslations.darkMode}
                </Text>
                <Text style={[styles.cardSubtitle, { color: isDark ? '#A0AEC0' : '#718096' }]}>
                  {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                thumbColor={isDark ? '#FF6B9D' : '#FFFFFF'}
                trackColor={{ false: '#CBD5E0', true: '#FF6B9D' }}
                ios_backgroundColor="#CBD5E0"
              />
            </View>
          </View>

          {/* Daily Reminder Card */}
          <View style={[styles.card, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? '#2D1B69' : '#FFE5F1' }]}>
                <Text style={styles.cardIconEmoji}>🔔</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
                  {language === 'ka' ? 'დღიური შეხსენება' : 'Daily Reminder'}
                </Text>
                <Text style={[styles.cardSubtitle, { color: isDark ? '#A0AEC0' : '#718096' }]}>
                  {reminderEnabled 
                    ? (language === 'ka' ? 'ჩართულია' : 'Enabled')
                    : (language === 'ka' ? 'გამორთულია' : 'Disabled')
                  }
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={onToggleReminder}
                disabled={savingReminder}
                thumbColor={reminderEnabled ? '#FF6B9D' : '#FFFFFF'}
                trackColor={{ false: '#CBD5E0', true: '#FF6B9D' }}
                ios_backgroundColor="#CBD5E0"
              />
            </View>

            {reminderEnabled && (
              <View style={styles.reminderTimeContainer}>
                <View style={styles.timeRow}>
                  <Text style={[styles.timeLabel, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
                    {language === 'ka' ? 'დრო:' : 'Time:'}
                  </Text>
                  <View style={styles.timeControls}>
                    <TouchableOpacity 
                      style={[styles.timeButton, { backgroundColor: isDark ? '#2D1B69' : '#F7FAFC' }]} 
                      onPress={() => adjustTime('hour', -1)} 
                      disabled={savingReminder}
                    >
                      <Text style={[styles.timeButtonText, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>-</Text>
                    </TouchableOpacity>
                    <View style={[styles.timeDisplay, { backgroundColor: isDark ? '#0F0F23' : '#F7FAFC' }]}>
                      <Text style={[styles.timeText, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
                        {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.timeButton, { backgroundColor: isDark ? '#2D1B69' : '#F7FAFC' }]} 
                      onPress={() => adjustTime('hour', +1)} 
                      disabled={savingReminder}
                    >
                      <Text style={[styles.timeButtonText, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.timeButton, { backgroundColor: isDark ? '#2D1B69' : '#F7FAFC' }]} 
                      onPress={() => adjustTime('minute', -5)} 
                      disabled={savingReminder}
                    >
                      <Text style={[styles.timeButtonText, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>-5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.timeButton, { backgroundColor: isDark ? '#2D1B69' : '#F7FAFC' }]} 
                      onPress={() => adjustTime('minute', +5)} 
                      disabled={savingReminder}
                    >
                      <Text style={[styles.timeButtonText, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>+5</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.reminderActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { marginRight: 8 }]}
                    onPress={onSaveReminderTime}
                    disabled={!reminderEnabled || savingReminder}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#48BB78', '#38A169']}
                      style={styles.actionButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="save" size={16} color="#FFF" />
                      <Text style={styles.actionButtonText}>
                        {language === 'ka' ? 'დროის შენახვა' : 'Save Time'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={async () => {
                      try {
                        await sendTestNotification();
                        Alert.alert('', language === 'ka' ? 'ტესტ შეტყობინება გაეგზავნა' : 'Test notification sent');
                      } catch (e: any) {
                        Alert.alert('', e?.message || (language === 'ka' ? 'ვერ გაიგზავნა ტესტ შეტყობინება' : 'Failed to send test notification'));
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#667EEA', '#764BA2']}
                      style={styles.actionButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="notifications" size={16} color="#FFF" />
                      <Text style={styles.actionButtonText}>
                        {language === 'ka' ? 'ტესტი' : 'Test'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Font Size Card */}
          <View style={[styles.card, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? '#2D1B69' : '#FFE5F1' }]}>
                <Text style={styles.cardIconEmoji}>📝</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
                  {currentTranslations.fontSize}
                </Text>
                <Text style={[styles.cardSubtitle, { color: isDark ? '#A0AEC0' : '#718096' }]}>
                  Current: {fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.optionsContainer}>
              {(['small', 'medium', 'large'] as const).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    { backgroundColor: isDark ? '#0F0F23' : '#F7FAFC' },
                    fontSize === size && styles.optionButtonActive,
                  ]}
                  onPress={() => handleFontSizeChange(size)}
                  activeOpacity={0.8}
                >
                  {fontSize === size && (
                    <LinearGradient
                      colors={['#FF6B9D', '#C44569']}
                      style={styles.optionButtonActiveGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={[
                        styles.optionText,
                        { 
                          fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18,
                          color: '#FFF'
                        }
                      ]}>A</Text>
                    </LinearGradient>
                  )}
                  {fontSize !== size && (
                    <Text style={[
                      styles.optionText,
                      { 
                        fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18,
                        color: isDark ? '#FFFFFF' : '#2D3748'
                      }
                    ]}>A</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Language Card */}
          <View style={[styles.card, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? '#2D1B69' : '#FFE5F1' }]}>
                <Text style={styles.cardIconEmoji}>🌐</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
                  {currentTranslations.language}
                </Text>
                <Text style={[styles.cardSubtitle, { color: isDark ? '#A0AEC0' : '#718096' }]}>
                  {language === 'ka' ? 'ქართული' : 'English'}
                </Text>
              </View>
            </View>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  { backgroundColor: isDark ? '#0F0F23' : '#F7FAFC' },
                  language === 'en' && styles.optionButtonActive,
                ]}
                onPress={() => handleLanguageChange('en')}
                activeOpacity={0.8}
              >
                {language === 'en' ? (
                  <LinearGradient
                    colors={['#FF6B9D', '#C44569']}
                    style={styles.languageOptionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.languageText, { color: '#FFF' }]}>
                      {currentTranslations.english}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={[styles.languageText, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
                    {currentTranslations.english}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageOption,
                  { backgroundColor: isDark ? '#0F0F23' : '#F7FAFC' },
                  language === 'ka' && styles.optionButtonActive,
                ]}
                onPress={() => handleLanguageChange('ka')}
                activeOpacity={0.8}
              >
                {language === 'ka' ? (
                  <LinearGradient
                    colors={['#FF6B9D', '#C44569']}
                    style={styles.languageOptionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.languageText, { color: '#FFF' }]}>
                      {currentTranslations.georgian}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={[styles.languageText, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
                    {currentTranslations.georgian}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    borderRadius: 25,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 6,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconContainer: {
    marginBottom: 16,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardIconEmoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  reminderTimeContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 107, 157, 0.1)',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    minWidth: 50,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    borderRadius: 20,
    shadowColor: '#48BB78',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 6,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  optionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonActive: {},
  optionButtonActiveGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontWeight: '700',
  },
  languageOption: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  languageOptionGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  languageText: {
    fontWeight: '600',
    fontSize: 16,
  },
});