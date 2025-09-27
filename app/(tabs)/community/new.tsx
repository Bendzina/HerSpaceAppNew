import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';
import { translations } from '@/i18n/translations';
import { createCommunityPost, type CommunityPostType } from '@/services/communityService';

const chips: CommunityPostType[] = ['support','celebration','advice','story','question','gratitude'];

export default function CommunityNewPostScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const router = useRouter();

  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [type, setType] = React.useState<CommunityPostType>('support');
  const [anonymous, setAnonymous] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const L = language === 'ka' ? {
    newPost: 'ახალი პოსტი',
    title: 'სათაური',
    titlePh: 'მოკლე სათაური',
    content: 'შინაარსი',
    contentPh: 'გაუზიარე გამოცდილება ან კითხვა…',
    anonymous: 'ანონიმური',
    create: 'გამოქვეყნება',
    creating: 'ინახება…',
    failed: 'შენახვა ვერ მოხერხდა',
  } : {
    newPost: 'New Post',
    title: 'Title',
    titlePh: 'Short title',
    content: 'Content',
    contentPh: 'Share your experience or question…',
    anonymous: 'Anonymous',
    create: 'Post',
    creating: 'Saving…',
    failed: 'Failed to save',
  };

  const onSave = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      setSaving(true);
      await createCommunityPost({ post_type: type, title: title.trim(), content: content.trim(), is_anonymous: anonymous });
      router.back();
    } catch (e: any) {
      Alert.alert('', e?.message || L.failed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: L.newPost }} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t.community}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {chips.map(c => {
            const active = type === c;
            return (
              <TouchableOpacity key={c} onPress={() => setType(c)} style={[styles.chip, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary + '22' : 'transparent' }]}> 
                <Text style={{ color: active ? colors.primary : colors.text }}>{(t as any)[c]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{L.title}</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={L.titlePh}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} />

        <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>{L.content}</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder={L.contentPh}
          placeholderTextColor={colors.textSecondary}
          multiline
          style={[styles.multiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <Text style={{ color: colors.text }}>{L.anonymous}</Text>
          <Switch value={anonymous} onValueChange={setAnonymous} />
        </View>

        <TouchableOpacity onPress={onSave} disabled={saving} style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}> 
          <Text style={styles.saveBtnText}>{saving ? L.creating : L.create}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, marginBottom: 6 },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multiline: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveBtn: {
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
