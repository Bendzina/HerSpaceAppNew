import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "../services/authService";
import { onAuthFailure } from "../services/authService";

interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string; // ✅ დამატებული displayName field
}

interface RegistrationResponse {
  email: string;
  message?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<RegistrationResponse>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>; // ✅ ახალი ფუნქცია
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => ({
    email: '',
    message: 'Auth context not initialized'
  }),
  logout: async () => {},
  updateUserProfile: async () => {}, // ✅ default value
  loading: false,
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const userData = await AsyncStorage.getItem("user_data");
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      console.log('AuthContext: Attempting login...', { username });
      setLoading(true);
      
      // Try to login with the provided credentials
      const data = await authService.login(username, password);
      
      // Store tokens
      await AsyncStorage.setItem("access_token", data.access);
      await AsyncStorage.setItem("refresh_token", data.refresh);
      
      // Handle user data
      let userData = data.user;
      
      // If user data wasn't included in the login response, fetch it separately
      if (!userData && data.access) {
        console.log('Fetching user data separately...');
        userData = await authService.getUserInfo(data.access);
      }
      
      if (userData) {
        console.log('Storing user data:', userData);
        await AsyncStorage.setItem("user_data", JSON.stringify(userData));
        setUser(userData);
        console.log('AuthContext: Login successful');
      } else {
        console.error('No user data received after login');
        throw new Error('Login successful but could not retrieve user information');
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      // Clear any partial state on error
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("refresh_token");
      await AsyncStorage.removeItem("user_data");
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting registration...', { username, email });
      const response = await authService.register(username, email, password);
      console.log('AuthContext: Registration successful');
      return response; // Return the response which includes the email
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      throw error;
    }
  };

  // ✅ ახალი updateUserProfile ფუნქცია
  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // ✅ Backend API call (შენს authService-ში ეს ფუნქცია უნდა იყოს)
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        throw new Error('No access token found');
      }

      // API call to update user profile
      const updatedUser = await authService.updateProfile(updates, token);
      
      // ✅ Local state განახლება
      const newUserData = { ...user, ...updatedUser };
      setUser(newUserData);
      
      // ✅ AsyncStorage განახლება
      await AsyncStorage.setItem("user_data", JSON.stringify(newUserData));
      
      console.log('AuthContext: Profile updated successfully');
    } catch (error) {
      console.error('AuthContext: Profile update error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Local storage cleanup მხოლოდ
      await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token",
        "user_data"
      ]);
      setUser(null);
      console.log('AuthContext: Logout successful');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    }
  };

  // Auto-logout if refresh token becomes invalid (emitted by authService)
  useEffect(() => {
    const unsubscribe = onAuthFailure(async () => {
      console.log('AuthContext: Auto-logout due to auth failure');
      await logout();
    });
    return () => { unsubscribe(); };
  }, [logout]);

  const value = {
    user,
    login,
    register,
    logout,
    updateUserProfile, // ✅ value object-ში დამატება
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};