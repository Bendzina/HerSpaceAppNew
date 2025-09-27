import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { listMoodCheckIns, type MoodCheckIn } from '@/services/moodService';
import { getMoodAnalytics, type MoodAnalytics } from '@/services/analyticsService';

const { width } = Dimensions.get('window');

interface ProgressData { date: string; value: number }
interface Achievement { id: string; title: string; description: string; icon: string; achieved: boolean; date?: string }

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<MoodCheckIn[]>([]);
  const [analytics, setAnalytics] = React.useState<MoodAnalytics | null>(null);
  const [days, setDays] = React.useState<7 | 14 | 30>(30);
  const [refreshing, setRefreshing] = React.useState(false);

  const moodScore = React.useCallback((mood?: string | null) => {
    // Map moods to a 1-5 scale
    switch ((mood || '').toLowerCase()) {
      case 'happy': return 5;
      case 'calm': return 4;
      case 'anxious': return 2;
      case 'sad': return 1;
      default: return 3; // neutral fallback
    }
  }, []);

  const dayLabel = (d: Date) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  const kaDayLabel = (d: Date) => ['კვ','ორ','სამ','ოთ','ხუ','პა','შა'][d.getDay()];

  const fetchAll = React.useCallback(async (rangeDays: 7 | 14 | 30) => {
    const [data, a] = await Promise.allSettled([
      listMoodCheckIns({ ordering: '-created_at' }),
      getMoodAnalytics({ days: rangeDays }),
    ]);
    if (data.status === 'fulfilled') {
      setRows(Array.isArray(data.value) ? data.value : []);
    } else {
      setRows([]);
    }
    if (a.status === 'fulfilled') {
      setAnalytics(a.value);
    } else {
      setAnalytics(null);
    }
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchAll(days);
      } finally {
        setLoading(false);
      }
    })();
  }, [days, fetchAll]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAll(days);
    } finally {
      setRefreshing(false);
    }
  }, [days, fetchAll]);

  // Last 7 days mood trend
  const last7: ProgressData[] = React.useMemo(() => {
    if (analytics && Array.isArray(analytics.last7)) {
      return analytics.last7;
    }
    const today = new Date();
    const byDate: Record<string, number[]> = {};
    rows.forEach(r => {
      const d = new Date(r.date);
      const key = d.toISOString().slice(0,10);
      const score = moodScore(String(r.mood || ''));
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(score);
    });
    const out: ProgressData[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0,10);
      const scores = byDate[key] || [];
      const avg = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
      out.push({ date: language === 'ka' ? kaDayLabel(d) : dayLabel(d), value: Number(avg.toFixed(2)) });
    }
    return out;
  }, [rows, language, moodScore, analytics]);

  const maxValue = Math.max(1, ...last7.map(d => d.value));

  // Monthly stats (last 30 days)
  const monthly = React.useMemo(() => {
    if (analytics) {
      return {
        activeDays: analytics.monthly.activeDays,
        avgEnergy: analytics.monthly.avgEnergy,
        avgMood: analytics.monthly.avgMood,
        // Using totalEntries from analytics for the 30-day window
        // Rows length may represent all-time or different ordering
      } as const;
    }
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 29);
    const recent = rows.filter(r => new Date(r.date) >= cutoff);
    const activeDays = new Set(recent.map(r => new Date(r.date).toISOString().slice(0,10))).size;
    const energyVals = recent.map(r => typeof r.energy_level === 'number' ? r.energy_level : null).filter((v): v is number => v !== null);
    const avgEnergy = energyVals.length ? (energyVals.reduce((a,b)=>a+b,0)/energyVals.length) : 0;
    const moodVals = recent.map(r => moodScore(String(r.mood || '')));
    const avgMood = moodVals.length ? (moodVals.reduce((a,b)=>a+b,0)/moodVals.length) : 0;
    return { activeDays, avgEnergy: Number(avgEnergy.toFixed(1)), avgMood: Number(avgMood.toFixed(1)) };
  }, [rows, moodScore, analytics]);

  // Streak calculation (consecutive days with entries)
  const streak = React.useMemo(() => {
    if (analytics) return analytics.streak;
    const dates = Array.from(new Set(rows.map(r => new Date(r.date).toDateString()))).map(s => new Date(s)).sort((a,b)=>b.getTime()-a.getTime());
    if (dates.length === 0) return 0;
    let s = 0;
    let prev = new Date(); prev.setHours(0,0,0,0);
    for (let i=0; i<dates.length; i++) {
      const d = new Date(dates[i]); d.setHours(0,0,0,0);
      const diffDays = Math.round((prev.getTime()-d.getTime())/86400000);
      if (i===0) {
        const today = new Date(); today.setHours(0,0,0,0);
        const firstDiff = Math.round((today.getTime()-d.getTime())/86400000);
        if (firstDiff>1) break; // no entry today or yesterday => streak 0
        s = 1;
      } else if (diffDays===1) {
        s += 1;
      } else {
        break;
      }
      prev = d;
    }
    return s;
  }, [rows, analytics]);

  const achievements: Achievement[] = [
    {
      id: 'first',
      title: language === 'ka' ? 'პირველი ჩეკინი' : 'First Check-in',
      description: language === 'ka' ? 'შექმენი პირველი განწყობა' : 'Create your first mood check-in',
      icon: 'footsteps',
      achieved: rows.length > 0,
      date: rows.length ? new Date(rows[rows.length-1].date).toLocaleDateString() : undefined,
    },
    {
      id: 'streak7',
      title: language === 'ka' ? '7 დღე ზედიზედ' : '7 Day Streak',
      description: language === 'ka' ? 'ყოველდღიური ჩეკინი 7 დღის განმავლობაში' : 'Check in daily for 7 days',
      icon: 'flame',
      achieved: streak >= 7,
      date: streak >=7 ? new Date().toLocaleDateString() : undefined,
    },
    {
      id: 'month10',
      title: language === 'ka' ? '10 ჩანაწერი თვეში' : '10 this month',
      description: language === 'ka' ? 'გასულ 30 დღეში 10+ ჩეკინი' : '10+ check-ins in last 30 days',
      icon: 'trophy',
      achieved: rows.filter(r => new Date(r.date) >= (()=>{const c=new Date();c.setDate(c.getDate()-29);return c;})()).length >= 10,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }] }>
          {language === 'ka' ? 'შენი პროგრესი' : 'Your Progress'}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }] }>
          {language === 'ka' 
            ? 'ნახე როგორ იზრდები ყოველდღე' 
            : 'See how you grow every day'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textSecondary} />}
      >
        {/* Timeframe Switcher */}
        <View style={[styles.card, { backgroundColor: colors.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}> 
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {language === 'ka' ? 'პერიოდი' : 'Timeframe'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[7,14,30].map((d) => {
              const active = days === d;
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDays(d as 7|14|30)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    backgroundColor: active ? colors.primary : colors.background,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{ color: active ? '#fff' : colors.text }}>{d}d</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        {/* Weekly Overview */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {language === 'ka' ? 'ამ კვირის მიმოხილვა' : 'This Week Overview'}
          </Text>
          {loading ? (
            <Text style={{ color: colors.textSecondary }}>
              {language === 'ka' ? 'იტვირთება...' : 'Loading...'}
            </Text>
          ) : (
          <View style={styles.chartContainer}>
            {last7.map((day, index) => (
              <View key={index} style={styles.chartBar}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: (day.value / maxValue) * 80 || 2,
                      backgroundColor: colors.primary 
                    }
                  ]} 
                />
                <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
                  {day.date}
                </Text>
                <Text style={[styles.chartValue, { color: colors.text }]}>
                  {day.value}
                </Text>
              </View>
            ))}
          </View>
          )}
        </View>

        {/* Monthly Stats */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {language === 'ka' ? 'თვიური სტატისტიკა' : 'Monthly Statistics'}
          </Text>
          {loading ? (
            <Text style={{ color: colors.textSecondary }}>
              {language === 'ka' ? 'იტვირთება...' : 'Loading...'}
            </Text>
          ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <Text style={[styles.statBigNumber, { color: colors.text }]}>{monthly.activeDays}</Text>
              <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>
                {language === 'ka' ? 'დღე აქტიური' : 'Active Days'}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={colors.primary} />
              <Text style={[styles.statBigNumber, { color: colors.text }]}>{analytics?.monthly.totalEntries ?? rows.length}</Text>
              <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>
                {language === 'ka' ? 'სულ ჩანაწერი' : 'Total Entries'}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color={colors.primary} />
              <Text style={[styles.statBigNumber, { color: colors.text }]}>{monthly.avgMood}</Text>
              <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>
                {language === 'ka' ? 'საშ. განწყობა' : 'Avg Mood'}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="heart" size={24} color={colors.primary} />
              <Text style={[styles.statBigNumber, { color: colors.text }]}>{monthly.avgEnergy}</Text>
              <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>
                {language === 'ka' ? 'საშ. ენერგია' : 'Avg Energy'}
              </Text>
            </View>
          </View>
          )}
        </View>

        {/* Achievements */}
        <View style={[styles.card, { backgroundColor: colors.surface }] }>
          <Text style={[styles.cardTitle, { color: colors.text }] }>
            {language === 'ka' ? 'მიღწევები' : 'Achievements'}
          </Text>
          {achievements.map(achievement => (
            <View key={achievement.id} style={styles.achievementItem}>
              <View style={[
                styles.achievementIcon,
                { 
                  backgroundColor: achievement.achieved ? colors.primary + '20' : colors.border + '40',
                }
              ]}>
                <Ionicons 
                  name={achievement.icon as any} 
                  size={24} 
                  color={achievement.achieved ? colors.primary : colors.textSecondary} 
                />
              </View>
              
              <View style={styles.achievementInfo}>
                <Text style={[
                  styles.achievementTitle, 
                  { 
                    color: achievement.achieved ? colors.text : colors.textSecondary,
                    opacity: achievement.achieved ? 1 : 0.6
                  }
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[styles.achievementDesc, { color: colors.textSecondary }]}>
                  {achievement.description}
                </Text>
                {achievement.achieved && achievement.date && (
                  <Text style={[styles.achievementDate, { color: colors.primary }]}>
                    {language === 'ka' ? 'მიღწეული: ' : 'Achieved: '}{achievement.date}
                  </Text>
                )}
              </View>
              
              {achievement.achieved && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </View>
          ))}
        </View>

        {/* Mood Breakdown */}
        <View style={[styles.card, { backgroundColor: colors.surface }] }>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {language === 'ka' ? 'განწყობის განაწილება' : 'Mood Breakdown'}
          </Text>
          {loading && !analytics ? (
            <Text style={{ color: colors.textSecondary }}>
              {language === 'ka' ? 'იტვირთება...' : 'Loading...'}
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[
                { key: 'happy', label: language === 'ka' ? 'ბედნიერი' : 'Happy' },
                { key: 'calm', label: language === 'ka' ? 'მშვიდი' : 'Calm' },
                { key: 'anxious', label: language === 'ka' ? 'შეშფოთებული' : 'Anxious' },
                { key: 'sad', label: language === 'ka' ? 'დარდიანი' : 'Sad' },
              ].map((m) => {
                const count = (analytics?.breakdown as any)?.[m.key] ?? 0;
                return (
                  <View key={m.key} style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: '700' }}>{count}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{m.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { fontSize: 16 },
  
  content: { flex: 1 },
  
  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  
  // Chart styles
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 20,
  },
  chartBar: { alignItems: 'center', flex: 1 },
  bar: {
    width: 24,
    backgroundColor: '#6366F1',
    borderRadius: 4,
    marginBottom: 8,
  },
  chartLabel: { fontSize: 12, marginBottom: 4 },
  chartValue: { fontSize: 12, fontWeight: '500' },
  
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  statBigNumber: { fontSize: 24, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  statCardLabel: { fontSize: 12, textAlign: 'center' },
  
  // Achievements
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  achievementDesc: { fontSize: 14, lineHeight: 20 },
  achievementDate: { fontSize: 12, marginTop: 4, fontWeight: '500' },
});