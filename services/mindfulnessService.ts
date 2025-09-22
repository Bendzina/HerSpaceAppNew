import { authorizedFetch } from './authService';

export interface MindfulnessActivity {
  id: string | number;
  title: string;
  description: string;
  short_description: string;
  icon: string;
  duration_minutes: number;
  duration: string; // Added for display purposes
  audio_file?: string;
  image?: string;
  category: 'breathing' | 'meditation' | 'body_scan' | 'gratitude' | 'visualization' | 'movement';
  category_display: string; // Added for displaying human-readable category
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
  // Localized fields (handled by the backend based on Accept-Language header)
  title_ka?: string;
  description_ka?: string;
  short_description_ka?: string;
}

export async function getMindfulnessActivities(language: string = 'en'): Promise<MindfulnessActivity[]> {
  try {
    console.log('Fetching mindfulness activities...');
    const url = `/wellness/mindfulness/activities/?lang=${language}`;
    console.log('Request URL:', url);
    
    const response = await authorizedFetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorText = '';
      try {
        // First try to get the response as text
        errorText = await response.text();
        // Then try to parse it as JSON
        try {
          const errorData = JSON.parse(errorText);
          console.error('API Error Response (JSON):', errorData);
          throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        } catch (jsonError) {
          // If it's not JSON, use the raw text
          console.error('API Error Response (text):', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error processing error response:', error);
        const status = response?.status || 'unknown';
        const statusText = response?.statusText || 'Unknown Error';
        throw new Error(`HTTP ${status}: ${statusText} - Could not process error response`);
      }
    }
    
    let data;
    try {
      const responseText = await response.text();
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Invalid response format from server');
    }
    return data.map((activity: Omit<MindfulnessActivity, 'duration'>) => ({
      ...activity,
      // Ensure we have a default icon if not provided
      icon: activity.icon || 'leaf',
      // Add duration string for display
      duration: `${activity.duration_minutes} min`,
    }));
  } catch (error) {
    console.error('Error fetching mindfulness activities:', error);
    throw error;
  }
}

export async function trackMindfulnessActivity(activityId: string | number): Promise<{message: string, activity: MindfulnessActivity}> {
  try {
    const response = await authorizedFetch('/wellness/mindfulness/activities/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ activity: activityId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to track mindfulness activity');
    }

    return await response.json();
  } catch (error) {
    console.error('Error tracking mindfulness activity:', error);
    throw error;
  }
}
