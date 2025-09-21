import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get('window');

// Define the registration response type
interface RegistrationResponse {
  email: string;
  message?: string;
  [key: string]: any;
}

export default function RegisterScreen() {
  const { colors, isDark } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert(
        language === "ka" ? "შეცდომა" : "Error",
        language === "ka" ? "გთხოვ შეავსე ყველა ველი!" : "Please fill all fields!"
      );
      return;
    }
  
    try {
      setLoading(true);
      const response = await register(username, email, password);
      
      const userEmail = response?.email || email;
      router.push(`/verify-email?email=${encodeURIComponent(userEmail)}` as any);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = language === "ka" 
        ? "რეგისტრაცია ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან." 
        : "Registration failed. Please try again.";
      
      try {
        if (error?.response?.data) {
          const { data } = error.response;
          
          if (data.email) {
            errorMessage = `Email: ${Array.isArray(data.email) ? data.email[0] : data.email}`;
          } else if (data.username) {
            errorMessage = `Username: ${Array.isArray(data.username) ? data.username[0] : data.username}`;
          } else if (data.password) {
            errorMessage = `Password: ${Array.isArray(data.password) ? data.password[0] : data.password}`;
          } else if (data.detail) {
            errorMessage = data.detail;
          } else if (typeof data === 'string') {
            errorMessage = data;
          } else if (typeof data === 'object') {
            const firstError = Object.values(data)[0];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            }
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      
      Alert.alert(
        language === "ka" ? "შეცდომა" : "Error",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F0F23' : '#F8F9FA' }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header with gradient background */}
          <LinearGradient
            colors={isDark ? ['#1A1A2E', '#16213E', '#0F0F23'] : ['#E8F4FD', '#F0E8FF', '#FFE5F1']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B9D', '#C44569']}
                style={styles.backButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="arrow-back" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Logo Section */}
            <View style={styles.logoSection}>
              <LinearGradient
                colors={['#667EEA', '#764BA2', '#F8B500']}
                style={styles.logoContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.logoEmoji}>✨</Text>
              </LinearGradient>
              
              <Text style={styles.appTitle}>
                {language === "ka" ? "შექმენი ანგარიში" : "Create Account"}
              </Text>
              <Text style={styles.appSubtitle}>
                {language === "ka" ? "დაიწყე შენი მოგზაურობა 🌸" : "Start Your Journey 🌸"}
              </Text>
            </View>
          </LinearGradient>

          {/* Register Form */}
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
                {language === "ka" ? "შექმენი ანგარიში" : "Create Account"}
              </Text>
              <Text style={[styles.formSubtitle, { color: isDark ? '#A0AEC0' : '#718096' }]}>
                {language === "ka" ? "შეავსე შენი ინფორმაცია" : "Fill in your information"}
              </Text>
            </View>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>
                {language === "ka" ? "მომხმარებელი" : "Username"}
              </Text>
              <View style={[
                styles.inputWrapper,
                { 
                  backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
                  borderColor: focusedInput === 'username' ? '#667EEA' : (isDark ? '#2D3748' : '#E2E8F0')
                }
              ]}>
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={focusedInput === 'username' ? '#667EEA' : (isDark ? '#A0AEC0' : '#718096')} 
                />
                <TextInput
                  style={[styles.input, { color: isDark ? '#FFFFFF' : '#2D3748' }]}
                  placeholder={language === "ka" ? "შეიყვანე მომხმარებლის სახელი" : "Enter username"}
                  placeholderTextColor={isDark ? '#718096' : '#A0AEC0'}
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>
                {language === "ka" ? "ელ-ფოსტა" : "Email"}
              </Text>
              <View style={[
                styles.inputWrapper,
                { 
                  backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
                  borderColor: focusedInput === 'email' ? '#FF6B9D' : (isDark ? '#2D3748' : '#E2E8F0')
                }
              ]}>
                <Ionicons 
                  name="mail" 
                  size={20} 
                  color={focusedInput === 'email' ? '#FF6B9D' : (isDark ? '#A0AEC0' : '#718096')} 
                />
                <TextInput
                  style={[styles.input, { color: isDark ? '#FFFFFF' : '#2D3748' }]}
                  placeholder={language === "ka" ? "შეიყვანე შენი ელ-ფოსტა" : "Enter your email"}
                  placeholderTextColor={isDark ? '#718096' : '#A0AEC0'}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>
                {language === "ka" ? "პაროლი" : "Password"}
              </Text>
              <View style={[
                styles.inputWrapper,
                { 
                  backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
                  borderColor: focusedInput === 'password' ? '#48BB78' : (isDark ? '#2D3748' : '#E2E8F0')
                }
              ]}>
                <Ionicons 
                  name="lock-closed" 
                  size={20} 
                  color={focusedInput === 'password' ? '#48BB78' : (isDark ? '#A0AEC0' : '#718096')} 
                />
                <TextInput
                  style={[styles.input, { color: isDark ? '#FFFFFF' : '#2D3748' }]}
                  placeholder={language === "ka" ? "შეიყვანე უსაფრთხო პაროლი" : "Enter secure password"}
                  placeholderTextColor={isDark ? '#718096' : '#A0AEC0'}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={isDark ? '#A0AEC0' : '#718096'} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.buttonText}>
                      {language === "ka" ? "ვცდილობ..." : "Loading..."}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>
                    {language === "ka" ? "რეგისტრაცია" : "Create Account"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: isDark ? '#A0AEC0' : '#718096' }]}>
                {language === "ka" ? "უკვე გაქვს ანგარიში?" : "Already have an account?"}
              </Text>
              <TouchableOpacity 
                onPress={() => router.push("./LoginScreen")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FF6B9D', '#C44569']}
                  style={styles.loginLinkGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.loginLinkText}>
                    {language === "ka" ? "შესვლა" : "Sign In"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
    borderRadius: 20,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  formHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  passwordToggle: {
    padding: 8,
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 20,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  loginText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loginLinkGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  loginLinkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});