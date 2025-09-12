import { authorizedFetch } from './authService';

export type ResourceType = 'article' | 'video' | 'podcast' | 'book' | string;
export interface MotherhoodResource {
  id: number | string;
  title: string;
  resource_type: ResourceType;
  category?: string;
  description?: string;
  url?: string;
  author?: string;
  is_featured?: boolean;
  is_active?: boolean;
  created_at?: string;
}

const BASE_PATH = '/motherhood/resources/';

type ListParams = {
  search?: string;
  ordering?: string; // 'created_at' | '-created_at' | 'title' etc
  resource_type?: ResourceType;
  category?: string;
  is_featured?: boolean;
  is_active?: boolean;
};

function toQuery(params?: ListParams): string {
  if (!params) return '';
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.ordering) q.set('ordering', params.ordering);
  if (params.resource_type) q.set('resource_type', String(params.resource_type));
  if (params.category) q.set('category', params.category);
  if (typeof params.is_featured === 'boolean') q.set('is_featured', String(params.is_featured));
  if (typeof params.is_active === 'boolean') q.set('is_active', String(params.is_active));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function listResources(params?: ListParams): Promise<MotherhoodResource[]> {
  const resp = await authorizedFetch(`${BASE_PATH}${toQuery(params)}`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load resources (${resp.status})`);
  const data = await resp.json();
  if (Array.isArray(data)) return data as MotherhoodResource[];
  if (data && Array.isArray(data.results)) return data.results as MotherhoodResource[];
  return [];
}

export async function getResource(id: string | number): Promise<MotherhoodResource> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load resource (${resp.status})`);
  return resp.json();
}
