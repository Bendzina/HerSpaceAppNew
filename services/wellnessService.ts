import { authorizedFetch } from './authService';

export type TrackRitualPayload = {
  ritual: string | number;
  was_helpful?: boolean;
  effectiveness_rating?: number; // 1-5
  mood_before?: string;
  mood_after?: string;
  notes?: string;
};

const BASE = '/wellness/rituals';

export async function trackRitualUsage(payload: TrackRitualPayload) {
  const resp = await authorizedFetch(`${BASE}/track/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `Failed to track ritual usage (${resp.status})`);
  }
  return resp.json();
}

export type RitualHistoryItem = {
  id: number | string;
  ritual: number | string;
  ritual_title: string;
  used_at: string;
  was_helpful?: boolean | null;
  effectiveness_rating?: number | null;
  mood_before?: string | null;
  mood_after?: string | null;
  notes?: string | null;
};

export type RitualHistoryResponse = {
  history: RitualHistoryItem[];
  stats: {
    total_rituals_used: number;
    helpful_rituals: number;
    average_rating: number | null;
  };
};

export async function getRitualHistory(): Promise<RitualHistoryResponse> {
  const resp = await authorizedFetch(`${BASE}/history/`, { method: 'GET' });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `Failed to load ritual history (${resp.status})`);
  }
  return resp.json();
}
