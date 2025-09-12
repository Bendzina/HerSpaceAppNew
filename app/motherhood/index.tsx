import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';
import { translations } from '@/i18n/translations';

const Card = ({ icon, title, subtitle, onPress, color }: { icon: keyof typeof Ionicons.glyphMap, title: string, subtitle: string, onPress: () => void, color: string }) => (
  <TouchableOpacity onPress={onPress} style={[styles.card]}> 
    <View style={styles.cardRow}>
      <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}> 
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#888" />
    </View>
  </TouchableOpacity>
);

export default function MotherhoodHub() {
  const { colors } = useTheme();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: t.supportGroups ? t.resources && t.routines ? 'Motherhood' : 'Motherhood' : 'Motherhood' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card
          icon="library-outline"
          color="#8b5fbf"
          title={t.resources}
          subtitle={language === 'ka' ? 'სტატიები, ვიდეოები და გზنماები' : 'Articles, videos, and guides'}
          onPress={() => router.push('/motherhood/resources' as never)}
        />
        <Card
          icon="time-outline"
          color="#6BCF7F"
          title={t.routines}
          subtitle={language === 'ka' ? 'გააფორმე და მიჰყევი რბილ რუტინებს' : 'Track and shape gentle routines'}
          onPress={() => router.push('/motherhood/routines' as never)}
        />
        <Card
          icon="journal-outline"
          color="#FF9FB2"
          title={t.journal}
          subtitle={language === 'ka' ? 'დაწერე შენიშვნები დედობის შესახებ' : 'Write reflections for motherhood'}
          onPress={() => router.push('/motherhood/journal' as never)}
        />
        <Card
          icon="people-outline"
          color="#74A9FF"
          title={t.supportGroups}
          subtitle={language === 'ka' ? 'იპოვე ნაზი საზოგადოებრივი სივრცეები' : 'Find gentle community spaces'}
          onPress={() => router.push('/motherhood/support-groups' as never)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, borderColor: '#e1e1e1', padding: 14, marginBottom: 12, backgroundColor: '#fff' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, color: '#666' },
});
