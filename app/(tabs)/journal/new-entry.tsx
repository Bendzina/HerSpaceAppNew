import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { createEntry } from '@/services/journalService';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';

export default function NewEntryScreen() {
  const router = useRouter();
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
      };

  const onCreate = async () => {
    if (!content.trim() && !title.trim()) {
      Alert.alert(t.missingTitle, t.missingMsg);
      return;
    }
    try {
      setSaving(true);
      const created = await createEntry({ title: title.trim() || 'Untitled', content });
      // Navigate to the created entry detail
      router.replace({ pathname: '/(tabs)/journal/[id]', params: { id: String(created.id) } } as any);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingVertical: 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.header, { color: colors.text }]}>{t.header}</Text>

      <Text style={[styles.label, { color: colors.text }]}>{t.title}</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={t.titlePh}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
      />

      <Text style={[styles.label, { color: colors.text }]}>{t.content}</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder={t.contentPh}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, { height: 200, textAlignVertical: 'top', borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        multiline
      />

      <View style={{ height: 12 }} />

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onCreate} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '600' }}>{t.create}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
});