import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

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

export default function ActivityScreen({ activity }: ActivityScreenProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(activity.duration_minutes * 60);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Get category specific colors and icon
  const getCategoryTheme = (category?: string) => {
    const themes = {
      breathing: {
        gradient: ['#4FACFE', '#00F2FE'] as const,
        icon: 'leaf-outline',
        bgGradient: ['#E3F2FD', '#F0F4FF'] as const,
      },
      meditation: {
        gradient: ['#A18CD1', '#FBC2EB'] as const,
        icon: 'flower-outline',
        bgGradient: ['#F3E5F5', '#FCE4EC'] as const,
      },
      body_scan: {
        gradient: ['#667EEA', '#764BA2'] as const,
        icon: 'body-outline',
        bgGradient: ['#E8EAF6', '#F3E5F5'] as const,
      },
      gratitude: {
        gradient: ['#FF9A9E', '#FECFEF'] as const,
        icon: 'heart-outline',
        bgGradient: ['#FFF3E0', '#FCE4EC'] as const,
      },
      visualization: {
        gradient: ['#FA709A', '#FEE140'] as const,
        icon: 'eye-outline',
        bgGradient: ['#FFF8E1', '#FCE4EC'] as const,
      },
      movement: {
        gradient: ['#4ECDC4', '#44A08D'] as const,
        icon: 'walk-outline',
        bgGradient: ['#E0F2F1', '#E8F5E8'] as const,
      },
    };
    return themes[category as keyof typeof themes] || themes.meditation;
  };

  const theme = getCategoryTheme(activity.category);

  // Navigation handler
  const handleBackPress = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    router.replace('/mindful');
  };

  // Timer functionality
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (timeRemaining <= 0) {
      setTimeRemaining(activity.duration_minutes * 60);
      setProgress(0);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prevTime => {
        const newTime = prevTime - 1;
        const totalTime = activity.duration_minutes * 60;
        const newProgress = ((totalTime - newTime) / totalTime) * 100;
        setProgress(newProgress);
        
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
    setProgress(0);
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

  useEffect(() => {
    setIsLoading(false);
    setTimeRemaining(activity.duration_minutes * 60);
    setProgress(0);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activity.duration_minutes]);

  if (isLoading) {
    return (
      <LinearGradient colors={theme.bgGradient} style={[styles.container, styles.centerContent]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.gradient[0]} />
          <Text style={styles.loadingText}>Loading meditation...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={theme.bgGradient} style={[styles.container, styles.centerContent]}>
        <View style={styles.errorContainer}>
          <Ionicons name="sad-outline" size={80} color={theme.gradient[0]} style={styles.errorIcon} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => startTimer()}>
            <LinearGradient colors={theme.gradient} style={styles.buttonGradient}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.bgGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
            <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']} style={styles.headerButtonGradient}>
              <Ionicons name="chevron-back" size={24} color="#2D3748" />
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{activity.title}</Text>
            <View style={styles.categoryBadge}>
              <LinearGradient colors={theme.gradient} style={styles.categoryBadgeGradient}>
                <Ionicons name={theme.icon as any} size={14} color="#FFF" />
                <Text style={styles.categoryText}>{activity.category?.replace('_', ' ')}</Text>
              </LinearGradient>
            </View>
          </View>

          <TouchableOpacity style={styles.headerButton}>
            <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']} style={styles.headerButtonGradient}>
              <Ionicons name="settings-outline" size={20} color="#2D3748" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Image/Visual Section */}
          <View style={styles.visualSection}>
            {activity.image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: activity.image }} style={styles.image} resizeMode="cover" />
                <LinearGradient 
                  colors={['transparent', 'rgba(0,0,0,0.3)']} 
                  style={styles.imageOverlay}
                />
              </View>
            ) : (
              <View style={styles.iconContainer}>
                <LinearGradient colors={theme.gradient} style={styles.iconGradient}>
                  <Ionicons name={theme.icon as any} size={80} color="#FFF" />
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.description}>{activity.description}</Text>

          {/* Progress Circle & Timer */}
          <View style={styles.timerSection}>
            <View style={styles.progressContainer}>
              {/* Progress Circle Background */}
              <View style={styles.progressCircle}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={styles.progressTrack}
                />
                
                {/* Progress Fill */}
                <LinearGradient
                  colors={theme.gradient}
                  style={[
                    styles.progressFill,
                    {
                      transform: [
                        { rotate: `${(progress * 3.6) - 90}deg` }
                      ]
                    }
                  ]}
                />
                
                {/* Center Content */}
                <View style={styles.timerContent}>
                  <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                  <Text style={styles.timerLabel}>
                    {timeRemaining === 0 ? 'Complete!' : isRunning ? 'Breathe...' : 'Ready'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.controlButton, { opacity: timeRemaining === 0 ? 0.5 : 1 }]} 
              onPress={resetTimer}
              disabled={timeRemaining === 0}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']} style={styles.controlButtonGradient}>
                <Ionicons name="refresh" size={24} color="#4A5568" />
              </LinearGradient>
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
              activeOpacity={0.8}
            >
              <LinearGradient colors={theme.gradient} style={styles.playButtonGradient}>
                {isRunning ? (
                  <Ionicons name="pause" size={32} color="#FFF" />
                ) : (
                  <Ionicons name="play" size={32} color="#FFF" />
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleBackPress}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.6)']} style={styles.controlButtonGradient}>
                <Ionicons name="checkmark" size={24} color="#4A5568" />
              </LinearGradient>
              <Text style={styles.controlText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Info */}
          <View style={styles.bottomInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color="#718096" />
              <Text style={styles.infoText}>{activity.duration_minutes} minutes</Text>
            </View>
            {activity.difficulty && (
              <View style={styles.infoItem}>
                <Ionicons name="bar-chart-outline" size={16} color="#718096" />
                <Text style={styles.infoText}>{activity.difficulty}</Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  categoryBadge: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  visualSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: width * 0.6,
    height: width * 0.4,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  timerSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  progressFill: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: '#4FACFE',
    transform: [{ rotate: '-90deg' }],
  },
  timerContent: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#2D3748',
    letterSpacing: -1,
  },
  timerLabel: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  controlButton: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  controlButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlText: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '600',
    marginTop: 8,
  },
  playButton: {
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});