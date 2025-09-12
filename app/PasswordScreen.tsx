import React, { useState } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

export default function PasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t.password.error, t.password.fillAllFields);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t.password.error, t.password.passwordsDontMatch);
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      Alert.alert(t.password.error, t.password.weakPassword);
      return;
    }

    // Here you would normally make an API call to change the password
    Alert.alert(
      t.password.success,
      t.password.passwordChanged,
      [
        { 
          text: t.password.ok, 
          onPress: () => {
            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            router.back();
          }
        }
      ]
    );
  };

  const passwordValidation = validatePassword(newPassword);
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.password.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Password */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t.password.currentPassword}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t.password.enterCurrentPassword}
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPasswords.current}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
            >
              <Text style={styles.eyeIcon}>{showPasswords.current ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t.password.newPassword}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t.password.enterNewPassword}
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPasswords.new}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
            >
              <Text style={styles.eyeIcon}>{showPasswords.new ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Password Requirements */}
        {newPassword.length > 0 && (
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>{t.password.requirements}</Text>
            <View style={styles.requirement}>
              <Text style={[styles.requirementIcon, passwordValidation.minLength && styles.validRequirement]}>
                {passwordValidation.minLength ? '✓' : '✗'}
              </Text>
              <Text style={[styles.requirementText, passwordValidation.minLength && styles.validRequirement]}>
                {t.password.minLength}
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={[styles.requirementIcon, passwordValidation.hasUpperCase && styles.validRequirement]}>
                {passwordValidation.hasUpperCase ? '✓' : '✗'}
              </Text>
              <Text style={[styles.requirementText, passwordValidation.hasUpperCase && styles.validRequirement]}>
                {t.password.hasUpperCase}
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={[styles.requirementIcon, passwordValidation.hasLowerCase && styles.validRequirement]}>
                {passwordValidation.hasLowerCase ? '✓' : '✗'}
              </Text>
              <Text style={[styles.requirementText, passwordValidation.hasLowerCase && styles.validRequirement]}>
                {t.password.hasLowerCase}
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={[styles.requirementIcon, passwordValidation.hasNumbers && styles.validRequirement]}>
                {passwordValidation.hasNumbers ? '✓' : '✗'}
              </Text>
              <Text style={[styles.requirementText, passwordValidation.hasNumbers && styles.validRequirement]}>
                {t.password.hasNumbers}
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={[styles.requirementIcon, passwordValidation.hasSpecialChar && styles.validRequirement]}>
                {passwordValidation.hasSpecialChar ? '✓' : '✗'}
              </Text>
              <Text style={[styles.requirementText, passwordValidation.hasSpecialChar && styles.validRequirement]}>
                {t.password.hasSpecialChar}
              </Text>
            </View>
          </View>
        )}

        {/* Confirm Password */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t.password.confirmPassword}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t.password.confirmNewPassword}
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPasswords.confirm}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
            >
              <Text style={styles.eyeIcon}>{showPasswords.confirm ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <Text style={styles.errorText}>{t.password.passwordsDontMatch}</Text>
          )}
        </View>

        {/* Security Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>{t.password.securityTips}</Text>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>🔒</Text>
            <Text style={styles.tipText}>{t.password.tip1}</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>🔄</Text>
            <Text style={styles.tipText}>{t.password.tip2}</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>📱</Text>
            <Text style={styles.tipText}>{t.password.tip3}</Text>
          </View>
        </View>

        {/* Change Password Button */}
        <TouchableOpacity 
          style={[
            styles.changeButton,
            (!passwordValidation.isValid || newPassword !== confirmPassword || !currentPassword) && styles.disabledButton
          ]}
          onPress={handleChangePassword}
          disabled={!passwordValidation.isValid || newPassword !== confirmPassword || !currentPassword}
        >
          <Text style={[
            styles.changeButtonText,
            (!passwordValidation.isValid || newPassword !== confirmPassword || !currentPassword) && styles.disabledButtonText
          ]}>
            {t.password.changePassword}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  eyeButton: {
    padding: 16,
  },
  eyeIcon: {
    fontSize: 20,
  },
  requirementsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementIcon: {
    fontSize: 16,
    marginRight: 8,
    color: colors.error,
  },
  requirementText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  validRequirement: {
    color: colors.success,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 8,
  },
  tipsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  changeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
});