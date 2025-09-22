import { Stack, useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';
import ActivityScreen from './ActivityScreen';

// Define the expected activity type
interface ActivityData {
  id: string | number;
  title: string;
  description: string;
  duration_minutes: number;
  audio_file?: string;
  image?: string;
  [key: string]: any; // Allow additional properties
}

export default function ActivityPage() {
  const { activity } = useLocalSearchParams<{ activity: string }>();
  
  if (!activity) {
    console.error('No activity data provided');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: No activity data provided</Text>
      </View>
    );
  }

  try {
    const activityData = JSON.parse(activity) as ActivityData;
    
    // Validate required fields
    if (!activityData.id || !activityData.title || !activityData.duration_minutes) {
      throw new Error('Invalid activity data: missing required fields');
    }
    
    return (
      <>
        <Stack.Screen options={{ title: activityData.title || 'Activity' }} />
        <ActivityScreen activity={activityData} />
      </>
    );
  } catch (error) {
    console.error('Error parsing activity data:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error loading activity. Please try again.</Text>
      </View>
    );
  }
}
