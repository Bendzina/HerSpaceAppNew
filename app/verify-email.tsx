// app/verify-email.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, useRouter } from 'expo-router';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import * as authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'verified' | 'unverified'>('checking');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const { colors } = useTheme();
  const { language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  // Check verification status on mount and periodically
  useEffect(() => {
    let isMounted = true;
    
    const checkVerification = async () => {
      if (!email) {
        if (isMounted) {
          setVerificationLoading(false);
          setVerificationStatus('unverified');
        }
        return;
      }

      try {
        
        const response = await authService.checkEmailVerification(email);
        if (isMounted) {
          if (response.is_verified) {
            setVerificationStatus('verified');
            // Redirect to home after a short delay
            setTimeout(() => router.replace('/(tabs)'), 2000);
          } else {
            setVerificationStatus('unverified');
          }
        }
      } catch (error) {
        if (isMounted) {
          setVerificationStatus('unverified');
        }
      } finally {
        if (isMounted) {
          setVerificationLoading(false);
        }
      }
    };

    checkVerification();
    const interval = setInterval(checkVerification, 10000); // Check every 10 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [email, router]);

  // Handle countdown for resend button
  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleResendEmail = async () => {
    if (!canResend || !email || typeof email !== 'string') return;
    
    try {
      setResendLoading(true);
      await authService.resendVerificationEmail(email);
      setCanResend(false);
      setCountdown(30);
      
      Alert.alert(
        language === "ka" ? "გაგზავნილია" : "Sent",
        language === "ka" 
          ? `ვერიფიკაციის მეილი გაგზავნილია ${email}-ზე` 
          : `Verification email has been sent to ${email}`
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                         (language === "ka" 
                          ? "ვერ გაიგზავნა მეილი. სცადეთ თავიდან." 
                          : "Failed to resend email. Please try again.");
      
      Alert.alert(
        language === "ka" ? "შეცდომა" : "Error",
        errorMessage
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (verificationLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.message, { color: colors.text, marginTop: 20 }]}>
          {language === "ka" ? "მიმდინარეობს შემოწმება..." : "Checking verification status..."}
        </Text>
      </View>
    );
  }

  if (verificationStatus === 'verified') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" style={styles.icon} />
        <Text style={[styles.title, { color: colors.text }]}>
          {language === "ka" ? "ელ-ფოსტა დადასტურებულია!" : "Email Verified!"}
        </Text>
        <Text style={[styles.message, { color: colors.text }]}>
          {language === "ka" 
            ? "თქვენი ელ-ფოსტა წარმატებით დადასტურდა. გადამისამართება..."
            : "Your email has been successfully verified. Redirecting..."}
        </Text>
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons name="mail-outline" size={80} color={colors.primary} style={styles.icon} />
      <Text style={[styles.title, { color: colors.text }]}>
        {language === "ka" ? "დაადასტურე ელ-ფოსტა" : "Verify Your Email"}
      </Text>
      
      <Text style={[styles.message, { color: colors.text }]}>
        {language === "ka" 
          ? `ჩვენ გამოგიგზავნეთ ვერიფიკაციის ბმული ${email}-ზე. გთხოვთ, შეამოწმეთ თქვენი შემოსულები.`
          : `We've sent a verification link to ${email}. Please check your inbox.`}
      </Text>
      
      <Text style={[styles.hint, { color: colors.text }]}>
        {language === "ka"
          ? "თუ არ ხედავთ მეილს, შეამოწმეთ სპამის ან ჯანქის საქაღალდე."
          : "If you don't see the email, check your spam or junk folder."}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.button, 
          { 
            backgroundColor: canResend ? colors.primary : '#cccccc',
            opacity: canResend ? 1 : 0.7
          }
        ]}
        onPress={handleResendEmail}
        disabled={!canResend || resendLoading}
      >
        {resendLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            {language === "ka" 
              ? `ხელახლა გაგზავნა${!canResend ? ` (${countdown}s)` : ''}` 
              : `Resend Email${!canResend ? ` (${countdown}s)` : ''}`}
          </Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.secondaryButton, { borderColor: colors.primary }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
          {language === "ka" ? "უკან დაბრუნება" : "Back to Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    opacity: 0.8,
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginText: {
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  }
});