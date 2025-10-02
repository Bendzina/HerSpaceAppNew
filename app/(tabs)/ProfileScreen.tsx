import { useAuth } from "@/context/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';

const { width } = Dimensions.get('window');

const translations = {
  en: {
    profile: {
      title: 'My Profile',
      userName: 'Beautiful Soul',
      subtitle: 'Your journey matters ✨',
      joined: 'Joined December 2024',
      dayStreak: 'Day Streak',
      ritualsCompleted: 'Rituals',
      journalEntries: 'Entries',
      settings: 'Settings',
      notifications: 'Notifications',
      accountManagement: 'Account & Security',
      helpSupport: 'Help & Support',
      permissionRequired: 'Permission to access camera roll is required!',
      editName: 'Edit Name',
      saveName: 'Save',
      cancel: 'Cancel',
      enterName: 'Enter your name',
      nameUpdated: 'Name updated successfully! ✨',
      updateError: 'Failed to update name. Please try again.',
      errorTitle: 'Error',
      successTitle: 'Success',
      emptyName: 'Name cannot be empty',
    }
  },
  ka: {
    profile: {
      title: 'ჩემი პროფილი',
      userName: 'ლამაზი სული',
      subtitle: 'შენი მოგზაურობა მნიშვნელოვანია ✨',
      joined: 'შეუერთდა დეკემბერი 2024',
      dayStreak: 'დღეების სერია',
      ritualsCompleted: 'რიტუალები',
      journalEntries: 'ჩანაწერები',
      settings: 'პარამეტრები',
      notifications: 'შეტყობინებები',
      accountManagement: 'ანგარიში და უსაფრთხოება',
      helpSupport: 'დახმარება და მხარდაჭერა',
      permissionRequired: 'საჭიროა ნებართვა ფოტოების გალერეაზე წვდომისთვის!',
      editName: 'სახელის ჩასწორება',
      saveName: 'შენახვა',
      cancel: 'გაუქმება',
      enterName: 'შეიყვანე შენი სახელი',
      nameUpdated: 'სახელი წარმატებით განახლდა! ✨',
      updateError: 'სახელის განახლება ვერ მოხერხდა. გთხოვ სცადე ხელახლა.',
      errorTitle: 'შეცდომა',
      successTitle: 'წარმატება',
      emptyName: 'სახელი არ შეიძლება იყოს ცარიელი',
    }
  }
};

