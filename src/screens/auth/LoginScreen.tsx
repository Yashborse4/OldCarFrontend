import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../components/ui/ToastManager';
import { Button } from '../../components/ui/Button';
import { ModernInput as Input } from '../../components/ui/InputModern';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { setSkipLogin } from '../../services/auth';
import { apiClient } from '../../services/ApiClient';

import { useTheme } from '../../theme';
import {
  scaleSize,
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveBorderRadius,
  hp,
  wp
} from '../../utils/responsiveEnhanced';

interface Props {
  navigation: any;
}

type LoginMode = 'OTP' | 'PASSWORD';

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { login, refreshUserData } = useAuth();
  const { notifyLoginSuccess, notifyLoginError, notifySuccess, notifyError } = useNotifications();

  // State management
  const [loginMode, setLoginMode] = useState<LoginMode>('OTP');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    otp: '',
  });

  // Email validation
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear previous errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleSendOtp = useCallback(async () => {
    setErrors(prev => ({ ...prev, email: '' }));

    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    } else if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    try {
      setIsLoading(true);
      if (apiClient && apiClient.sendOtp) {
        await apiClient.sendOtp(formData.email.trim(), 'LOGIN');
        setIsOtpSent(true);
        if (notifySuccess) notifySuccess('OTP sent successfully');
        setOtpTimer(60);
      } else {
        throw new Error('API Client not initialized');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      // Provide user-friendly error messages
      let errorMessage = 'Failed to send OTP';
      if (error.status === 404 || error.message?.includes('not found')) {
        errorMessage = 'Account not found. Please register first.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      if (notifyError) notifyError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData.email, validateEmail, notifySuccess, notifyError]);

  const handleVerifyOtpAndLogin = useCallback(async () => {
    setErrors(prev => ({ ...prev, otp: '' }));

    if (!formData.otp.trim()) {
      setErrors(prev => ({ ...prev, otp: 'OTP is required' }));
      return;
    }

    try {
      setIsLoading(true);
      const authTokens = await apiClient.verifyOtp(formData.email.trim(), formData.otp.trim(), 'LOGIN');

      // Save the authentication tokens and update context
      if (authTokens && authTokens.accessToken) {
        // The ApiClient automatically saves the auth data, so we just need to refresh the user context
        if (refreshUserData) {
          await refreshUserData();
        }

        if (notifyLoginSuccess) notifyLoginSuccess('Welcome back! 🎉');

        if (navigation && navigation.replace) {
          navigation.replace('Dashboard');
        } else {
          console.warn('Navigation not available');
        }
      } else {
        throw new Error('Invalid authentication response');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      const errorMessage = error.message || 'Invalid OTP';
      if (notifyLoginError) notifyLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData.email, formData.otp, refreshUserData, navigation, notifyLoginSuccess, notifyLoginError]);

  const handlePasswordLogin = useCallback(async () => {
    // Clear previous errors
    setErrors({ email: '', password: '', otp: '' });

    // Validation
    let hasErrors = false;
    const newErrors = { email: '', password: '', otp: '' };

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      hasErrors = true;
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      hasErrors = true;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      if (login) {
        await login({
          usernameOrEmail: formData.email.trim(),
          password: formData.password.trim()
        });

        await setSkipLogin(false);
        if (notifyLoginSuccess) notifyLoginSuccess('Welcome back! 🎉');

        if (navigation && navigation.replace) {
          navigation.replace('Dashboard');
        }
      } else {
        throw new Error('Login function not available');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      const errorMessage = error.message || 'Login failed';
      const errorDetails = error.details || '';

      // Check if error is related to unverified email
      if (errorMessage.toLowerCase().includes('verified') || errorDetails.toLowerCase().includes('verified')) {
        if (notifyLoginError) notifyLoginError('Email not verified. Sending verification code...');

        try {
          await apiClient.sendOtp(formData.email.trim(), 'EMAIL_VERIFICATION');
          if (navigation && navigation.navigate) {
            navigation.navigate('EmailVerificationScreen', { email: formData.email.trim() });
          }
          return;
        } catch (otpError: any) {
          console.error('Failed to send OTP:', otpError);
          if (navigation && navigation.navigate) {
            navigation.navigate('EmailVerificationScreen', { email: formData.email.trim() });
          }
          return;
        }
      }

      if (notifyLoginError) notifyLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateEmail, login, notifyLoginSuccess, notifyLoginError, navigation]);

  const handleSkipLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      await setSkipLogin(true);
      if (navigation && navigation.replace) {
        navigation.replace('Dashboard');
      }
    } catch (error) {
      console.error('Skip login error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [navigation]);

  // Memoize functionality based on mode
  const isFormValid = useMemo(() => {
    if (loginMode === 'OTP') {
      if (!isOtpSent) return validateEmail(formData.email);
      return validateEmail(formData.email) && formData.otp.length > 0;
    }
    return formData.email.length > 0 && formData.password.length > 0 &&
      !errors.email && !errors.password;
  }, [loginMode, formData, errors, isOtpSent, validateEmail]);

  // Memoize styles to prevent recreation on every render
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradientBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: getResponsiveSpacing('lg'),
      paddingBottom: hp(15), // Enough space for footer
      paddingTop: getResponsiveSpacing('xl'),
    },
    content: {
      width: '100%',
      maxWidth: scaleSize(440),
      alignSelf: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: getResponsiveSpacing('xxl'),
    },
    logoContainer: {
      width: scaleSize(90),
      height: scaleSize(90),
      borderRadius: getResponsiveBorderRadius('xl'),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: getResponsiveSpacing('lg'),

    },
    logo: {
      width: scaleSize(90),
      height: scaleSize(90),
      borderRadius: getResponsiveBorderRadius('xl'),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    title: {
      fontSize: getResponsiveTypography('hero'),
      fontWeight: '900',
      color: colors.text,
      textAlign: 'center',
      marginBottom: getResponsiveSpacing('xs'),
      letterSpacing: -0.8,
    },
    subtitle: {
      fontSize: getResponsiveTypography('md'),
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
      letterSpacing: 0.3,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      borderRadius: getResponsiveBorderRadius('lg'),
      padding: scaleSize(4),
      marginBottom: getResponsiveSpacing('lg'),
    },
    tab: {
      flex: 1,
      paddingVertical: scaleSize(10),
      alignItems: 'center',
      borderRadius: getResponsiveBorderRadius('md'),
    },
    activeTab: {
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: {
      fontSize: getResponsiveTypography('sm'),
      fontWeight: '600',
      color: colors.textSecondary,
    },
    activeTabText: {
      color: colors.text,
      fontWeight: '700',
    },
    form: {
      marginTop: getResponsiveSpacing('sm'),
      backgroundColor: colors.surface,
      borderRadius: getResponsiveBorderRadius('xxl'),
      padding: getResponsiveSpacing('xl'),
      borderWidth: 1,
      borderColor: isDark ? colors.border : 'rgba(0, 0, 0, 0.08)',

    },
    inputContainer: {
      marginBottom: getResponsiveSpacing('md'),
    },
    loginButton: {
      marginTop: getResponsiveSpacing('lg'),
      height: scaleSize(56),
      borderRadius: getResponsiveBorderRadius('lg'),
    },
    forgotPassword: {
      alignSelf: 'center',
      marginTop: getResponsiveSpacing('md'),
      paddingVertical: scaleSize(10),
      paddingHorizontal: scaleSize(16),
      borderRadius: getResponsiveBorderRadius('sm'),
    },
    forgotPasswordText: {
      fontSize: getResponsiveTypography('sm'),
      color: colors.primary,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    footer: {
      marginTop: getResponsiveSpacing('xxl'),
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : colors.surface,
      paddingVertical: getResponsiveSpacing('md'),
      paddingHorizontal: getResponsiveSpacing('lg'),
      borderRadius: getResponsiveBorderRadius('xl'),
      borderWidth: 1,
      borderColor: isDark ? colors.border : 'rgba(0, 0, 0, 0.08)',
    },
    signUpContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    signUpText: {
      fontSize: getResponsiveTypography('sm'),
      color: colors.textSecondary,
      marginRight: scaleSize(6),
      fontWeight: '500',
    },
    signUpButton: {
      paddingVertical: scaleSize(6),
    },
    signUpButtonText: {
      fontSize: getResponsiveTypography('sm'),
      color: colors.primary,
      fontWeight: '700',
    },
    skipButton: {
      marginTop: getResponsiveSpacing('sm'),
      paddingVertical: scaleSize(8),
      paddingHorizontal: scaleSize(16),
      borderRadius: getResponsiveBorderRadius('full'),
      backgroundColor: 'transparent',
    },
    skipButtonText: {
      fontSize: getResponsiveTypography('sm'),
      color: colors.textSecondary,
      fontWeight: '600',
    },
    resentContainer: {
      alignItems: 'flex-end',
      marginTop: -getResponsiveSpacing('sm'),
      marginBottom: getResponsiveSpacing('md'),
    },
    resendText: {
      fontSize: getResponsiveTypography('xs'),
      color: colors.primary,
      fontWeight: '600',
    },
  }), [colors, isDark]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.gradientBackground} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Ionicons
                    name="car"
                    size={scaleSize(48)}
                    color="#FFFFFF"
                  />
                </View>
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue to your garage</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, loginMode === 'OTP' && styles.activeTab]}
                  onPress={() => setLoginMode('OTP')}
                >
                  <Text style={[styles.tabText, loginMode === 'OTP' && styles.activeTabText]}>OTP Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, loginMode === 'PASSWORD' && styles.activeTab]}
                  onPress={() => setLoginMode('PASSWORD')}
                >
                  <Text style={[styles.tabText, loginMode === 'PASSWORD' && styles.activeTabText]}>Password Login</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="Email Address"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="john@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email}
                  leftIcon="mail-outline"
                  variant="filled"
                  accessibilityLabel="Email address input"
                  accessibilityHint="Enter your email address"
                  editable={!isOtpSent || loginMode === 'PASSWORD'}
                />
              </View>

              {loginMode === 'PASSWORD' && (
                <View style={styles.inputContainer}>
                  <Input
                    label="Password"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    placeholder="••••••••"
                    secureTextEntry
                    error={errors.password}
                    leftIcon="lock-closed-outline"
                    variant="filled"
                    accessibilityLabel="Password input"
                    accessibilityHint="Enter your password"
                    textContentType="password"
                  />
                </View>
              )}

              {loginMode === 'OTP' && isOtpSent && (
                <View style={styles.inputContainer}>
                  <Input
                    label="Verification Code"
                    value={formData.otp}
                    onChangeText={(value) => handleInputChange('otp', value)}
                    placeholder="123456"
                    keyboardType="number-pad"
                    error={errors.otp}
                    leftIcon="shield-checkmark-outline"
                    variant="filled"
                    maxLength={6}
                  />
                  <TouchableOpacity onPress={handleSendOtp} style={styles.resentContainer}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                </View>
              )}

              {loginMode === 'PASSWORD' && (
                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => navigation.navigate('ForgotPasswordScreen')}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Forgot Password"
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <Button
                title={
                  isLoading ? "Please wait..." :
                    loginMode === 'OTP'
                      ? (isOtpSent ? "Verify & Sign In" : "Send OTP")
                      : "Sign In"
                }
                onPress={
                  loginMode === 'OTP'
                    ? (isOtpSent ? handleVerifyOtpAndLogin : handleSendOtp)
                    : handlePasswordLogin
                }
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading || !isFormValid}
                style={styles.loginButton}
                icon={loginMode === 'OTP' && !isOtpSent ? "mail-outline" : "log-in-outline"}
              />
            </View>
          </View>
          <View style={styles.footer}>
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account?</Text>
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => navigation.navigate('RegisterUser')}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Create new account"
              >
                <Text style={styles.signUpButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipLogin}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Skip login and continue to dashboard"
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
};

export default LoginScreen;