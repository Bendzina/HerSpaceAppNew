import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
export const href = null;

// Light theme colors
const lightColors = {
  background: '#ffffff',
  surface: '#f8f6f3',
  card: '#ffffff',
  primary: '#6b6387',
  secondary: '#e0d7f7',
  text: '#111116',
  textSecondary: '#6b6387',
  border: '#dddbe5',
  shadow: '#000000',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

// Dark theme colors
const darkColors = {
  background: '#121212',
  surface: '#1e1e1e',
  card: '#2a2a2a',
  primary: '#bb86fc',
  secondary: '#3700b3',
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  border: '#3a3a3a',
  shadow: '#000000',
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
};

interface ThemeContextType {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  colors: typeof lightColors;
}


const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  setIsDark: () => {},
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDarkState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('user_theme');
      if (savedTheme !== null) {
        setIsDarkState(savedTheme === 'dark');
      }
    } catch (error) {
      // Error loading theme
    } finally {
      setIsLoading(false);
    }
  };

  const setIsDark = async (newIsDark: boolean) => {
    try {
      setIsDarkState(newIsDark);
      await AsyncStorage.setItem('user_theme', newIsDark ? 'dark' : 'light');
      // Theme changed
    } catch (error) {
      // Error saving theme
    }
  };

  if (isLoading) {
    return null;
  }

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
export default ThemeProvider;