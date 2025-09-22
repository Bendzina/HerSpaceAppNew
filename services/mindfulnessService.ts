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
    
    // Use authorizedFetch which will handle authentication
    const response = await authorizedFetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response) {
      throw new Error('No response received from server');
    }
    
    // Log response details
    console.log('Response status:', response.status);
    const headers = Object.fromEntries([...response.headers.entries()]);
    console.log('Response headers:', JSON.stringify(headers, null, 2));
    
    // Get the response text
    const responseText = await response.text();
    
    // Log first 500 chars of response for debugging
    const previewLength = Math.min(500, responseText.length);
    console.log('Response preview:', responseText.substring(0, previewLength));
    
    // Check if response is empty
    if (!responseText.trim()) {
      throw new Error('Empty response received from server');
    }
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // If it's not JSON, log more details
      console.error('Failed to parse response as JSON. Response type:', headers['content-type']);
      console.error('Response length:', responseText.length);
      
      // Try to detect common error patterns
      if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE html>')) {
        console.error('Server returned HTML instead of JSON. This might be a server-side error page.');
        throw new Error('Server returned an HTML error page. Please check the server logs.');
      }
      
      if (responseText.includes('CSRF') || responseText.includes('Forbidden')) {
        console.error('Possible authentication/CSRF error in response');
        throw new Error('Authentication error. Please log in again.');
      }
      
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      throw new Error(`Invalid JSON response: ${errorMessage}`);
    }
    
    if (!response.ok) {
      console.error('API Error:', data);
      throw new Error(data?.detail || data?.message || 'Failed to fetch mindfulness activities');
    }
    
    console.log('Successfully parsed JSON response');
    
    // Process the response data
    if (Array.isArray(data)) {
      return data.map((activity: any) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        short_description: activity.short_description || '',
        icon: activity.icon || 'leaf',
        duration_minutes: activity.duration_minutes || 5,
        duration: `${activity.duration_minutes || 5} min`,
        audio_file: activity.audio_file || null,
        image: activity.image || null,
        category: activity.category || 'meditation',
        category_display: activity.category_display || 'Meditation',
        difficulty: activity.difficulty || 'beginner',
        created_at: activity.created_at || new Date().toISOString(),
        updated_at: activity.updated_at || new Date().toISOString(),
      }));
    }
    
    console.warn('Expected array of activities but got:', typeof data);
    return [];
  } catch (error) {
    console.error('Error in getMindfulnessActivities:', error);
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
