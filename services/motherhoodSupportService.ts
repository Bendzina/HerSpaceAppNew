import { authorizedFetch } from './authService';

export interface SupportGroup {
  id: number | string;
  name: string;
  group_type?: string;
  description?: string;
  is_private?: boolean;
  max_members?: number;
  current_members?: number;
  is_active?: boolean;
  created_at?: string;
}

const BASE = '/motherhood/support-groups/';

export type ListParams = {
  search?: string;
  ordering?: string; // created_at, -created_at, name
  group_type?: string;
  is_private?: boolean;
  is_active?: boolean;
};

function toQuery(p?: ListParams): string {
  if (!p) return '';
  const q = new URLSearchParams();
  if (p.search) q.set('search', p.search);
  if (p.ordering) q.set('ordering', p.ordering);
  if (p.group_type) q.set('group_type', p.group_type);
  if (typeof p.is_private === 'boolean') q.set('is_private', String(p.is_private));
  if (typeof p.is_active === 'boolean') q.set('is_active', String(p.is_active));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function listSupportGroups(params?: ListParams): Promise<SupportGroup[]> {
  const resp = await authorizedFetch(`${BASE}${toQuery(params)}`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load support groups (${resp.status})`);
  const data = await resp.json();
  if (Array.isArray(data)) return data as SupportGroup[];
  if (data && Array.isArray(data.results)) return data.results as SupportGroup[];
  return [];
}

export async function getSupportGroup(id: string | number): Promise<SupportGroup> {
  const resp = await authorizedFetch(`${BASE}${id}/`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load support group (${resp.status})`);
  return resp.json();
}
