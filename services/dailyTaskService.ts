import { authorizedFetch } from './authService';

export interface DailyTask {
  id: string | number;
  date: string; // read-only (set by backend to today)
  body_task: string;
  work_task: string;
  soul_task: string;
  completed: boolean;
}

export interface CreateDailyTaskDto {
  body_task: string;
  work_task: string;
  soul_task: string;
}

const BASE_PATH = '/journal/daily-tasks/';

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

export async function listDailyTasks(params?: ListParams): Promise<DailyTask[]> {
  const resp = await authorizedFetch(`${BASE_PATH}${toQuery(params)}`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load daily tasks (${resp.status})`);
  const data = await resp.json();
  if (Array.isArray(data)) return data as DailyTask[];
  if (data && Array.isArray(data.results)) return data.results as DailyTask[];
  return [];
}

export async function getDailyTask(id: string | number): Promise<DailyTask> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load daily task (${resp.status})`);
  return resp.json();
}

export async function createDailyTask(payload: CreateDailyTaskDto): Promise<DailyTask> {
  const resp = await authorizedFetch(BASE_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to create daily task (${resp.status})`);
  }
  return resp.json();
}

export async function updateDailyTask(id: string | number, payload: Partial<CreateDailyTaskDto & { completed: boolean }>): Promise<DailyTask> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to update daily task (${resp.status})`);
  }
  return resp.json();
}

export async function deleteDailyTask(id: string | number): Promise<void> {
  const resp = await authorizedFetch(`${BASE_PATH}${id}/`, { method: 'DELETE' });
  if (!resp.ok) {
    const raw = await resp.text();
    throw new Error(raw || `Failed to delete daily task (${resp.status})`);
  }
}
