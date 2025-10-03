import { authorizedFetch } from './authService';

export type RoutineType = 'feeding' | 'sleep' | 'play' | 'health' | 'other' | string;
export interface ChildcareRoutine {
  id: number | string;
  title: string;
  routine_type: RoutineType;
  description?: string;
  time_of_day?: string; // e.g., 'morning', 'afternoon', 'evening'
  duration_minutes?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Note: authorizedFetch already adds the base URL, so we only need the path after /api
const BASE = 'motherhood/routines/';

export type ListParams = {
  search?: string;
  ordering?: string; // created_at, -created_at, time_of_day
  routine_type?: RoutineType;
  is_active?: boolean;
};

function toQuery(p?: ListParams): string {
  if (!p) return '';
  const q = new URLSearchParams();
  if (p.search) q.set('search', p.search);
  if (p.ordering) q.set('ordering', p.ordering);
  if (p.routine_type) q.set('routine_type', String(p.routine_type));
  if (typeof p.is_active === 'boolean') q.set('is_active', String(p.is_active));
  return q.toString();
}

export async function listRoutines(params?: ListParams): Promise<ChildcareRoutine[]> {
  const query = toQuery(params);
  const url = query ? `${BASE}?${query}` : BASE;
  const resp = await authorizedFetch(url, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load routines (${resp.status})`);
  const data = await resp.json();
  if (Array.isArray(data)) return data as ChildcareRoutine[];
  if (data && Array.isArray(data.results)) return data.results as ChildcareRoutine[];
  return [];
}

export async function getRoutine(id: string | number): Promise<ChildcareRoutine> {
  const resp = await authorizedFetch(`${BASE}${id}/`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load routine (${resp.status})`);
  return resp.json();
}

export type CreateRoutineDto = Omit<ChildcareRoutine, 'id' | 'created_at' | 'updated_at'>;

export async function createRoutine(payload: CreateRoutineDto): Promise<ChildcareRoutine> {
  const resp = await authorizedFetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(t || `Failed to create routine (${resp.status})`);
  }
  return resp.json();
}

export async function updateRoutine(id: string | number, payload: Partial<CreateRoutineDto>): Promise<ChildcareRoutine> {
  const resp = await authorizedFetch(`${BASE}${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(t || `Failed to update routine (${resp.status})`);
  }
  return resp.json();
}

export async function deleteRoutine(id: string | number): Promise<void> {
  const url = `${BASE}${id}/`;
  const resp = await authorizedFetch(url, {
    method: 'DELETE',
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(t || `Failed to delete routine (${resp.status})`);
  }
}
