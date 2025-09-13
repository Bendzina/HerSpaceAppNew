import { useFonts } from 'expo-font';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';

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

      {/* Requested menu items only, with icons */}
      <Drawer.Screen
        name="motherhood/index"
        options={{
          title: t.motherhood,
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
          title: t.rituals,
          drawerIcon: ({ color, size }) => (<Ionicons name="leaf-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: t.profile,
          drawerIcon: ({ color, size }) => (<Ionicons name="person-circle-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="HelpScreen"
        options={{
          title: t.help,
          drawerIcon: ({ color, size }) => (<Ionicons name="help-circle-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="AppPreferencesScreen"
        options={{
          title: t.preferences,
          drawerIcon: ({ color, size }) => (<Ionicons name="options-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="mindful"
        options={{
          title: t.mindful,
          drawerIcon: ({ color, size }) => (<Ionicons name="medkit-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="SettingsScreen"
        options={{
          title: t.settings,
          drawerIcon: ({ color, size }) => (<Ionicons name="settings-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="insights"
        options={{
          title: t.insights,
          drawerIcon: ({ color, size }) => (<Ionicons name="bar-chart-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="LoginScreen"
        options={{
          title: t.login,
          drawerIcon: ({ color, size }) => (<Ionicons name="log-in-outline" size={size} color={color} />)
        }}
      />
      <Drawer.Screen
        name="NotificationsScreen"
        options={{
          title: t.notifications,
          drawerIcon: ({ color, size }) => (<Ionicons name="notifications-outline" size={size} color={color} />)
        }}
      />

      {/* 
        ✅ Hidden routes completely removed from Drawer.Screen declarations
        These routes will still work via direct navigation (router.push('/MoodScreen'))
        but won't appear in the drawer menu at all
        
        Removed routes:
        - ThemeContext
        - LanguageContext  
        - MoodScreen
        - mood
        - FocusScreen
        - RegisterScreen
        - PasswordScreen
        - +not-found
      */}
    </Drawer>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>   
          <SafeAreaProvider>
            <InnerDrawer />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </SafeAreaProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}