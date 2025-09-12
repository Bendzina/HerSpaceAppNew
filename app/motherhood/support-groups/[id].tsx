import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';
import { translations } from '@/i18n/translations';
import { getSupportGroup, type SupportGroup } from '@/services/motherhoodSupportService';

export default function SupportGroupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [loading, setLoading] = React.useState(true);
  const [item, setItem] = React.useState<SupportGroup | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await getSupportGroup(id);
          setItem(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: colors.background }]}> 
        <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{t.supportGroups}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : item ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {!!item.group_type && (
              <View style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.group_type}</Text>
              </View>
            )}
            {typeof item.current_members === 'number' && typeof item.max_members === 'number' && (
              <View style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
                <Ionicons name="people" size={12} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>{item.current_members}/{item.max_members}</Text>
              </View>
            )}
            {item.is_private ? (
              <View style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
                <Ionicons name="lock-closed" size={12} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>{language === 'ka' ? 'პირადი' : 'Private'}</Text>
              </View>
            ) : null}
          </View>

          {!!item.description && (
            <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: 10 }]}>{item.description}</Text>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>{language === 'ka' ? 'ჯგუფი ვერ მოიძებნა.' : 'Group not found.'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  title: { fontSize: 24, fontWeight: '800' },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: { fontSize: 14 },
});
