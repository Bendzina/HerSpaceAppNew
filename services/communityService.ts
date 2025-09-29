import { authorizedFetch } from './authService';

export type CommunityPostType = 'support' | 'celebration' | 'advice' | 'story' | 'question' | 'gratitude';

export interface CommunityPost {
  id: number;
  post_type: CommunityPostType;
  title: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at?: string;
  comment_count?: number;
  reaction_count?: number;
  user_reactions?: string[];
}

export interface ListPostParams {
  search?: string;
  ordering?: string; // -created_at, created_at
  post_type?: CommunityPostType;
}

const BASE = '/community/posts/';

function toQuery(p?: ListPostParams): string {
  if (!p) return '';
  const q = new URLSearchParams();
  if (p.search) q.set('search', p.search);
  if (p.ordering) q.set('ordering', p.ordering);
  if (p.post_type) q.set('post_type', p.post_type);
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function listCommunityPosts(params?: ListPostParams): Promise<CommunityPost[]> {
  const resp = await authorizedFetch(`${BASE}${toQuery(params)}`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load posts (${resp.status})`);
  const data = await resp.json();
  if (Array.isArray(data)) return data as CommunityPost[];
  if (data && Array.isArray(data.results)) return data.results as CommunityPost[];
  return [];
}

export async function getCommunityPost(id: number | string): Promise<CommunityPost> {
  const resp = await authorizedFetch(`${BASE}${id}/`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load post (${resp.status})`);
  return resp.json();
}

export async function createCommunityPost(input: {
  post_type: CommunityPostType;
  title: string;
  content: string;
  is_anonymous?: boolean;
}) {
  const resp = await authorizedFetch(`${BASE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!resp.ok) throw new Error(`Failed to create post (${resp.status})`);
  return resp.json();
}

export interface User {
  id: number;
  name: string;
  email?: string;
}

export interface CommunityComment {
  id: number;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  user?: User;
}

export async function listCommunityComments(postId: number | string): Promise<CommunityComment[]> {
  const resp = await authorizedFetch(`/community/posts/${postId}/comments/`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load comments (${resp.status})`);
  const data = await resp.json();
  if (Array.isArray(data)) return data as CommunityComment[];
  if (data && Array.isArray(data.results)) return data.results as CommunityComment[];
  return [];
}

export async function addCommunityComment(postId: number | string, input: { content: string; is_anonymous?: boolean; }) {
  const resp = await authorizedFetch(`/community/posts/${postId}/comments/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!resp.ok) throw new Error(`Failed to add comment (${resp.status})`);
  return resp.json();
}

export type ReactionType = 'heart' | 'support' | 'prayer' | 'celebration' | 'hug';

export interface CommunityReaction {
  id: number;
  reaction_type: ReactionType;
  is_anonymous?: boolean;
  created_at: string;
}

export async function listCommunityReactions(postId: number | string): Promise<CommunityReaction[]> {
  const resp = await authorizedFetch(`/community/posts/${postId}/reactions/list/`, { method: 'GET' });
  if (!resp.ok) throw new Error(`Failed to load reactions (${resp.status})`);
  const data = await resp.json();
  if (Array.isArray(data)) return data as CommunityReaction[];
  if (data && Array.isArray(data.results)) return data.results as CommunityReaction[];
  return [];
}

export async function removeCommunityReaction(postId: number | string, reaction_type: ReactionType) {
  const resp = await authorizedFetch(`/community/posts/${postId}/reactions/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reaction_type, is_remove: true }),
  });
  if (!resp.ok) throw new Error(`Failed to remove reaction (${resp.status})`);
  return resp.json();
}

export async function addCommunityReaction(postId: number | string, reaction_type: ReactionType, is_anonymous?: boolean) {
  const resp = await authorizedFetch(`/community/posts/${postId}/reactions/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reaction_type, is_anonymous }),
  });
  if (!resp.ok) throw new Error(`Failed to add reaction (${resp.status})`);
  return resp.json();
}
