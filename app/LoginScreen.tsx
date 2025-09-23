import { resendVerificationEmail } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "./LanguageContext";
import { useTheme } from "./ThemeContext";

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const { language } = useLanguage();
  const { login } = useAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(
        language === "ka" ? "შეცდომა" : "Error",
        language === "ka" ? "გთხოვთ შეავსოთ ყველა ველი" : "Please fill in all fields"
      );
      return;
    }
  
    try {
      setLoading(true);
      await login(username, password);
      
      // If login is successful, show success message and redirect
      Alert.alert(
        language === "ka" ? "მოგესალმები 🌸" : "Welcome 🌸",
        language === "ka" ? "წარმატებით შეხვედი!" : "You logged in successfully!",
        [{ text: language === "ka" ? "კარგი" : "OK", onPress: () => router.replace("/(tabs)") }]
      );
    } catch (error: any) {
      let errorMessage = error.message || (language === "ka" ? "შეცდომა შესვლისას" : "Error during login");
      
      // Handle specific error cases
      if (error.message.includes('verify your email')) {
        Alert.alert(
          language === "ka" ? "ელ-ფოსტის დადასტურება საჭიროა" : "Email Verification Required",
          error.message,
          [
            {
              text: language === "ka" ? "დარეგისტრირება" : "Register",
              onPress: () => router.replace("/RegisterScreen"),
              style: 'cancel'
            },
            {
              text: language === "ka" ? "ელ-ფოსტის ხელახლა გაგზავნა" : "Resend Email",
              onPress: () => resendVerificationEmail(username)
            }
          ]
        );
      } else {
        Alert.alert(
          language === "ka" ? "შეცდომა" : "Error",
          errorMessage
        );
      }
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
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <LinearGradient
                colors={['#FF6B9D', '#C44569', '#F8B500']}
                style={styles.logoContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.logoEmoji}>🌸</Text>
              </LinearGradient>
              
              <Text style={styles.appTitle}>Her Space</Text>
              <Text style={styles.appSubtitle}>
                {language === "ka" ? "შენი პირადი სივრცე ✨" : "Your Personal Space ✨"}
              </Text>
            </View>
          </LinearGradient>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: isDark ? '#FFFFFF' : '#2D3748' }]}>
                {language === "ka" ? "კეთილი იყოს შენი დაბრუნება" : "Welcome Back"}
              </Text>
              <Text style={[styles.formSubtitle, { color: isDark ? '#A0AEC0' : '#718096' }]}>
                {language === "ka" ? "შედი შენს ანგარიშში" : "Sign in to your account"}
              </Text>
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
                  borderColor: focusedInput === 'username' ? '#FF6B9D' : (isDark ? '#2D3748' : '#E2E8F0')
                }
              ]}>
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={focusedInput === 'username' ? '#FF6B9D' : (isDark ? '#A0AEC0' : '#718096')} 
                />
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'username' && styles.focusedInput,
                    { color: colors.text, borderColor: colors.border }
                  ]}
                  placeholder={language === 'ka' ? 'მომხმარებლის სახელი' : 'Username'}
                  placeholderTextColor={colors.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
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
                  borderColor: focusedInput === 'password' ? '#FF6B9D' : (isDark ? '#2D3748' : '#E2E8F0')
                }
              ]}>
                <Ionicons 
                  name="lock-closed" 
                  size={20} 
                  color={focusedInput === 'password' ? '#FF6B9D' : (isDark ? '#A0AEC0' : '#718096')} 
                />
                <TextInput
                  style={[styles.input, { color: isDark ? '#FFFFFF' : '#2D3748' }]}
                  placeholder={language === "ka" ? "შეიყვანე შენი პაროლი" : "Enter your password"}
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

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B9D', '#C44569']}
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
                    {language === "ka" ? "შესვლა" : "Sign In"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { color: isDark ? '#A0AEC0' : '#718096' }]}>
                {language === "ka" ? "არ გაქვს ანგარიში?" : "Don't have an account?"}
              </Text>
              <TouchableOpacity 
                onPress={() => router.push("./RegisterScreen")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  style={styles.registerLinkGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.registerLinkText}>
                    {language === "ka" ? "რეგისტრაცია" : "Sign Up"}
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
    shadowColor: '#FF6B9D',
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
  focusedInput: {
    borderColor: '#FF6B9D',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
    marginLeft: 10,
    paddingHorizontal: 12,
  },
  passwordToggle: {
    padding: 8,
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 20,
    shadowColor: '#FF6B9D',
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
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  registerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  registerLinkGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  registerLinkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});