import { useLanguage } from '@/app/LanguageContext';
import { useTheme } from '@/app/ThemeContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function JournalStackLayout() {
  const { language } = useLanguage();
  const { colors } = useTheme();

  const t = language === 'ka'
    ? { journal: 'დღიური', newEntry: 'ახალი ჩანაწერი', entry: 'ჩანაწერი' }
    : { journal: 'Journal', newEntry: 'New Entry', entry: 'Entry' };

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontWeight: '600', color: colors.text },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: t.journal,
          headerShown: false // Hide header for the main journal screen
        }} 
      />
      <Stack.Screen name="new-entry" options={{ title: t.newEntry }} />
      <Stack.Screen name="[id]" options={{ title: t.entry }} />
    </Stack>
  );
}