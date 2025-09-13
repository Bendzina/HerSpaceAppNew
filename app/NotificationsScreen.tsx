import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences,
  loadPreferencesFromBackend,
  type NotificationPreferences
} from '@/services/notificationService';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  // Notification settings state with default values
  const [settings, setSettings] = useState<NotificationPreferences>({
    dailyReminders: true,
    weeklyGoals: true,
    achievementAlerts: false,
    journalReminders: true,
    meditationAlerts: true,
    motivationalQuotes: false,
    systemUpdates: true,
    marketingEmails: false,
  });

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        // Try to load from backend first, fallback to local storage
        const prefs = await loadPreferencesFromBackend();
        setSettings(prefs);
      } catch (error) {
        console.error('Failed to load notification preferences', error);
        // Fallback to local storage
        const localPrefs = await getNotificationPreferences();
        setSettings(localPrefs);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Update a single setting
  const updateSetting = useCallback(async (key: keyof NotificationPreferences) => {
    const newValue = !settings[key];
    const updatedSettings = { ...settings, [key]: newValue };
    
    // Optimistic update
    setSettings(updatedSettings);
    
    try {
      // Update in storage and sync with backend
      await updateNotificationPreferences(updatedSettings);
    } catch (error) {
      console.error('Failed to update notification preference', error);
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !newValue }));
      Alert.alert('Error', 'Failed to update notification settings');
    }
  }, [settings]);

  // Reset all settings to defaults
  const resetToDefaults = useCallback(async () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all notification settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            const defaultSettings = {
              dailyReminders: true,
              weeklyGoals: true,
              achievementAlerts: false,
              journalReminders: true,
              meditationAlerts: true,
              motivationalQuotes: false,
              systemUpdates: true,
              marketingEmails: false,
            };
            
            setSettings(defaultSettings);
            
            try {
              await updateNotificationPreferences(defaultSettings);
            } catch (error) {
              console.error('Failed to reset notification preferences', error);
              Alert.alert('Error', 'Failed to reset notification settings');
            }
          }
        },
      ]
    );
  }, []);

  const styles = createStyles(colors);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>{t.notifications.title}</Text>
        <TouchableOpacity onPress={resetToDefaults}>
          <Text style={styles.resetText}>{t.notifications.reset}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.notifications.mainNotifications}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>🔔</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.notifications.dailyReminders}</Text>
                <Text style={styles.settingDescription}>{t.notifications.dailyRemindersDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.dailyReminders}
              onValueChange={() => updateSetting('dailyReminders')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={settings.dailyReminders ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>📝</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.notifications.journalReminders}</Text>
                <Text style={styles.settingDescription}>{t.notifications.journalRemindersDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.journalReminders}
              onValueChange={() => updateSetting('journalReminders')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={settings.journalReminders ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>🧘</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.notifications.meditationAlerts}</Text>
                <Text style={styles.settingDescription}>{t.notifications.meditationAlertsDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.meditationAlerts}
              onValueChange={() => updateSetting('meditationAlerts')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={settings.meditationAlerts ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Goals & Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.notifications.goalsAchievements}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>🎯</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.notifications.weeklyGoals}</Text>
                <Text style={styles.settingDescription}>{t.notifications.weeklyGoalsDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.weeklyGoals}
              onValueChange={() => updateSetting('weeklyGoals')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={settings.weeklyGoals ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>🏆</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.notifications.achievementAlerts}</Text>
                <Text style={styles.settingDescription}>{t.notifications.achievementAlertsDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.achievementAlerts}
              onValueChange={() => updateSetting('achievementAlerts')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={settings.achievementAlerts ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Optional Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.notifications.optionalNotifications}</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>💭</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.notifications.motivationalQuotes}</Text>
                <Text style={styles.settingDescription}>{t.notifications.motivationalQuotesDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.motivationalQuotes}
              onValueChange={() => updateSetting('motivationalQuotes')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={settings.motivationalQuotes ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>⚙️</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.notifications.systemUpdates}</Text>
                <Text style={styles.settingDescription}>{t.notifications.systemUpdatesDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.systemUpdates}
              onValueChange={() => updateSetting('systemUpdates')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={settings.systemUpdates ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIcon}>
                <Text style={styles.settingIconText}>📧</Text>
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.notifications.marketingEmails}</Text>
                <Text style={styles.settingDescription}>{t.notifications.marketingEmailsDesc}</Text>
              </View>
            </View>
            <Switch
              value={settings.marketingEmails}
              onValueChange={() => updateSetting('marketingEmails')}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={settings.marketingEmails ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
  resetText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
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
});