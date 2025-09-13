import { useLanguage } from '@/app/LanguageContext';
import { useTheme } from '@/app/ThemeContext';
import { translations } from '@/i18n/translations';
import { createJournal, deleteJournal, getJournal, updateJournal } from '@/services/motherhoodJournalService';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const moods = ['happy','calm','sad','anxious'] as const;

export default function MotherhoodJournalNew() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const isEditing = !!id;
  const [loading, setLoading] = React.useState<boolean>(Boolean(id));
  const [saving, setSaving] = React.useState(false);

  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [mood, setMood] = React.useState<typeof moods[number] | ''>('');
  const [isPrivate, setIsPrivate] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getJournal(id);
        setTitle(data.title || '');
        setContent(data.content || '');
        setMood(((data.mood as any) || '') as any);
        setIsPrivate(Boolean(data.is_private ?? true));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSave = async () => {
    if (!title.trim()) { Alert.alert('', 'Please enter a title'); return; }
    if (!content.trim()) { Alert.alert('', 'Please write something'); return; }
    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        content: content.trim(),
        mood: mood || undefined,
        is_private: isPrivate,
      } as const;
      if (isEditing) {
        await updateJournal(id!, payload);
      } else {
        await createJournal(payload);
      }
      Alert.alert('', 'Saved');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!id) return;
    Alert.alert('Delete', 'Delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteJournal(id);
          router.back();
        } catch (e: any) {
          Alert.alert('Error', e?.message || 'Failed to delete');
        }
      }}
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: isEditing ? (language === 'ka' ? 'ჩანაწერის რედაქტირება' : 'Edit Entry') : (language === 'ka' ? 'ახალი ჩანაწერი' : 'New Entry') }} />

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="time" size={20} color={colors.textSecondary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{language === 'ka' ? 'სათაური' : 'Title'}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={language === 'ka' ? 'მიანიჭე ჩანაწერს სათაური' : 'Give your entry a gentle title'}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} />

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>{language === 'ka' ? 'განწყობა (სურვილისამებრ)' : 'Mood (optional)'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {moods.map(m => {
              const active = mood === m;
              return (
                <TouchableOpacity key={m} onPress={() => setMood(m)} style={[styles.chip, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary + '22' : 'transparent' }]}>
                  <Text style={{ color: active ? colors.primary : colors.text }}>
                    {m === 'happy' ? t.moodHappy : m === 'calm' ? t.moodCalm : m === 'sad' ? t.moodSad : t.moodAnxious}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>{language === 'ka' ? 'დაწერე' : 'Write'}</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder={language === 'ka' ? 'როგორ გრძნობ თავს დედობაში დღეს?' : 'How are you feeling in motherhood today?'}
            placeholderTextColor={colors.textSecondary}
            multiline
            style={[styles.multiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <Text style={{ color: colors.text }}>{language === 'ka' ? 'პირადი' : 'Private'}</Text>
            <Switch value={isPrivate} onValueChange={setIsPrivate} />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <TouchableOpacity onPress={onSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}> 
              <Text style={styles.saveBtnText}>{saving ? (language === 'ka' ? 'ინახება…' : 'Saving…') : t.save}</Text>
            </TouchableOpacity>
            {isEditing && (
              <TouchableOpacity onPress={onDelete} style={[styles.deleteBtn, { borderColor: colors.border }]}> 
                <Text style={[styles.deleteBtnText, { color: colors.text }]}>{t.delete}</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, marginTop: 6 },
  multiline: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, marginTop: 6, minHeight: 160, textAlignVertical: 'top' },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  saveBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', flex: 1 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  deleteBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', flex: 1, borderWidth: 1 },
  deleteBtnText: { fontWeight: '700' },
});
