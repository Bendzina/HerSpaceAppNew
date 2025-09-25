import { authorizedFetch } from './authService';

export interface MindfulnessActivity {
  id: string | number;
  title: string;
  description: string;
  short_description: string;
  icon: string;
  duration_minutes: number;
  duration: string; // Added for display purposes
  image?: string;
  category: 'breathing' | 'meditation' | 'body_scan' | 'gratitude' | 'visualization' | 'movement';
  category_display: string; // Added for displaying human-readable category
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
  title_ka?: string;
  description_ka?: string;
  short_description_ka?: string;
}

export async function getMindfulnessActivities(language: string = 'en'): Promise<MindfulnessActivity[]> {
  console.log('Fetching mindfulness activities...');
  
  try {
    console.log('Trying to fetch from API...');
    const response = await authorizedFetch(`/wellness/mindfulness/activities/?lang=${language}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('API response:', response);

    if (response && response.ok) {
      console.log('Response OK, parsing JSON...');
      const data = await response.json();
      console.log('Parsed data:', data);
      
      if (Array.isArray(data)) {
        if (data.length > 0) {
          const activities = data.map(processActivity);
          console.log('Processed activities:', activities);
          return activities;
        } else {
          console.warn('API returned empty array, using sample data');
        }
      } else {
        console.warn('API did not return an array:', data);
      }
    } else {
      console.warn('API request failed or response not OK:', response);
    }
  } catch (error) {
    console.warn('Using sample mindfulness activities due to error:', error);
  }

  console.log('Falling back to sample activities...');
  const sampleActivities = getSampleActivities(language);
  console.log('Sample activities:', sampleActivities);
  return sampleActivities;
}

export async function trackMindfulnessActivity(activityId: string | number): Promise<{message: string, activity: MindfulnessActivity}> {
  try {
    const response = await authorizedFetch(`/wellness/mindfulness/activities/${activityId}/track/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Tracking endpoint not found, using mock response');
        // Return a mock success response for sample data
        return {
          message: 'Activity started successfully',
          activity: getSampleActivities('en').find(a => a.id === activityId) || getSampleActivities('en')[0]
        };
      }
      const error = await response.json();
      throw new Error(error.detail || 'Failed to track activity');
    }

    return response.json();
  } catch (error) {
    console.warn('Tracking failed, using mock response:', error);
    // Return a mock success response for sample data
    return {
      message: 'Activity started successfully',
      activity: getSampleActivities('en').find(a => a.id === activityId) || getSampleActivities('en')[0]
    };
  }
}

function processActivity(activity: any): MindfulnessActivity {
  return {
    id: activity.id,
    title: activity.title || 'Untitled Activity',
    description: activity.description || '',
    short_description: activity.short_description || '',
    icon: activity.icon || 'help-circle',
    duration_minutes: activity.duration_minutes || 5,
    duration: activity.duration || '5 min',
    category: ['breathing', 'meditation', 'body_scan', 'gratitude', 'visualization', 'movement'].includes(activity.category) 
      ? activity.category 
      : 'meditation',
    category_display: activity.category_display || 'Meditation',
    difficulty: ['beginner', 'intermediate', 'advanced'].includes(activity.difficulty)
      ? activity.difficulty
      : 'beginner',
    created_at: activity.created_at || new Date().toISOString(),
    updated_at: activity.updated_at || new Date().toISOString(),
    title_ka: activity.title_ka,
    description_ka: activity.description_ka,
    short_description_ka: activity.short_description_ka,
  };
}

