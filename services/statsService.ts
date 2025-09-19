import { authorizedFetch } from './authService';

interface UserStats {
  day_streak: number;
  rituals_completed: number;
  journal_entries: number;
}

export async function getUserStats(): Promise<UserStats> {
  try {
    const response = await authorizedFetch('/users/stats/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Return default values if there's an error
    return {
      day_streak: 0,
      rituals_completed: 0,
      journal_entries: 0
    };
  }
}
