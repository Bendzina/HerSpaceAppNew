import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ActivityScreenProps {
  activity: {
    id: string | number;
    title: string;
    description: string;
    duration_minutes: number;
    image?: string;
    short_description?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    icon?: string;
    category?: string;
    created_at?: string;
    updated_at?: string;
  };
}

interface ActivityType {
  id: string | number;
  title: string;
  description: string;
  duration_minutes: number;
  audio_file?: string;
  image?: string;
  short_description?: string;
  icon?: string;
  category?: string;
  difficulty?: string;
  created_at?: string;
  updated_at?: string;
}

export default function ActivityScreen({ activity }: ActivityScreenProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(activity.duration_minutes * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Navigation handler for going back to the mindfulness screen
  const handleBackPress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    router.replace('/mindful');
  };

  // Timer functionality
  const startTimer = () => {
    // Clear any existing interval to prevent multiple timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset time if it's already at 0
    if (timeRemaining <= 0) {
      setTimeRemaining(activity.duration_minutes * 60);
    }
    
    // Start the timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prevTime => {
        const newTime = prevTime - 1;
        
        if (newTime <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsRunning(false);
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeRemaining(activity.duration_minutes * 60);
  };

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        return false;
      }
    );

    return () => {
      backHandler.remove();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Initialize timer when component mounts
  useEffect(() => {
    setIsLoading(false);
    setTimeRemaining(activity.duration_minutes * 60);
    
    // Start the timer automatically when component mounts
    startTimer();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activity.duration_minutes]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={50} color="#FF3B30" style={styles.errorIcon} />
        <Text style={[styles.errorText, { color: '#000' }]}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => startTimer()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { flex: 1 }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBackPress}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: '#000' }]}>{activity.title}</Text>
      </View>

      <View style={styles.content}>
        {activity.image && (
          <Image 
            source={{ uri: activity.image }} 
            style={[styles.image, { width: width * 0.9 }]} 
            resizeMode="cover"
          />
        )}
        
        <Text style={[styles.description, { color: '#000' }]}>{activity.description}</Text>
        
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, { color: '#000' }]}>{formatTime(timeRemaining)}</Text>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.controlButton, { opacity: timeRemaining === 0 ? 0.5 : 1 }]} 
            onPress={resetTimer}
            disabled={timeRemaining === 0}
          >
            <Ionicons name="refresh" size={32} color="#000" />
            <Text style={styles.controlText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => {
              if (isRunning) {
                pauseTimer();
              } else {
                startTimer();
              }
            }}
            activeOpacity={0.7}
          >
            {isRunning ? (
              <Ionicons name="pause" size={40} color="#FFF" />
            ) : (
              <Ionicons name="play" size={40} color="#FFF" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, { opacity: timeRemaining === 0 ? 0.5 : 1 }]} 
            onPress={handleBackPress}
            disabled={timeRemaining === 0}
          >
            <Ionicons name="close" size={32} color="#000" />
            <Text style={styles.controlText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  controlText: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  errorIcon: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#333',
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  playButton: {
    backgroundColor: '#6200EE',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
  },
  noAudioText: {
    marginTop: 10,
    color: '#757575',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
