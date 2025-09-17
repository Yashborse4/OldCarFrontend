import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../components/ui/ToastManager';
import { Button } from '../../components/ui/Button';
import { ModernInput as Input } from '../../components/ui/InputModern';
import { useTheme } from '../../theme';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark, colors: themeColors } = useTheme();
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

  // Check if form is valid
  const isFormValid = formData.email.length > 0 && formData.password.length > 0;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    gradientBackground: {
      ...StyleSheet.absoluteFillObject,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 48,
    },
    logoContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: themeColors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: themeColors.textSecondary,
      textAlign: 'center',
      fontWeight: '400',
    },
    form: {
      marginTop: 32,
    },
    inputContainer: {
      marginBottom: 20,
    },
    loginButton: {
      marginTop: 32,
      height: 52,
      borderRadius: 12,
    },
    forgotPassword: {
      alignSelf: 'center',
      marginTop: 16,
      paddingVertical: 8,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: themeColors.primary,
      fontWeight: '500',
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 24,
      right: 24,
      alignItems: 'center',
    },
    signUpContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    signUpText: {
      fontSize: 14,
      color: themeColors.textSecondary,
      marginRight: 4,
    },
    signUpButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    signUpButtonText: {
      fontSize: 14,
      color: themeColors.primary,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor="transparent"
        translucent
      />
      
      {/* Subtle Gradient Background */}
      <LinearGradient
        colors={
          isDark 
            ? [themeColors.background, themeColors.surface] 
            : ['#FAFBFC', '#FFFFFF']
        }
        style={styles.gradientBackground}
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#FFD700', '#F7931E']}
                style={styles.logo}
              >
                <MaterialIcons
                  name="directions-car"
                  size={36}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
            
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Input
                label="Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                leftIcon="email"
                variant="outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
                placeholder="Enter your email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                leftIcon="lock"
                variant="outline"
                secureTextEntry
                error={errors.password}
                placeholder="Enter your password"
              />
            </View>

            <Button
              title={isLoading ? "Signing In..." : "Sign In"}
              onPress={handleLogin}
              variant="primary"
              fullWidth
              disabled={!isFormValid || isLoading}
              loading={isLoading}
              style={styles.loginButton}
            />

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPasswordScreen')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <TouchableOpacity 
              style={styles.signUpButton}
              onPress={() => navigation.navigate('RegisterUser')}
            >
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;