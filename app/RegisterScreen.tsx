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
import { useAuth } from "../context/AuthContext";  // ✅ აქედან გამოვიყენებთ register-ს

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
      await register(username, email, password); // ✅ უკვე Context-ის register-ს იყენებს

      Alert.alert(
        language === "ka" ? "წარმატება" : "Success",
        language === "ka" ? "ანგარიში წარმატებით შეიქმნა 🎉" : "Account created successfully 🎉"
      );

      router.replace("./LoginScreen");
    } catch (error) {
      Alert.alert(
        language === "ka" ? "შეცდომა" : "Error",
        language === "ka" ? "რეგისტრაცია ვერ მოხერხდა" : "Registration failed"
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
