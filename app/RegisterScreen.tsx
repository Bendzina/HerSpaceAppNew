import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "../context/AuthContext";

// Define the registration response type
interface RegistrationResponse {
  email: string;
  message?: string;
  [key: string]: any; // For any additional fields
}

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();

  const { register } = useAuth(); // ✅ hook აქ უნდა გამოიძახო

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      // Register the user (without auto-login)
      const response = await register(username, email, password);
      
      // Get the email from the response or use the one from the form
      const userEmail = response?.email || email;
      
      // Redirect to verification screen with email as a query parameter
      router.push(`/verify-email?email=${encodeURIComponent(userEmail)}` as any);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = language === "ka" 
        ? "რეგისტრაცია ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან." 
        : "Registration failed. Please try again.";
      
      try {
        // Handle different types of errors
        if (error?.response?.data) {
          // Server responded with an error status (4xx, 5xx)
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
            // Try to get the first error message if it's an object
            const firstError = Object.values(data)[0];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            }
          }
        } else if (error.message) {
          // Error from the authService
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {language === "ka" ? "რეგისტრაცია" : "Register"}
      </Text>

      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder={language === "ka" ? "მომხმარებელი" : "Username"}
        placeholderTextColor={colors.textSecondary}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder={language === "ka" ? "ელ-ფოსტა" : "Email"}
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder={language === "ka" ? "პაროლი" : "Password"}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? language === "ka" ? "ვცდილობ..." : "Loading..."
            : language === "ka" ? "რეგისტრაცია" : "Register"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("./LoginScreen")}>
        <Text style={{ color: colors.primary, marginTop: 20 }}>
          {language === "ka"
            ? "უკვე გაქვს ანგარიში? შესვლა"
            : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
