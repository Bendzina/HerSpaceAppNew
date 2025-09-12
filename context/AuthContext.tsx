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

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>; // ✅ ახალი ფუნქცია
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
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
      const data = await authService.login(username, password);
      
      // Token-ები შენახე
      await AsyncStorage.setItem("access_token", data.access);
      await AsyncStorage.setItem("refresh_token", data.refresh);
      
      // User data მიიღე და შენახე
      if (data.user) {
        await AsyncStorage.setItem("user_data", JSON.stringify(data.user));
        setUser(data.user);
      } else {
        // თუ login response-ში user data არ არის, ცალკე მოითხოვე
        const userInfo = await authService.getUserInfo(data.access);
        await AsyncStorage.setItem("user_data", JSON.stringify(userInfo));
        setUser(userInfo);
      }
      console.log('AuthContext: Login successful');
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting registration...', { username, email });
      await authService.register(username, email, password);
      console.log('AuthContext: Registration successful, attempting auto-login...');
      // რეგისტრაციის შემდეგ ავტომატურად ლოგინი
      await login(username, password);
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