export default function ProfileScreen() {
  const { user, updateUserProfile } = useAuth();
  const [image, setImage] = useState<string | null>(user?.profileImage || null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [stats, setStats] = useState({
    dayStreak: 0,
    ritualsCompleted: 0,
    journalEntries: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { language } = useLanguage();
  
  // Type for profile updates
  type ProfileUpdates = {
    displayName?: string;
    // Add other updateable fields here
  };
  
  const t = translations[language] || translations.en;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user stats
        const statsResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.7:8000/api'}/users/stats/`, {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats({
            dayStreak: data.day_streak || 0,
            ritualsCompleted: data.rituals_completed || 0,
            journalEntries: data.journal_entries || 0
          });
        }

        // Fetch user profile to get the latest image
        const profileResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.7:8000/api'}/users/me/`, {
          headers: {
            'Authorization': `Bearer ${await AsyncStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          
          // Update AuthContext with the latest user data
          await updateUserProfile(userData);
          
          if (userData.profile_image) {
            const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.7:8000';
            const imageUrl = userData.profile_image.startsWith('http')
              ? userData.profile_image
              : `${baseUrl}${userData.profile_image.startsWith('/') ? '' : '/'}${userData.profile_image}`;
            setImage(imageUrl);
          }
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);


  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert(t.profile.errorTitle, t.profile.permissionRequired);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setImage(imageUri);
        
        // Create form data for file upload
        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'profile.jpg';
        const match = /\\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';
        
        // @ts-ignore: TypeScript doesn't know about React Native's file structure
        formData.append('profileImage', {
          uri: imageUri,
          name: filename,
          type,
        });

        // Get the token
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          throw new Error('No access token found');
        }

        // Upload the image
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.4:8000/api'}/users/me/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Failed to upload image');
        }

        // Update the user data in the UI and context
        const updatedUser = await response.json();
        
        if (updatedUser.profile_image) {
          // Construct the full URL for the image
          const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.4:8000';
          const imageUrl = updatedUser.profile_image.startsWith('http')
            ? updatedUser.profile_image
            : `${baseUrl}${updatedUser.profile_image.startsWith('/') ? '' : '/'}${updatedUser.profile_image}`;
            
          setImage(imageUrl);
          
          // Update AuthContext and AsyncStorage with the new profile image
          await updateUserProfile({ profileImage: imageUrl });
        }
      }
    } catch (error: any) {
      Alert.alert(t.profile.errorTitle, error?.message || 'Failed to upload image');
    }
  };

  const handleEditName = () => {
    setTempName(user?.displayName || user?.username || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      Alert.alert(t.profile.errorTitle, t.profile.emptyName);
      return;
    }

    try {
      const updates: ProfileUpdates = { displayName: tempName.trim() };
      await updateUserProfile(updates);
      setIsEditingName(false);
      Alert.alert(t.profile.successTitle, t.profile.nameUpdated);
    } catch (error) {
      Alert.alert(t.profile.errorTitle, t.profile.updateError);
    }
  };

  const handleCancel = () => {
    setTempName('');
    setIsEditingName(false);
  };

  const displayName = user?.displayName || user?.username || t.profile.userName;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F0F23' : '#F8F9FA' }]}>
      {/* Gradient background */}
      <LinearGradient
        colors={isDark ? ['#1A1A2E', '#16213E', '#0F0F23'] : ['#E8F4FD', '#F0E8FF', '#FFE5F1']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.9}>
            <LinearGradient
              colors={['#FF6B9D', '#C44569', '#F8B500']}
              style={styles.avatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {image ? (
                <Image 
                  source={{ uri: image }} 
                  style={styles.avatarImage} 
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#2D3748' : '#E2E8F0' }]}>
                  <Text style={[styles.avatarPlaceholderText, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIcon}>
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  style={styles.cameraIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="camera" size={14} color="#FFF" />
                </LinearGradient>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Name Section with Edit Functionality */}
          {isEditingName ? (
            <View style={styles.nameEditContainer}>
              <View style={[styles.nameInputWrapper, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                <TextInput
                  style={styles.nameInput}
                  value={tempName}
                  onChangeText={setTempName}
                  placeholder={t.profile.enterName}
                  placeholderTextColor={colors.textSecondary}
                  autoFocus
                  maxLength={50}
                />
              </View>
              <View style={styles.nameEditButtons}>
                <TouchableOpacity 
                  style={styles.nameButton}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#E2E8F0', '#CBD5E0']}
                    style={styles.nameButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Text style={styles.cancelButtonText}>{t.profile.cancel}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.nameButton}
                  onPress={handleSaveName}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#48BB78', '#38A169']}
                    style={styles.nameButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <Text style={styles.saveButtonText}>{t.profile.saveName}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{displayName}</Text>
              <TouchableOpacity 
                style={styles.editNameButton}
                onPress={handleEditName}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 107, 157, 0.2)', 'rgba(196, 69, 105, 0.2)']}
                  style={styles.editNameGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="pencil" size={14} color="#FF6B9D" />
                  <Text style={styles.editNameText}>{t.profile.editName}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          
          <Text style={styles.profileSubtitle}>{t.profile.subtitle}</Text>
          <Text style={styles.profileJoined}>{t.profile.joined}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
            <LinearGradient
              colors={['#FF6B9D', '#C44569']}
              style={styles.statIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.statIconText}>🔥</Text>
            </LinearGradient>
            <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
              {isLoading ? '...' : stats.dayStreak}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#A0AEC0' : '#718096' }]}>{t.profile.dayStreak}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.statIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.statIconText}>✨</Text>
            </LinearGradient>
            <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
              {isLoading ? '...' : stats.ritualsCompleted}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#A0AEC0' : '#718096' }]}>{t.profile.ritualsCompleted}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}>
            <LinearGradient
              colors={['#48BB78', '#38A169']}
              style={styles.statIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.statIconText}>📖</Text>
            </LinearGradient>
            <Text style={[styles.statNumber, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
              {isLoading ? '...' : stats.journalEntries}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#A0AEC0' : '#718096' }]}>{t.profile.journalEntries}</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>{t.profile.settings}</Text>

          {/* Settings Items */}
          <TouchableOpacity 
            style={[styles.settingsCard, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}
            onPress={() => router.push('/NotificationsScreen')}
            activeOpacity={0.9}
          >
            <View style={styles.settingsContent}>
              <View style={styles.settingsIcon}>
                <LinearGradient
                  colors={['#FF6B9D', '#C44569']}
                  style={styles.settingsIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.settingsIconText}>🔔</Text>
                </LinearGradient>
              </View>
              <View style={styles.settingsTextContainer}>
                <Text style={[styles.settingsLabel, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>{t.profile.notifications}</Text>
                <Text style={[styles.settingsSubtitle, { color: isDark ? '#A0AEC0' : '#718096' }]}>Manage your notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#A0AEC0' : '#718096'} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingsCard, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}
            onPress={() => router.push('/PasswordScreen')}
            activeOpacity={0.9}
          >
            <View style={styles.settingsContent}>
              <View style={styles.settingsIcon}>
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  style={styles.settingsIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.settingsIconText}>🔒</Text>
                </LinearGradient>
              </View>
              <View style={styles.settingsTextContainer}>
                <Text style={[styles.settingsLabel, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>{t.profile.accountManagement}</Text>
                <Text style={[styles.settingsSubtitle, { color: isDark ? '#A0AEC0' : '#718096' }]}>Security & privacy settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#A0AEC0' : '#718096'} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingsCard, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF' }]}
            onPress={() => router.push('/HelpScreen')}
            activeOpacity={0.9}
          >
            <View style={styles.settingsContent}>
              <View style={styles.settingsIcon}>
                <LinearGradient
                  colors={['#F8B500', '#F39C12']}
                  style={styles.settingsIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.settingsIconText}>❓</Text>
                </LinearGradient>
              </View>
              <View style={styles.settingsTextContainer}>
                <Text style={[styles.settingsLabel, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>{t.profile.helpSupport}</Text>
                <Text style={[styles.settingsSubtitle, { color: isDark ? '#A0AEC0' : '#718096' }]}>Get help and support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#A0AEC0' : '#718096'} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    borderRadius: 20,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  settingsButton: {
    borderRadius: 20,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  navButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 20,
    borderRadius: 70,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 132,
    height: 132,
    borderRadius: 66,
  },
  avatarPlaceholder: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 48,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 16,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  editNameButton: {
    borderRadius: 20,
  },
  editNameGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.3)',
  },
  editNameText: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: '600',
    marginLeft: 6,
  },
  nameEditContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  nameInputWrapper: {
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    paddingHorizontal: 20,
    paddingVertical: 12,
    textAlign: 'center',
    minWidth: 200,
  },
  nameEditButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  nameButton: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nameButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#4A5568',
    fontWeight: '600',
    fontSize: 16,
  },
  profileSubtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  profileJoined: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIconText: {
    fontSize: 18,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingsCard: {
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.1)',
  },
  settingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  settingsIcon: {
    marginRight: 16,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconText: {
    fontSize: 22,
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
});