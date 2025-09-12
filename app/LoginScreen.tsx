import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "../context/AuthContext";  // ✅ აქედან

export default function LoginScreen() {
  const { colors } = useTheme();
  const { language } = useLanguage();
  const { login } = useAuth();  // ✅ Context-ის login
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(language === "ka" ? "შეცდომა" : "Error",
                  language === "ka" ? "შეავსე ყველა ველი!" : "Please fill in all fields!");
      return;
    }

    try {
      setLoading(true);
      await login(email, password); // ✅ Context-ის ფუნქცია

      Alert.alert(language === "ka" ? "მოგესალმები 🌸" : "Welcome 🌸",
                  language === "ka" ? "წარმატებით შეხვედი!" : "You logged in successfully!");
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(language === "ka" ? "შეცდომა" : "Error",
                  language === "ka" ? "არასწორი მონაცემები" : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Her Space</Text>

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
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? (language === "ka" ? "ვცდილობ..." : "Loading...") 
                   : (language === "ka" ? "შესვლა" : "Login")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("./RegisterScreen")}>
        <Text style={{ color: colors.primary, marginTop: 20 }}>
          {language === "ka" ? "არ გაქვს ანგარიში? რეგისტრაცია" : "No account? Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 40 },
  input: { borderWidth: 1, borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16 },
  button: { padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
