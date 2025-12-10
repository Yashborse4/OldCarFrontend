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
import MaterialIcons from '@react-native-vector-icons/material-icons';

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

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { login } = useAuth();
  const { notifyLoginSuccess, notifyLoginError } = useNotifications();

  // State management
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
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

  // Handle login
  const handleLogin = useCallback(async () => {
    // Clear previous errors
    setErrors({ email: '', password: '' });

    // Validation
    let hasErrors = false;
    const newErrors = { email: '', password: '' };

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
      await login({
        usernameOrEmail: formData.email.trim(),
        password: formData.password.trim()
      });

      notifyLoginSuccess('Welcome back! 🎉');
      navigation.replace('Dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      notifyLoginError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateEmail, login, notifyLoginSuccess, notifyLoginError, navigation]);

  // Memoize form validation
  const isFormValid = useMemo(() => {
    return formData.email.length > 0 && formData.password.length > 0 &&
      !errors.email && !errors.password;
  }, [formData.email, formData.password, errors.email, errors.password]);

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
    form: {
      marginTop: getResponsiveSpacing('xl'),
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
      position: 'absolute',
      bottom: hp(4),
      left: getResponsiveSpacing('lg'),
      right: getResponsiveSpacing('lg'),
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                  <MaterialIcons
                    name="directions-car"
                    size={scaleSize(48)}
                    color="#FFFFFF"
                  />
                </View>
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue to your garage</Text>
            </View>

            <View style={styles.form}>
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
                  leftIcon="email"
                  variant="filled"
                  accessibilityLabel="Email address input"
                  accessibilityHint="Enter your email address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Input
                  label="Password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="••••••••"
                  secureTextEntry
                  error={errors.password}
                  leftIcon="lock"
                  variant="filled"
                  accessibilityLabel="Password input"
                  accessibilityHint="Enter your password"
                  textContentType="password"
                />
              </View>

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

              <Button
                title={isLoading ? "Signing in..." : "Sign In"}
                onPress={handleLogin}
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading || !isFormValid}
                style={styles.loginButton}
                icon="login"
              />
            </View>
          </View>
        </ScrollView>

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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
