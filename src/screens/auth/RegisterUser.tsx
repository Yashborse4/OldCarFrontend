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


} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gradient } from '../../components/ui/Gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeContext';
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
  const [role, setRole] = useState<'USER' | 'DEALER'>('USER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRegister = async () => {
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      showError('Required Fields', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showError('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (password && password.length > 0 && password.length < 8) {
      showWarning('Weak Password', 'Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const payload: {
        username: string;
        email: string;
        role?: string;
        password?: string;
      } = {
        username: trimmedEmail,
        email: trimmedEmail,
      };

      if (role) {
        payload.role = role;
      }

      if (password && password.trim().length > 0) {
        payload.password = password;
      }

      await register(payload);

      showSuccess(
        'Account Created!',
        'We have sent a verification code to your email. Please verify to continue.'
      );
      navigation.replace('EmailVerificationScreen', { email: trimmedEmail });
    } catch (error: any) {
      setError(error);
      console.error('Registration error:', error);

      let errorMessage = 'Registration failed. Please try again.';

      if (error instanceof ApiError) {
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

      showError('Registration Failed', errorMessage, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryRegistration = () => {
    setError(null);
    handleRegister();
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
    helperText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      marginLeft: 4,
      marginBottom: 2,
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
              <Text style={styles.subtitle}>Sign up with your email and a quick verification code.</Text>
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
                  <Text style={styles.helperText}>
                    We will send a 6-digit verification code to this email.
                  </Text>
                </View>

                <View style={[styles.inputSection, styles.rolePicker]}>
                  <Text style={styles.roleLabel}>Select Role</Text>
                  <View style={styles.row}>
                    <View style={styles.halfWidth}>
                      <TouchableOpacity
                        style={[
                          styles.roleButton,
                          {
                            borderColor:
                              role === 'USER'
                                ? colors.primary
                                : isDark
                                ? colors.border
                                : '#E5E7EB',
                          },
                        ]}
                        onPress={() => setRole('USER')}
                        activeOpacity={0.8}
                      >
                        <View style={styles.roleIconContainer}>
                          <Ionicons name="person-outline" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.roleText}>User</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.halfWidth}>
                      <TouchableOpacity
                        style={[
                          styles.roleButton,
                          {
                            borderColor:
                              role === 'DEALER'
                                ? colors.primary
                                : isDark
                                ? colors.border
                                : '#E5E7EB',
                          },
                        ]}
                        onPress={() => setRole('DEALER')}
                        activeOpacity={0.8}
                      >
                        <View style={styles.roleIconContainer}>
                          <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.roleText}>Dealer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={styles.inputSection}>
                  <Input
                    label="Password (optional)"
                    value={password}
                    onChangeText={setPassword}
                    leftIcon="lock-closed-outline"
                    placeholder="Set a password for faster login (optional)"
                    secureTextEntry
                    returnKeyType="done"
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


