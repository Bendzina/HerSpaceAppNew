import { authorizedFetch } from './authService';

export type MoodOption = 'happy' | 'sad' | 'anxious' | 'calm' | string;
export type EmotionalSupportOption = 'listening' | 'guidance' | 'encouragement' | 'grounding' | 'celebration' | string;

export interface MoodCheckIn {
  id: string | number;
  date: string; // read-only (set by backend to today)
  mood: MoodOption;
  notes?: string | null;
  // Optional fields that may be present in future serializer versions
  energy_level?: number | null;
  needs_today?: string;
  gratitude_moment?: string;
  emotional_support_needed?: EmotionalSupportOption | null;
  created_at?: string | null;
}

export interface CreateMoodCheckInDto {
  mood: MoodOption;
  notes?: string | null;
  // Step 3 optional fields
  energy_level?: number | null;
  needs_today?: string | null;
  gratitude_moment?: string | null;
  emotional_support_needed?: EmotionalSupportOption | null;
}

const BASE_PATH = '/journal/mood-checkins/';

type ListParams = {
  search?: string;
  ordering?: string; // e.g. 'created_at' or '-created_at'
  created_at?: string; // ISO date string
};

function toQuery(params?: ListParams): string {
  if (!params) return '';
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.ordering) q.set('ordering', params.ordering);
  if (params.created_at) q.set('created_at', params.created_at);
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function listMoodCheckIns(params?: ListParams): Promise<MoodCheckIn[]> {
  const resp = await authorizedFetch(`${BASE_PATH}${toQuery(params)}`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load mood check-ins (${resp.status})`);
  const data = await resp.json();
  if (Array.isArray(data)) return data as MoodCheckIn[];
  if (data && Array.isArray(data.results)) return data.results as MoodCheckIn[];
  return [];
}

export async function getMoodCheckIn(id: string | number): Promise<MoodCheckIn> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load mood check-in (${resp.status})`);
  return resp.json();
}

export async function createMoodCheckIn(payload: CreateMoodCheckInDto): Promise<MoodCheckIn> {
  const resp = await authorizedFetch(BASE_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to create mood check-in (${resp.status})`);
  }
  return resp.json();
}

export async function updateMoodCheckIn(id: string | number, payload: Partial<CreateMoodCheckInDto>): Promise<MoodCheckIn> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to update mood check-in (${resp.status})`);
  }
  return resp.json();
}

export async function deleteMoodCheckIn(id: string | number): Promise<void> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, { method: 'DELETE' });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to delete mood check-in (${resp.status})`);
  }
}
