import { useFonts } from 'expo-font';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { checkEmailVerification } from '../services/authService';

import { useColorScheme } from '@/hooks/useColorScheme';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import CustomDrawerContent from '@/components/navigation/CustomDrawerContent';
import { Ionicons } from '@expo/vector-icons';
import { translations } from '@/i18n/translations';

function InnerDrawer() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkVerification = async () => {
      if (!user) return;
      
      try {
        // Get current path from the URL
        const currentPath = new URL(window.location.href).pathname;
        
        // Skip verification check for the verify-email screen and login page to prevent infinite loops
        if (currentPath.includes('verify-email') || currentPath.includes('LoginScreen')) return;
        
        if (!user?.email) return; // Skip if no user email
        
        const response = await checkEmailVerification(user.email);
        if (!response.is_verified) {
          // Only navigate if we're not already on the verify-email screen
          if (!currentPath.includes('verify-email')) {
            router.replace({
              pathname: '/verify-email',
              params: { email: user.email }
            } as any);
          }
        } else if (currentPath.includes('verify-email')) {
          // If user is already verified but on verify-email screen, redirect to home
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        // If there's an error, still allow access but log it
      }
    };

    // Check verification status immediately and then every 30 seconds
    checkVerification();
    const interval = setInterval(checkVerification, 30000);
    
    return () => clearInterval(interval);
  }, [user, router]);

  // Check if we're on the verify-email screen
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isVerifyEmail = pathname.includes('verify-email');

  if (isVerifyEmail) {
    return (
      <Drawer.Screen
        name="verify-email"
        options={{
          title: 'Verify Email',
          headerShown: false,
          drawerItemStyle: { display: 'none' }
        }}
      />
    );
  }

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600', color: colors.text },
        drawerStyle: { backgroundColor: colors.surface },
        drawerContentStyle: { backgroundColor: colors.background },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {/* Keep tabs mounted but hidden from the Drawer */}
      <Drawer.Screen
        name="(tabs)"
        options={{ title: 'Home', headerShown: false, drawerItemStyle: { display: 'none' } }}
      />
  
      {/* Menu items with icons */}
      <Drawer.Screen
        name="motherhood/index"
        options={{
          title: t.motherhood || 'Motherhood',
          drawerIcon: ({ color, size }) => (<Ionicons name="woman-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="community/index"
        options={{
          title: 'Community',
          drawerIcon: ({ color, size }) => (<Ionicons name="people-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="rituals"
        options={{
          title: t.rituals || 'Rituals',
          drawerIcon: ({ color, size }) => (<Ionicons name="leaf-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: t.profile || 'Profile',
          drawerIcon: ({ color, size }) => (<Ionicons name="person-circle-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="HelpScreen"
        options={{
          title: t.help || 'Help',
          drawerIcon: ({ color, size }) => (<Ionicons name="help-circle-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="AppPreferencesScreen"
        options={{
          title: t.preferences || 'Preferences',
          drawerIcon: ({ color, size }) => (<Ionicons name="options-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="mindful"
        options={{
          title: t.mindful || 'Mindful',
          drawerIcon: ({ color, size }) => (<Ionicons name="medkit-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="SettingsScreen"
        options={{
          title: t.settings || 'Settings',
          drawerIcon: ({ color, size }) => (<Ionicons name="settings-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="insights"
        options={{
          title: t.insights || 'Insights',
          drawerIcon: ({ color, size }) => (<Ionicons name="bar-chart-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="LoginScreen"
        options={{
          title: t.login || 'Login',
          drawerIcon: ({ color, size }) => (<Ionicons name="log-in-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="NotificationsScreen"
        options={{
          title: t.notifications || 'Notifications',
          drawerIcon: ({ color, size }) => (<Ionicons name="notifications-outline" size={size} color={color} />)
        }}
      />
    </Drawer>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <StatusBar style="auto" />
            <InnerDrawer />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}