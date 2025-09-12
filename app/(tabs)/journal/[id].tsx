import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getEntry, updateEntry, deleteEntry, JournalEntry } from '@/services/journalService';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';

export default function JournalEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { colors } = useTheme();
  const { language } = useLanguage();

  const t = language === 'ka'
    ? {
        editEntry: 'ჩანაწერის რედაქტირება',
        title: 'სათაური',
        content: 'შინაარსი',
        titlePh: 'სათაური',
        contentPh: 'ჩაწერე შენი აზრები...',
        saving: 'შენახვა...',
        save: 'შენახვა',
        delete: 'წაშლა',
        saved: 'შენახულია',
        savedMsg: 'ცვლილებები შენახულია.',
        error: 'შეცდომა',
        saveError: 'შენახვა ვერ მოხერხდა',
        deleteTitle: 'ჩანაწერის წაშლა',
        deleteConfirm: 'დარწმუნებული ხარ, რომ გინდა ჩანაწერის წაშლა?',
        cancel: 'გაუქმება',
        deleteConfirmBtn: 'წაშლა',
      }
    : {
        editEntry: 'Edit Entry',
        title: 'Title',
        content: 'Content',
        titlePh: 'Title',
        contentPh: 'Write your thoughts...',
        saving: 'Saving...',
        save: 'Save',
        delete: 'Delete',
        saved: 'Saved',
        savedMsg: 'Your changes have been saved.',
        error: 'Error',
        saveError: 'Failed to save',
        deleteTitle: 'Delete Entry',
        deleteConfirm: 'Are you sure you want to delete this entry?',
        cancel: 'Cancel',
        deleteConfirmBtn: 'Delete',
      };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getEntry(id!);
        if (mounted) {
          setEntry(data);
          setTitle(data.title || '');
          setContent(data.content || '');
          setError(null);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load entry');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const onSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const updated = await updateEntry(id, { title, content });
      setEntry(updated);
      Alert.alert(t.saved, t.savedMsg);
      // Navigate back to list so it reflects updated title/content
      router.back();
    } catch (e: any) {
      Alert.alert(t.error, e?.message || t.saveError);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!id) return;
    Alert.alert(t.deleteTitle, t.deleteConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.deleteConfirmBtn, style: 'destructive', onPress: async () => {
        try {
          await deleteEntry(id);
          router.back();
        } catch (e: any) {
          Alert.alert(t.error, e?.message || 'Failed to delete');
        }
      }},
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingVertical: 24 }]}
    >
      <Text style={[styles.header, { color: colors.text }]}>{t.editEntry}</Text>

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
        style={[styles.input, { height: 160, textAlignVertical: 'top', borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        multiline
      />

      <View style={{ height: 16 }} />

      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onSave} disabled={saving}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>{saving ? t.saving : t.save}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { borderColor: colors.error, borderWidth: 1 }]} onPress={onDelete}>
          <Text style={{ color: colors.error, fontWeight: '600' }}>{t.delete}</Text>
        </TouchableOpacity>
      </View>
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
  button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, marginRight: 10 },
});