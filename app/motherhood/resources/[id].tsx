import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';
import { translations } from '@/i18n/translations';
import { getResource, type MotherhoodResource } from '@/services/motherhoodService';

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [loading, setLoading] = React.useState(true);
  const [item, setItem] = React.useState<MotherhoodResource | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await getResource(id);
          setItem(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen 
        options={{
          title: item?.title || t.resources,
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
          },
          headerBackTitle: t.back,
          headerBackVisible: true,
          headerTintColor: colors.text,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
        }}
      />

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : item ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {!!item.resource_type && (
              <View style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.resource_type}</Text>
              </View>
            )}
            {!!item.author && (
              <View style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.author}</Text>
              </View>
            )}
            {item.is_featured ? (
              <View style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
                <Ionicons name="star" size={12} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginLeft: 4 }}>Featured</Text>
              </View>
            ) : null}
          </View>

          {!!item.description && (
            <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: 10 }]}>{item.description}</Text>
          )}

          {!!item.url && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => Linking.openURL(item.url!)}
            >
              <Text style={styles.primaryBtnText}>{t.openLink}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Resource not found.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800' },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: { fontSize: 14, paddingHorizontal: 8, paddingVertical: 4 },
  primaryBtn: {
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
