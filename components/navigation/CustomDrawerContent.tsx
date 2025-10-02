import { useLanguage } from '@/app/LanguageContext';
import { useTheme } from '@/app/ThemeContext';
import { translations } from '@/i18n/translations';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';

export default function CustomDrawerContent(props: any) {
  const { isDark, setIsDark, colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const items: Array<{
    name: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }> = [
    { name: '(tabs)', label: t.home, icon: 'home-outline' },
    { name: 'motherhood/index', label: t.motherhood, icon: 'woman-outline' },
    { name: 'rituals', label: t.rituals, icon: 'leaf-outline' },
    
    { name: 'mindful', label: t.mindful, icon: 'medkit-outline' },
    { name: '(tabs)/community', label: 'Community', icon: 'people-outline' },
    { name: 'profile', label: t.profile, icon: 'person-circle-outline' },
    { name: 'HelpScreen', label: t.help, icon: 'help-circle-outline' },
    
    
    
    { name: 'insights', label: t.insights, icon: 'bar-chart-outline' },
    { name: 'progress', label: 'Progress', icon: 'stats-chart-outline' },

   
    { name: 'NotificationsScreen', label: t.notifications, icon: 'notifications-outline' },
    { name: 'AppPreferencesScreen', label: t.preferences, icon: 'options-outline' },
    { name: 'SettingsScreen', label: t.settings, icon: 'settings-outline' },
    // { name: 'LogoutScreen', label: 'Logout', icon: 'log-out-outline' },

  ];

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ backgroundColor: colors.background }}
    >
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}> 
        <View style={[styles.logoWrap, { backgroundColor: colors.primary + '22', borderColor: colors.primary + '33' }]}> 
          <Ionicons name="sparkles-outline" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>HerSpace</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Find your calm</Text>
        </View>
      </View>

      <View style={{ paddingTop: 4, paddingBottom: 8 }}>
        {items.map((it) => {
          const focused = props.state?.routes?.[props.state.index]?.name === it.name;
          return (
            <DrawerItem
              key={it.name}
              label={it.label}
              focused={focused}
              icon={({ color, size }) => <Ionicons name={it.icon} size={size} color={color} />}
              onPress={() => {
                if (it.name.startsWith('(tabs)/')) {
                  router.push(`/${it.name}` as any);
                } else {
                  props.navigation.navigate(it.name as never);
                }
              }}
              labelStyle={{ color: focused ? colors.primary : colors.text }}
              inactiveTintColor={colors.text}
              activeTintColor={colors.primary}
            />
          );
        })}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>Dark Mode</Text>
        <Switch
          value={isDark}
          onValueChange={setIsDark}
          trackColor={{ false: '#bbb', true: colors.primary }}
          thumbColor={isDark ? '#fff' : '#f4f3f4'}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});
