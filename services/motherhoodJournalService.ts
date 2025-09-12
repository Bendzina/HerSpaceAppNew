import { authorizedFetch } from './authService';

export type Mood = 'happy' | 'sad' | 'anxious' | 'calm' | string;
export interface MotherhoodJournalEntry {
  id: number | string;
  title: string;
  content: string;
  mood?: Mood | null;
  is_private?: boolean;
  created_at?: string;
  updated_at?: string;
}

const BASE = '/motherhood/journal/';

export type ListParams = {
  search?: string;
  ordering?: string; // created_at, -created_at, updated_at
  mood?: Mood;
  is_private?: boolean;
};

function toQuery(p?: ListParams): string {
  if (!p) return '';
  const q = new URLSearchParams();
  if (p.search) q.set('search', p.search);
  if (p.ordering) q.set('ordering', p.ordering);
  if (p.mood) q.set('mood', String(p.mood));
  if (typeof p.is_private === 'boolean') q.set('is_private', String(p.is_private));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function listJournal(params?: ListParams): Promise<MotherhoodJournalEntry[]> {
  const resp = await authorizedFetch(`${BASE}${toQuery(params)}`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load entries (${resp.status})`);
  const data = await resp.json();
  if (Array.isArray(data)) return data as MotherhoodJournalEntry[];
  if (data && Array.isArray(data.results)) return data.results as MotherhoodJournalEntry[];
  return [];
}

export async function getJournal(id: string | number): Promise<MotherhoodJournalEntry> {
  const resp = await authorizedFetch(`${BASE}${id}/`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load entry (${resp.status})`);
  return resp.json();
}

export type CreateJournalDto = {
  title: string;
  content: string;
  mood?: Mood | null;
  is_private?: boolean;
};

export async function createJournal(payload: CreateJournalDto): Promise<MotherhoodJournalEntry> {
  const resp = await authorizedFetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(t || `Failed to create entry (${resp.status})`);
  }
  return resp.json();
}

export async function updateJournal(id: string | number, payload: Partial<CreateJournalDto>): Promise<MotherhoodJournalEntry> {
  const resp = await authorizedFetch(`${BASE}${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(t || `Failed to update entry (${resp.status})`);
  }
  return resp.json();
}

export async function deleteJournal(id: string | number): Promise<void> {
  const resp = await authorizedFetch(`${BASE}${id}/`, { method: 'DELETE' });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(t || `Failed to delete entry (${resp.status})`);
  }
}