function getSampleActivities(language: string): MindfulnessActivity[] {
  const sampleActivities = [
    {
      id: 1,
      title: 'Deep Breathing',
      title_ka: 'ღრმა სუნთქვა',
      description: 'A simple breathing exercise to help you relax and reduce stress. Inhale deeply through your nose, hold for a moment, then exhale slowly through your mouth.',
      description_ka: 'მარტივი სუნთქვის ვარჯიში, რომელიც დაგეხმარებათ დასვენებაში და სტრესის შემცირებაში. ჩაისუნთქეთ ღრმად ცხვირით, გაჩერდით, შემდეგ ნელა ამოისუნთქეთ პირით.',
      short_description: 'Calm your mind with deep breathing',
      short_description_ka: 'დააწყნარეთ გონება ღრმა სუნთქვით',
      icon: 'leaf',
      duration_minutes: 5,
      duration: '5 min',
      category: 'breathing',
      category_display: 'Breathing',
      difficulty: 'beginner',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    },
    {
      id: 2,
      title: 'Morning Meditation',
      title_ka: 'დილის მედიტაცია',
      description: 'Start your day with a peaceful meditation session to set positive intentions and clear your mind for the day ahead.',
      description_ka: 'დაიწყეთ დღე მშვიდი მედიტაციით, რათა დაისვათ დადებითი განწყობილება და გაასუფთაოთ გონება მომავალი დღისთვის.',
      short_description: 'Begin your day with clarity',
      short_description_ka: 'დაიწყეთ დღე სიწმინდით',
      icon: 'sunny',
      duration_minutes: 10,
      duration: '10 min',
      category: 'meditation',
      category_display: 'Meditation',
      difficulty: 'beginner',
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z'
    },
    {
      id: 3,
      title: 'Body Scan',
      title_ka: 'სხეულის სკანირება',
      description: 'A guided body scan meditation to help you connect with your body and release tension from head to toe.',
      description_ka: 'ხელმძღვანელობითი სხეულის სკანირების მედიტაცია, რომელიც დაგეხმარებათ დაუკავშირდეთ თქვენს სხეულს და გაათავისუფლოთ დაძაბულობა თავიდან ფეხებამდე.',
      short_description: 'Release tension through awareness',
      short_description_ka: 'გაათავისუფლეთ დაძაბულობა ცნობიერების მეშვეობით',
      icon: 'body',
      duration_minutes: 15,
      duration: '15 min',
      category: 'body_scan',
      category_display: 'Body Scan',
      difficulty: 'intermediate',
      created_at: '2023-01-03T00:00:00Z',
      updated_at: '2023-01-03T00:00:00Z'
    },
    {
      id: 4,
      title: 'Gratitude Practice',
      title_ka: 'მადლიერების პრაქტიკა',
      description: 'Cultivate gratitude by focusing on the positive aspects of your life and expressing appreciation.',
      description_ka: 'განავითარეთ მადლიერება თქვენი ცხოვრების დადებითი მხარეების ფოკუსირებით და მადლიერების გამოხატვით.',
      short_description: 'Focus on the positive',
      short_description_ka: 'ფოკუსირება დადებითზე',
      icon: 'heart',
      duration_minutes: 5,
      duration: '5 min',
      category: 'gratitude',
      category_display: 'Gratitude',
      difficulty: 'beginner',
      created_at: '2023-01-04T00:00:00Z',
      updated_at: '2023-01-04T00:00:00Z'
    },
    {
      id: 5,
      title: 'Loving-Kindness Meditation',
      title_ka: 'სიყვარულისა და სიკეთის მედიტაცია',
      description: 'Send loving-kindness and compassion to yourself and others with this heart-opening practice.',
      description_ka: 'გაგზავნეთ სიყვარული და თანაგრძნობა საკუთარ თავს და სხვებს ამ გულის გახსნის პრაქტიკით.',
      short_description: 'Cultivate compassion',
      short_description_ka: 'განავითარეთ თანაგრძნობა',
      icon: 'heart-circle',
      duration_minutes: 10,
      duration: '10 min',
      category: 'meditation',
      category_display: 'Meditation',
      difficulty: 'intermediate',
      created_at: '2023-01-05T00:00:00Z',
      updated_at: '2023-01-05T00:00:00Z'
    }
  ] as const;

  return sampleActivities.map(activity => ({
    ...activity,
    title: language === 'ka' && activity.title_ka ? activity.title_ka : activity.title,
    description: language === 'ka' && activity.description_ka ? activity.description_ka : activity.description,
    short_description: language === 'ka' && activity.short_description_ka ? activity.short_description_ka : activity.short_description,
  }));
}
