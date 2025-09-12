import { authorizedFetch } from './authService';

export type MoodTrendPoint = { date: string; value: number };
export type MoodBreakdown = { happy: number; calm: number; anxious: number; sad: number };

export interface MoodAnalytics {
  last7: MoodTrendPoint[];
  monthly: {
    activeDays: number;
    avgEnergy: number;
    avgMood: number;
    totalEntries: number;
  };
  streak: number;
  breakdown: MoodBreakdown;
}

export async function getMoodAnalytics(params?: { days?: number }): Promise<MoodAnalytics> {
  const q = new URLSearchParams();
  if (params?.days) q.set('days', String(params.days));
  const resp = await authorizedFetch(`/analytics/mood/${q.toString() ? `?${q.toString()}` : ''}`, { method: 'GET' });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to load mood analytics (${resp.status})`);
  }
  const raw = await resp.json();
  // Backend analytics (analytics app) returns { total_checkins, mood_distribution, most_common_mood, average_mood_score, mood_trend }
  // Normalize into MoodAnalytics shape expected by UI
  const trend = Array.isArray(raw?.mood_trend) ? raw.mood_trend as Array<{ date: string; mood: string }> : [];
  const score = (mood?: string) => {
    switch ((mood || '').toLowerCase()) {
      case 'happy': return 5;
      case 'calm': return 4;
      case 'anxious': return 2;
      case 'sad': return 1;
      default: return 3;
    }
  };
  // Aggregate trend by date -> average score
  const byDate: Record<string, number[]> = {};
  for (const t of trend) {
    if (!byDate[t.date]) byDate[t.date] = [];
    byDate[t.date].push(score(t.mood));
  }
  const last7: MoodTrendPoint[] = Object.keys(byDate)
    .sort()
    .slice(-7)
    .map((d) => ({ date: d, value: Number((byDate[d].reduce((a,b)=>a+b,0)/byDate[d].length).toFixed(2)) }));

  const breakdown: MoodBreakdown = {
    happy: Number(raw?.mood_distribution?.happy || 0),
    calm: Number(raw?.mood_distribution?.calm || 0),
    anxious: Number(raw?.mood_distribution?.anxious || 0),
    sad: Number(raw?.mood_distribution?.sad || 0),
  };

  const monthly = {
    activeDays: 0, // not provided by this endpoint
    avgEnergy: 0,  // not provided by this endpoint
    avgMood: Number(raw?.average_mood_score || 0),
    totalEntries: Number(raw?.total_checkins || 0),
  };

  const normalized: MoodAnalytics = {
    last7,
    monthly,
    streak: 0, // not provided by this endpoint
    breakdown,
  };

  return normalized;
}
