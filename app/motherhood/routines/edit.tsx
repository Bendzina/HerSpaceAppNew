import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/ThemeContext';
import { useLanguage } from '@/app/LanguageContext';
import { translations } from '@/i18n/translations';
import { getRoutine, createRoutine, updateRoutine, deleteRoutine, type ChildcareRoutine } from '@/services/motherhoodRoutinesService';

const kinds = ['feeding','sleep','play','health','other'] as const;
const times = ['morning','afternoon','evening','night'] as const;

export default function RoutineEditScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const isEditing = !!id;
  const [loading, setLoading] = React.useState<boolean>(Boolean(id));
  const [saving, setSaving] = React.useState(false);

  const [title, setTitle] = React.useState('');
  const [routineType, setRoutineType] = React.useState<typeof kinds[number]>('feeding');
  const [description, setDescription] = React.useState('');
  const [timeOfDay, setTimeOfDay] = React.useState<typeof times[number] | ''>('');
  const [duration, setDuration] = React.useState<string>('');
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getRoutine(id);
        setTitle(data.title || '');
        setRoutineType((data.routine_type as any) || 'feeding');
        setDescription(data.description || '');
        setTimeOfDay(((data.time_of_day as any) || '') as any);
        setDuration(String(data.duration_minutes ?? ''));
        setIsActive(Boolean(data.is_active ?? true));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSave = async () => {
    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        routine_type: routineType,
        description: description.trim() || undefined,
        time_of_day: timeOfDay || undefined,
        duration_minutes: duration ? Number(duration) : undefined,
        is_active: isActive,
      } as any;
      if (isEditing) {
        await updateRoutine(id!, payload);
      } else {
        await createRoutine(payload);
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
    Alert.alert('Delete', 'Delete this routine?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteRoutine(id);
          router.back();
        } catch (e: any) {
          Alert.alert('Error', e?.message || 'Failed to delete');
        }
      }}
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: isEditing ? (language === 'ka' ? 'რუტინის რედაქტირება' : 'Edit Routine') : (language === 'ka' ? 'ახალი რუტინა' : 'New Routine') }} />

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
            placeholder={language === 'ka' ? 'დაარქვი რუტინას სახელი' : 'Name this routine'}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} />

          <Text style={[styles.label, { color: colors.textSecondary }]}>{language === 'ka' ? 'ტიპი' : 'Type'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {kinds.map(k => {
              const active = routineType === k;
              return (
                <TouchableOpacity key={k} onPress={() => setRoutineType(k)} style={[styles.chip, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary + '22' : 'transparent' }]}>
                  <Text style={{ color: active ? colors.primary : colors.text }}>
                    {language === 'ka' ? ({ feeding: 'კვება', sleep: 'ძილი', play: 'თამაში', health: 'ჯანმრთელობა', other: 'სხვა' } as any)[k] : ({ feeding: 'Feeding', sleep: 'Sleep', play: 'Play', health: 'Health', other: 'Other' } as any)[k]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>{language === 'ka' ? 'დღის დრო' : 'Time of day'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {times.map(ti => {
              const active = timeOfDay === ti;
              return (
                <TouchableOpacity key={ti} onPress={() => setTimeOfDay(ti)} style={[styles.chip, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary + '22' : 'transparent' }]}>
                  <Text style={{ color: active ? colors.primary : colors.text }}>
                    {language === 'ka' ? ({ morning: 'დილის', afternoon: 'შუადღის', evening: 'საღამოს', night: 'ღამის' } as any)[ti] : ({ morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' } as any)[ti]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>{language === 'ka' ? 'ხანგრძლივობა (წუთი)' : 'Duration (minutes)'}</Text>
          <TextInput
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            placeholder={language === 'ka' ? 'მაგ. 15' : 'e.g., 15'}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} />

          <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>{language === 'ka' ? 'აღწერა' : 'Description'}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={language === 'ka' ? 'რა შედის ამ რუტინაში?' : 'What does this routine include?'}
            placeholderTextColor={colors.textSecondary}
            multiline
            style={[styles.multiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <Text style={{ color: colors.text }}>{language === 'ka' ? 'აქტიური' : 'Active'}</Text>
            <Switch value={isActive} onValueChange={setIsActive} />
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
  multiline: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10, marginTop: 6, minHeight: 120, textAlignVertical: 'top' },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  saveBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', flex: 1 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  deleteBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', flex: 1, borderWidth: 1 },
  deleteBtnText: { fontWeight: '700' },
});
