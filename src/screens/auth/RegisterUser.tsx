import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  ScrollView,
  NativeModules,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gradient } from '../../components/ui/Gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { validateRegistrationForm } from '../../utils/validation';
import { useTheme } from '../../theme/ThemeContext';
import { getRoleName } from '../../utils/permissions';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useNotifications } from '../../components/ui/ToastManager';
import { ApiError } from '../../services/ApiClient';

import { RegisterScreenNavigationProp } from '../../navigation/types';

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterUser: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { register, isLoading: authLoading } = useAuth();
  const { showError, showSuccess, showWarning } = useNotifications();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRegister = async () => {
    // Clear previous errors
    setError(null);

    // Basic validation
    if (!email || !password) {
      showError(
        'Required Fields',
        'Please enter your email and password'
      );
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError(
        'Invalid Email',
        'Please enter a valid email address'
      );
      return;
    }

    // Password length validation
    if (password.length < 8) {
      showWarning(
        'Weak Password',
        'Password must be at least 8 characters'
      );
      return;
    }

    setIsLoading(true);
    try {
      // Use email as username
      await register({
        username: email,
        email,
        password,
      });

      // After registration, email is not verified yet – guide user to verification screen
      showSuccess(
        'Account Created!',
        'Please verify your email to start using the app.'
      );
      navigation.replace('EmailVerificationScreen', { email });
    } catch (error: any) {
      setError(error);
      console.error('Registration error:', error);

      // Show detailed error message
      let errorMessage = 'Registration failed. Please try again.';

      if (error instanceof ApiError) {
        // Handle 409 Conflict specifically
        if (error.status === 409 || error.message?.toLowerCase().includes('already exists')) {
          errorMessage = 'User with this email already exists. Please sign in instead.';
        } else if (error.fieldErrors) {
          const fieldErrorMessages = Object.values(error.fieldErrors)
            .map((msg) => `${msg}`)
            .join('\n');
          if (fieldErrorMessages) {
            errorMessage = fieldErrorMessages;
          } else if (error.message) {
            errorMessage = error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error?.message) {
        if (error.message.toLowerCase().includes('already exists')) {
          errorMessage = 'User with this email already exists. Please sign in instead.';
        } else {
          errorMessage = error.message;
        }
      }

      showError(
        'Registration Failed',
        errorMessage,
        { duration: 5000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryRegistration = () => {
    setError(null);
    handleRegister();
  };

  const { TruecallerAuthModule } = NativeModules;

  const handleTruecallerVerification = async () => {
    try {
      setIsLoading(true);
      if (TruecallerAuthModule) {
        const result = await TruecallerAuthModule.authenticate();
        console.log('Truecaller Result:', result);

        if (result.successful) {
          // Pre-fill form or auto-register logic would go here
          if (result.email) setEmail(result.email);
          if (result.firstName) {
            // If we had name fields, we would set them
          }
          showSuccess('Truecaller Verified', `Welcome ${result.firstName || 'User'}! Please complete your password.`);
        } else if (result.error) {
          showWarning('Truecaller Verification Failed', `Error: ${result.error}`);
        }
      } else {
        showError('Error', 'Truecaller SDK not available');
      }
    } catch (e: any) {
      console.error(e);
      showError('Verification Error', e.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissError = () => {
    setError(null);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradientHeader: {
      paddingBottom: 25,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    headerSafe: {
      paddingHorizontal: 20,
    },
    header: {
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 5,
    },
    iconContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      fontWeight: '500',
      paddingHorizontal: 20,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 50,
    },
    formCard: {
      marginTop: -30,
      marginHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: isDark ? colors.border : 'rgba(99, 102, 241, 0.1)',
    },
    formCardInner: {
      padding: 28,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: isDark ? colors.border : '#E5E7EB',
      marginVertical: 24,
      marginHorizontal: -8,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 16,
    },
    sectionIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: isDark ? `${colors.primary}20` : `${colors.primary}10`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.3,
    },
    inputSection: {
      marginBottom: 15,

    },
    row: {
      flexDirection: 'row',
      gap: 14,
      marginBottom: 18,
    },
    halfWidth: {
      flex: 1,
    },
    halfInput: {
      marginBottom: 0,
    },
    rolePicker: {
      marginBottom: 0,
    },
    roleLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
      letterSpacing: 0.3,
    },
    roleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 2,
      borderColor: isDark ? colors.border : '#E5E7EB',
      backgroundColor: isDark ? colors.surfaceVariant : '#FAFBFC',
      paddingHorizontal: 18,
      paddingVertical: 16,
      minHeight: 60,
    },
    roleIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: isDark
        ? `${colors.primary}25`
        : `${colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    roleText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    registerButton: {
      marginTop: 32,
      marginBottom: 24,
      borderRadius: 16,
      height: 58,
    },
    signInLink: {
      alignSelf: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    signInText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
      textAlign: 'center',
    },
    signInAccent: {
      fontWeight: '700',
      color: colors.primary,
    },
  });

  return (
    <>
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Gradient
          colors={isDark
            ? [colors.primary, '#3730A3']
            : [colors.primary, '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <SafeAreaView edges={['top']} style={styles.headerSafe}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join in seconds - it's quick and easy!</Text>
            </View>
          </SafeAreaView>
        </Gradient>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formCard}>
              <View style={styles.formCardInner}>

                {/* Quick Sign Up */}
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="rocket" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Quick Sign Up</Text>
                </View>

                {/* Truecaller Option */}
                <Button
                  title="Verify with Truecaller"
                  onPress={handleTruecallerVerification}
                  variant="outline"
                  icon="shield-checkmark"
                  style={{ marginBottom: 25 }}
                />

                <View style={styles.inputSection}>
                  <Input
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    leftIcon="mail-outline"
                    placeholder="your.email@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    required
                  />
                </View>



                {/* Role selection removed: backend always assigns USER role on registration */}

                <View style={styles.inputSection}>
                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    leftIcon="lock-closed-outline"
                    placeholder="Create a password (min 8 chars, strong)"
                    secureTextEntry
                    returnKeyType="done"
                    required
                  />
                </View>

                <Button
                  title="Create Account"
                  onPress={handleRegister}
                  loading={isLoading || authLoading}
                  disabled={isLoading || authLoading}
                  fullWidth
                  style={styles.registerButton}
                />

                <TouchableOpacity
                  style={styles.signInLink}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.signInText}>
                    Already have an account?{' '}
                    <Text style={styles.signInAccent}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Role picker modal removed: registration always creates USER accounts.
          Dealer status is granted by admins inside the system. */}
    </>);
};


export default RegisterUser;

