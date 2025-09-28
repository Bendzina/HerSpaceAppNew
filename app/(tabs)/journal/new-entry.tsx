import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createEntry } from '@/services/journalService';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function NewEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params.type as string;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const { colors } = useTheme();
  const { language } = useLanguage();

  const t = language === 'ka'
    ? {
        header: 'ახალი დღიურის ჩანაწერი',
        title: 'სათაური',
        titlePh: 'სათაური (არასავალდებულო)',
        content: 'შინაარსი',
        contentPh: 'ჩაწერე შენი აზრები...',
        missingTitle: 'შინაარსი აკლია',
        missingMsg: 'გთხოვ, ჩაწერო სათაური ან შინაარსი.',
        create: 'ჩანაწერის შექმნა',
        manifestationInstructions: 'პრაქტიკა: მოძებნე მშვიდი ადგილი, სადაც არავინ შეგაწყვეტინებს. ღრმად ჩაისუნთქე რამდენჯერმე და დაამშვიდე გონება. ჩაიწერე, რა გსურს რეალურად — მიზანი ან ოცნება. იყავი მაქსიმალურად კონკრეტული. წარმოიდგინე, რომ ეს უკვე ხდება: რას ხედავ, რას გრძნობ, რას ისმენ? შექმენი მოკლე აფირმაცია (მაგ.: „მე ღირსი ვარ წარმატებისა და სიმდიდრის"). გაიმეორე აფირმაცია 3–5-ჯერ ფოკუსითა და ემოციით. დახუჭე თვალები და იგრძენი მადლიერება, თითქოს უკვე ახდა. რჩევა: გაიმეორე ყოველდღე, განსაკუთრებით დილით ან ძილის წინ.',
        asceticismInstructions: 'პრაქტიკა: აირჩიე კონკრეტული ასკეზა/დისციპლინა (მაგ.: შაქრის გარეშე, ცივი შხაპი, დიჯიტალური პაუზა). განსაზღვრე ხანგრძლივობა (მაგ.: 7 დღე, 30 დღე). მკაფიოდ ჩამოწერე შენი განზრახვა: „7 დღის განმავლობაში თავს შევიკავებ შაქრისგან, რათა გავაძლიერო ნებისყოფა." ყოველდღე მონიშნე პროგრესი: შესრულებული / გამოტოვებული / შენიშვნები. ცდუნების დროს გაიხსენე, რატომ დაიწყე ეს პრაქტიკა. პერიოდის ბოლოს გაიფიქრე: რა ისწავლე, როგორ იგრძენი თავი, რა შეიცვალა? რჩევა: დაიწყე მცირე ნაბიჯით. ერთი კვირაც საკმარისია, რომ ენერგია დაიძრას.',
      }
    : {
        header: 'New Journal Entry',
        title: 'Title',
        titlePh: 'Title (optional)',
        content: 'Content',
        contentPh: 'Write your thoughts...',
        missingTitle: 'Missing content',
        missingMsg: 'Please enter a title or some content.',
        create: 'Create Entry',
        manifestationInstructions: 'Practice: Find a quiet space where you won\'t be disturbed. Take a few deep breaths and calm your mind. Write down what you truly want — your goal or dream. Be as specific as possible. Visualize yourself already living this reality: what do you see, feel, hear? Create a short affirmation (e.g., "I am worthy of success and abundance"). Repeat this affirmation 3–5 times with focus and emotion. Close your eyes and hold gratitude as if it has already happened. Tip: Repeat the practice daily, preferably in the morning or before sleep.',
        asceticismInstructions: 'Practice: Choose a specific area of discipline (e.g., no sugar, cold showers, digital detox). Define the duration (e.g., 7 days, 30 days). Write down your intention clearly: "For 7 days I avoid sugar to strengthen my willpower." Each day, track your progress: completed / skipped / notes. When you feel tempted, remind yourself why you chose this practice. At the end of the period, reflect: what did you learn, how did you feel, what changed? Tip: Start small. One week is enough to build momentum.',
      };

  const getTypeTheme = () => {
    if (type === 'manifestation') {
      return {
        gradient: ['#667EEA', '#764BA2'] as const,
        bgGradient: ['#E8EAF6', '#F3E5F5', '#FAFAFA'] as const,
        icon: 'sparkles',
        title: language === 'ka' ? 'მანიფესტაციის პრაქტიკა' : 'Manifestation Practice',
        accentColor: '#667EEA',
      };
    } else if (type === 'asceticism') {
      return {
        gradient: ['#4ECDC4', '#44A08D'] as const,
        bgGradient: ['#E0F2F1', '#E8F5E8', '#FAFAFA'] as const,
        icon: 'fitness',
        title: language === 'ka' ? 'ასკეტიზმის პრაქტიკა' : 'Asceticism Practice',
        accentColor: '#4ECDC4',
      };
    } else {
      return {
        gradient: ['#FF9A9E', '#FECFEF'] as const,
        bgGradient: ['#FFF3E0', '#FCE4EC', '#FAFAFA'] as const,
        icon: 'create',
        title: t.header,
        accentColor: '#FF9A9E',
      };
    }
  };

  const theme = getTypeTheme();

  const onCreate = async () => {
    if (!content.trim() && !title.trim()) {
      Alert.alert(t.missingTitle, t.missingMsg);
      return;
    }
    try {
      setSaving(true);
      const created = await createEntry({ title: title.trim() || 'Untitled', content });
      router.replace({ pathname: '/(tabs)/journal/[id]', params: { id: String(created.id) } } as any);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={theme.bgGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <LinearGradient colors={theme.gradient} style={styles.iconGradient}>
                <Ionicons name={theme.icon as any} size={24} color="#FFF" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>{theme.title}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Instructions Card */}
          {type && (
            <View style={styles.instructionsCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']}
                style={styles.instructionsGradient}
              >
                <View style={styles.instructionsHeader}>
                  <LinearGradient colors={theme.gradient} style={styles.instructionsIcon}>
                    <Ionicons name="bulb" size={16} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.instructionsTitle}>
                    {language === 'ka' ? 'პრაქტიკის ინსტრუქცია' : 'Practice Instructions'}
                  </Text>
                </View>
                <Text style={styles.instructionsText}>
                  {type === 'manifestation' ? t.manifestationInstructions : t.asceticismInstructions}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Title Input */}
          <View style={styles.inputSection}>
            <View style={styles.labelContainer}>
              <Ionicons name="text" size={16} color={theme.accentColor} />
              <Text style={[styles.label, { color: theme.accentColor }]}>{t.title}</Text>
            </View>
            <View style={styles.inputWrapper}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']}
                style={styles.inputGradient}
              >
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t.titlePh}
                  placeholderTextColor="#A0AEC0"
                  style={styles.input}
                />
              </LinearGradient>
            </View>
          </View>

          {/* Content Input */}
          <View style={styles.inputSection}>
            <View style={styles.labelContainer}>
              <Ionicons name="document-text" size={16} color={theme.accentColor} />
              <Text style={[styles.label, { color: theme.accentColor }]}>{t.content}</Text>
            </View>
            <View style={styles.inputWrapper}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']}
                style={[styles.inputGradient, styles.textAreaGradient]}
              >
                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder={t.contentPh}
                  placeholderTextColor="#A0AEC0"
                  style={[styles.input, styles.textArea]}
                  multiline
                  textAlignVertical="top"
                />
              </LinearGradient>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity 
            style={[styles.createButton, { opacity: saving ? 0.7 : 1 }]} 
            onPress={onCreate} 
            disabled={saving}
            activeOpacity={0.8}
          >
            <LinearGradient colors={theme.gradient} style={styles.createButtonGradient}>
              {saving ? (
                <View style={styles.savingContainer}>
                  <ActivityIndicator color="#FFF" size="small" />
                  <Text style={styles.savingText}>
                    {language === 'ka' ? 'ინახება...' : 'Saving...'}
                  </Text>
                </View>
              ) : (
                <View style={styles.createContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  <Text style={styles.createText}>{t.create}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 10,
  },
  backButton: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
  },
  placeholderButton: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  instructionsCard: {
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  instructionsGradient: {
    padding: 20,
    borderRadius: 16,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionsIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4A5568',
  },
  inputSection: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputWrapper: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGradient: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  textAreaGradient: {
    minHeight: 120,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D3748',
    backgroundColor: 'transparent',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    marginTop: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});