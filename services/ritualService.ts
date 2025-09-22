import { authorizedFetch } from './authService';

export type RitualType = 'meditation' | 'affirmation' | 'prompt' | 'tarot' | string;
export type LifePhase = 'any' | 'transition' | 'motherhood' | 'career_stress' | 'healing' | 'self_discovery' | string;
export type EmotionalTone = 'gentle' | 'empowering' | 'grounding' | 'uplifting' | 'healing' | string;

export interface Ritual {
  id: string | number;
  title: string;
  description?: string;
  ritual_type: RitualType;
  content: string;
  for_life_phase: LifePhase;
  emotional_tone: EmotionalTone;
  duration_minutes: number;
  is_for_beginners: boolean;
  tags: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRitualDto {
  title: string;
  description?: string;
  ritual_type: RitualType;
  content: string;
  for_life_phase?: LifePhase;
  emotional_tone?: EmotionalTone;
  duration_minutes?: number;
  is_for_beginners?: boolean;
  tags?: string[];
  is_active?: boolean;
}

const BASE_PATH = '/api/journal/rituals/';

type ListParams = {
  search?: string;
  ordering?: string; // e.g. 'created_at' or '-created_at'
  for_life_phase?: LifePhase | 'all';
  emotional_tone?: EmotionalTone | 'all';
  ritual_type?: RitualType;
  is_for_beginners?: boolean;
};

function toQuery(params?: ListParams): string {
  if (!params) return '';
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.ordering) q.set('ordering', params.ordering);
  if (params.for_life_phase && params.for_life_phase !== 'all') q.set('for_life_phase', String(params.for_life_phase));
  if (params.emotional_tone && params.emotional_tone !== 'all') q.set('emotional_tone', String(params.emotional_tone));
  if (params.ritual_type) q.set('ritual_type', String(params.ritual_type));
  if (typeof params.is_for_beginners === 'boolean') q.set('is_for_beginners', String(params.is_for_beginners));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function listRituals(params?: ListParams): Promise<Ritual[]> {
  const resp = await authorizedFetch(`${BASE_PATH}${toQuery(params)}`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load rituals (${resp.status})`);
  const data = await resp.json();
  if (Array.isArray(data)) return data as Ritual[];
  if (data && Array.isArray(data.results)) return data.results as Ritual[];
  return [];
}

export async function getRitual(id: string | number): Promise<Ritual> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load ritual (${resp.status})`);
  return resp.json();
}

export async function createRitual(payload: CreateRitualDto): Promise<Ritual> {
  const resp = await authorizedFetch(BASE_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to create ritual (${resp.status})`);
  }
  return resp.json();
}

export async function updateRitual(id: string | number, payload: Partial<CreateRitualDto>): Promise<Ritual> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to update ritual (${resp.status})`);
  }
  return resp.json();
}

export async function deleteRitual(id: string | number): Promise<void> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, { method: 'DELETE' });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to delete ritual (${resp.status})`);
  }
}
