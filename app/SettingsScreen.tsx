import React from 'react';
import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, setIsDark, colors } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageToggle = () => {
    const newLanguage = language === 'en' ? 'ka' : 'en';
    setLanguage(newLanguage);
  };

  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.settings?.title || 'Settings'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings?.appearance || 'Appearance'}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>{isDark ? '🌙' : '☀️'}</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings?.darkMode || 'Dark Mode'}</Text>
                <Text style={styles.settingDescription}>
                  {t.settings?.darkModeDesc || 'Switch between light and dark themes'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={setIsDark}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={isDark ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings?.language || 'Language'}</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleLanguageToggle}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>🌍</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>
                  {t.settings?.currentLanguage || 'Language'}
                </Text>
                <Text style={styles.settingDescription}>
                  {language === 'en' ? 'English' : 'ქართული'}
                </Text>
              </View>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.currentLanguageText}>
                {language === 'en' ? 'EN' : 'ქა'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings?.account || 'Account'}</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/ProfileScreen')}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>👤</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings?.profile || 'Profile'}</Text>
                <Text style={styles.settingDescription}>
                  {t.settings?.profileDesc || 'View and edit your profile'}
                </Text>
              </View>
            </View>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/NotificationsScreen')}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>🔔</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings?.notifications || 'Notifications'}</Text>
                <Text style={styles.settingDescription}>
                  {t.settings?.notificationsDesc || 'Manage your notification preferences'}
                </Text>
              </View>
            </View>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/PasswordScreen')}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>🔒</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings?.security || 'Security'}</Text>
                <Text style={styles.settingDescription}>
                  {t.settings?.securityDesc || 'Change password and security settings'}
                </Text>
              </View>
            </View>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings?.support || 'Support'}</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/HelpScreen')}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>❓</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings?.helpSupport || 'Help & Support'}</Text>
                <Text style={styles.settingDescription}>
                  {t.settings?.helpSupportDesc || 'Get help and contact support'}
                </Text>
              </View>
            </View>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Mindful App</Text>
          <Text style={styles.appVersion}>Version 1.2.3</Text>
          <Text style={styles.appCopyright}>© 2024 HerSpace</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingIconText: {
    fontSize: 20,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  arrowContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  currentLanguageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  arrowText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 16,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});