import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';

const { width, height } = Dimensions.get('window');

const translations = {
  en: {
    welcomeTitle: 'Welcome to Her Space ✨',
    welcomeDescription: 'A sanctuary for women\'s emotional well-being. Begin your journey inward.',
    getStarted: 'Get Started',
    settings: 'Settings',
    welcomeBack: 'Welcome back',
    myProfile: 'My Profile',
    logout: 'Logout',
  },
  ka: {
    welcomeTitle: 'მოგესალმებით Her Space-ში ✨',
    welcomeDescription: 'ქალების ემოციური კეთილდღეობის თავშესაფარი. დაიწყე შენი შინაგანი მოგზაურობა.',
    getStarted: 'დაიწყე',
    settings: 'პარამეტრები',
    welcomeBack: 'კეთილი იყოს შენი დაბრუნება',
    myProfile: 'ჩემი პროფილი',
    logout: 'გასვლა',
  },
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const t = translations[language] || translations.en;
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f8f6f3' }]}>      
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: insets.bottom + 76, // keep clear of tab bar (60) + spacing
        }}
        showsVerticalScrollIndicator={false}
      >
      {/* ✅ Conditional Auth Buttons */}
      {!isAuthenticated ? (
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <TouchableOpacity 
            style={[styles.authButton, { backgroundColor: '#fff', borderColor: '#8b5fbf' }]}
            onPress={() => router.push('/LoginScreen')}
          >
            <Text style={{ color: '#8b5fbf', fontWeight: '600' }}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.authButton, { backgroundColor: '#8b5fbf' }]}
            onPress={() => router.push('/RegisterScreen')}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // ✅ დალოგინებული user-ისთვის
        <View style={styles.userSection}>
          <Text style={[styles.welcomeBackText, { color: isDark ? '#fff' : '#8b5fbf' }]}>
            {t.welcomeBack}, {user?.username || 'User'}! 🌸
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 15 }}>
            <TouchableOpacity 
              style={[styles.authButton, { backgroundColor: '#8b5fbf' }]}
              onPress={() => router.push('/(tabs)/ProfileScreen')}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>{t.myProfile}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.authButton, { backgroundColor: '#fff', borderColor: '#dc3545' }]}
              onPress={handleLogout}
            >
              <Text style={{ color: '#dc3545', fontWeight: '600' }}>{t.logout}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Lottie Animation */}
      <LottieView
        source={require('../../assets/animations/welcome.json')}
        autoPlay
        loop
        style={styles.animation}
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#2c2c2c' }]}>
          {t.welcomeTitle}
        </Text>
        <Text style={[styles.description, { color: isDark ? '#ddd' : '#444' }]}>
          {t.welcomeDescription}
        </Text>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => {
            if (user) {
              router.push('/FocusScreen');
            } else {
              router.push('/LoginScreen');
            }
          }}
        >
          <Text style={styles.getStartedText}>{t.getStarted}</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  
  // headerRight now shows settings button; no in-screen settings button needed

  // ✅ ახალი style დალოგინებული user-ისთვის
  userSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  welcomeBackText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  animation: {
    width: width * 0.85,
    height: height * 0.42,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  getStartedButton: {
    backgroundColor: '#8b5fbf',
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderRadius: 30,
    shadowColor: '#8b5fbf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  authButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    marginHorizontal: 8,
    alignItems: "center",
  },
});