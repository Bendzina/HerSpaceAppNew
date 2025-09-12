import { authorizedFetch } from './authService';

export interface JournalEntry {
  id: string | number;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateJournalEntryDto {
  title: string;
  content: string;
}

const BASE_PATH = '/journal/journal-entries/';

type ListParams = {
  search?: string;
  ordering?: string; // e.g. 'created_at' or '-created_at'
  created_at?: string; // ISO date string if you expose it that way
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

export async function listEntries(params?: ListParams): Promise<JournalEntry[]> {
  const resp = await authorizedFetch(`${BASE_PATH}${toQuery(params)}`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load entries (${resp.status})`);
  const data = await resp.json();
  // Support both unpaginated (array) and paginated ({ results: [...] }) responses
  if (Array.isArray(data)) return data as JournalEntry[];
  if (data && Array.isArray(data.results)) return data.results as JournalEntry[];
  // Fallback to empty array if unexpected shape
  return [];
}

export async function getEntry(id: string | number): Promise<JournalEntry> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load entry (${resp.status})`);
  return resp.json();
}

export async function createEntry(payload: CreateJournalEntryDto): Promise<JournalEntry> {
  const resp = await authorizedFetch(BASE_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to create entry (${resp.status})`);
  }
  return resp.json();
}

export async function updateEntry(id: string | number, payload: Partial<CreateJournalEntryDto>): Promise<JournalEntry> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to update entry (${resp.status})`);
  }
  return resp.json();
}

export async function deleteEntry(id: string | number): Promise<void> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, { method: 'DELETE' });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to delete entry (${resp.status})`);
  }
}
