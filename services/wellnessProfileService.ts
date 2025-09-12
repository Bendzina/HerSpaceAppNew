import { authorizedFetch } from './authService';

export type UserProfile = {
  current_mood_context?: string | null;
  preferred_support_style?: string | null;
  life_roles?: string[] | null;
  created_at?: string;
  updated_at?: string;
};

const BASE = '/wellness/profile/';

export async function getProfile(): Promise<UserProfile> {
  const resp = await authorizedFetch(BASE, { method: 'GET' });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(t || `Failed to load profile (${resp.status})`);
  }
  return resp.json();
}

export async function updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
  const resp = await authorizedFetch(BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(t || `Failed to update profile (${resp.status})`);
  }
  return resp.json();
}
