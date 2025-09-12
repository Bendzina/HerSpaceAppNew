import React from 'react';
export const href = null;
import { useState } from 'react';

import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  ScrollView,
  Alert 
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { updateProfile } from '@/services/wellnessProfileService';

const { width, height } = Dimensions.get('window');

// Focus options with icons and colors
const focusOptions = [
  { 
    id: 'mindfulness', 
    icon: '🧘‍♀️',
    color: '#6BCF7F',
    label: { en: 'Mindfulness', ka: 'შინაგანი სიმშვიდე' },
    description: { 
      en: 'Find peace and presence in the moment', 
      ka: 'იპოვე სიმშვიდე და არსებობა ამ წუთში' 
    }
  },
  { 
    id: 'productivity', 
    icon: '⚡',
    color: '#FFD93D',
    label: { en: 'Productivity', ka: 'პროდუქტიულობა' },
    description: { 
      en: 'Boost your focus and get things done', 
      ka: 'გაზარდე ფოკუსი და გააკეთე საქმეები' 
    }
  },
  { 
    id: 'motherhood', 
    icon: '👶',
    color: '#FF9FB2',
    label: { en: 'Motherhood', ka: 'დედობა' },
    description: { 
      en: 'Navigate the beautiful journey of motherhood', 
      ka: 'იმოგზაურე დედობის მშვენიერ გზაზე' 
    }
  },
  { 
    id: 'healing', 
    icon: '💙',
    color: '#74A9FF',
    label: { en: 'Healing', ka: 'განკურნება' },
    description: { 
      en: 'Restore balance and inner harmony', 
      ka: 'აღდგინე ბალანსი და შინაგანი ჰარმონია' 
    }
  },
];

export default function FocusScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { language, t } = useLanguage();
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Add translations to language context
  const translations = {
    en: {
      title: 'What is your focus?',
      subtitle: 'Choose your path for today\'s journey of growth and self-discovery.',
      saveProgress: 'Save Progress',
      continue: 'Continue Journey',
      selectFocusFirst: 'Please select your focus first',
      progressSaved: 'Your focus has been saved ✨'
    },
    ka: {
      title: 'რა არის თქვენი ფოკუსი?',
      subtitle: 'აირჩიეთ თქვენი გზა დღევანდელი ზრდისა და თვითშემეცნებისთვის.',
      saveProgress: 'პროგრესის შენახვა',
      continue: 'მოგზაურობის გაგრძელება',
      selectFocusFirst: 'გთხოვთ პირველ ამოირჩიეთ ფოკუსი',
      progressSaved: 'თქვენი ფოკუსი შენახულია ✨'
    }
  };

  const currentTranslations = translations[language] || translations.en;

  const handleSaveProgress = async () => {
    if (!selectedFocus) {
      Alert.alert('', currentTranslations.selectFocusFirst);
      return;
    }
    try {
      // Persist focus to wellness profile
      await updateProfile({ current_mood_context: selectedFocus });
      setIsSaved(true);
      Alert.alert('', currentTranslations.progressSaved);
    } catch (e: any) {
      Alert.alert('', e?.message || 'Failed to save focus');
    } finally {
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleContinue = () => {
    if (!selectedFocus) {
      Alert.alert('', currentTranslations.selectFocusFirst);
      return;
    }
    router.push('/MoodScreen');
  };

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

  const selectedFocusObj = focusOptions.find(option => option.id === selectedFocus);

  return (
    <ScrollView style={containerStyle} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={titleStyle}>{currentTranslations.title}</Text>
        <Text style={subtitleStyle}>{currentTranslations.subtitle}</Text>
      </View>

      {/* Focus Options */}
      <View style={styles.optionsContainer}>
        {focusOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              { 
                backgroundColor: isDark ? '#2c2c2c' : '#ffffff',
                borderColor: selectedFocus === option.id ? option.color : (isDark ? '#404040' : '#e0e0e0'),
                borderWidth: selectedFocus === option.id ? 3 : 1,
              },
              selectedFocus === option.id && {
                transform: [{ scale: 1.02 }],
                shadowColor: option.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }
            ]}
            onPress={() => setSelectedFocus(option.id)}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: selectedFocus === option.id ? option.color + '20' : (isDark ? '#404040' : '#f5f5f5') }
              ]}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionLabel,
                  { 
                    color: selectedFocus === option.id ? option.color : (isDark ? '#ffffff' : '#333333'),
                    fontWeight: selectedFocus === option.id ? '700' : '600'
                  }
                ]}>
                  {option.label[language]}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  { color: isDark ? '#cccccc' : '#666666' }
                ]}>
                  {option.description[language]}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Focus Display */}
      {selectedFocusObj && (
        <View style={[
          styles.selectedFocusDisplay,
          { 
            backgroundColor: isDark ? '#2c2c2c' : '#ffffff',
            borderColor: selectedFocusObj.color 
          }
        ]}>
          <Text style={styles.selectedFocusIcon}>{selectedFocusObj.icon}</Text>
          <Text style={[
            styles.selectedFocusText,
            { color: isDark ? '#ffffff' : '#333333' }
          ]}>
            {language === 'ka' 
              ? `დღეს თქვენი ფოკუსია: ${selectedFocusObj.label[language]}`
              : `Today your focus is: ${selectedFocusObj.label[language]}`
            }
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
              opacity: selectedFocus ? 1 : 0.5 
            }
          ]}
          onPress={handleSaveProgress}
          disabled={!selectedFocus}
        >
          <Text style={[
            styles.saveButtonText,
            { 
              color: isSaved ? '#ffffff' : (isDark ? '#cccccc' : '#666666')
            }
          ]}>
            {isSaved 
              ? (language === 'ka' ? '✓ შენახულია' : '✓ Saved')
              : currentTranslations.saveProgress
            }
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            { 
              backgroundColor: selectedFocus ? '#8b5fbf' : '#cccccc',
              opacity: selectedFocus ? 1 : 0.5 
            }
          ]}
          onPress={handleContinue}
          disabled={!selectedFocus}
        >
          <Text style={styles.continueButtonText}>
            {currentTranslations.continue}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
        <Text style={[
          styles.progressText,
          { color: isDark ? '#cccccc' : '#666666' }
        ]}>
          {language === 'ka' ? 'ნაბიჯი 1 სამიდან' : 'Step 1 of 3'}
        </Text>
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
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  selectedFocusDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 30,
  },
  selectedFocusIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  selectedFocusText: {
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