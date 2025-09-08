import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography, shadows } from '../../design-system/tokens';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../components/ui/ToastManager';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ModernInput as Input } from '../../components/ui/InputModern';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');


interface Props {
  navigation: any;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const isDark = false; // Hardcoded for now
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
  const [validation, setValidation] = useState({
    email: false,
    password: false,
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Start entrance animations
  React.useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

    // Real-time validation
    if (field === 'email' && value.length > 0) {
      const isValid = validateEmail(value);
      setValidation(prev => ({ ...prev, email: isValid }));
      if (!isValid && value.length > 5) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      }
    }

    if (field === 'password' && value.length > 0) {
      const isValid = value.length >= 6;
      setValidation(prev => ({ ...prev, password: isValid }));
      if (!isValid && value.length > 0) {
        setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      }
    }
  }, [errors, validateEmail]);

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
  const isFormValid = formData.email.length > 0 && formData.password.length > 0 && 
                     validation.email && validation.password && !errors.email && !errors.password;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    gradientBackground: {
      ...StyleSheet.absoluteFillObject,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing['2xl'],
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing['3xl'],
    },
    logoWrapper: {
      width: 80,
      height: 80,
      borderRadius: borderRadius['2xl'],
      backgroundColor: '#007AFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
      ...shadows.xl,
    },
    logoGradient: {
      width: 80,
      height: 80,
      borderRadius: borderRadius['2xl'],
      alignItems: 'center',
      justifyContent: 'center',
    },
    welcomeText: {
      fontSize: typography.fontSizes['4xl'],
      fontWeight: typography.fontWeights.bold,
      color: '#000000',
      textAlign: 'center',
      marginBottom: spacing.sm,
      letterSpacing: typography.letterSpacing.tight,
    },
    subtitleText: {
      fontSize: typography.fontSizes.lg,
      color: '#666666',
      textAlign: 'center',
      fontWeight: typography.fontWeights.medium,
    },
    formCard: {
      marginTop: spacing.xl,
    },
    inputGroup: {
      marginBottom: spacing.md,
    },
    actionButtons: {
      marginTop: spacing['2xl'],
    },
    loginButton: {
      marginBottom: spacing.lg,
    },
    forgotPasswordButton: {
      alignSelf: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.xl,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#E5E5E5',
    },
    dividerText: {
      marginHorizontal: spacing.lg,
      fontSize: typography.fontSizes.sm,
      color: '#666666',
      fontWeight: typography.fontWeights.medium,
    },
    socialButtonsContainer: {
      marginBottom: spacing['2xl'],
    },
    socialButton: {
      marginBottom: spacing.md,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: spacing.xl,
      borderTopWidth: 1,
      borderTopColor: '#E5E5E5',
    },
    footerText: {
      fontSize: typography.fontSizes.base,
      color: '#666666',
      marginRight: spacing.sm,
    },
    signUpButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    floatingElements: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
    },
    floatingCircle: {
      position: 'absolute',
      borderRadius: 100,
      backgroundColor: '#007AFF',
      opacity: 0.1,
    },
    circle1: {
      width: 200,
      height: 200,
      top: -100,
      right: -100,
    },
    circle2: {
      width: 150,
      height: 150,
      bottom: height * 0.3,
      left: -75,
    },
    circle3: {
      width: 100,
      height: 100,
      top: height * 0.2,
      left: width * 0.8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor="transparent"
        translucent
      />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={
          isDark 
            ? ['#0F0F0F', '#1A1A1A', '#262626'] 
            : ['#FAFBFC', '#F8FAFC', '#EDF2F7']
        }
        style={styles.gradientBackground}
      />

      {/* Floating Background Elements */}
      <View style={styles.floatingElements}>
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          duration={4000}
          style={[styles.floatingCircle, styles.circle1]}
        />
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          duration={6000}
          delay={1000}
          style={[styles.floatingCircle, styles.circle2]}
        />
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          duration={5000}
          delay={2000}
          style={[styles.floatingCircle, styles.circle3]}
        />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo and Welcome Section */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              }
            ]}
          >
            <View style={styles.logoWrapper}>
              <LinearGradient
                colors={['#FFD700', '#F7931E', '#D4AF37']}
                style={styles.logoGradient}
              >
                <MaterialIcons
                  name="directions-car"
                  size={40}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>
            
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Sign in to continue your journey</Text>
          </Animated.View>

          {/* Login Form */}
          <Animatable.View
            animation="fadeInUp"
            delay={600}
            duration={600}
          >
            <Card
              variant="glass"
              padding="2xl"
              style={{
                ...styles.formCard,
                borderRadius: 16
              }}
            >
              <View style={styles.inputGroup}>
                <Input
                  label="Email Address"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  leftIcon="email"
                  variant="filled"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email}
                  success={validation.email && formData.email.length > 0}
                  animationDelay={100}
                  placeholder="Enter your email"
                />
              </View>

              <View style={styles.inputGroup}>
                <Input
                  label="Password"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  leftIcon="lock"
                  variant="filled"
                  secureTextEntry
                  error={errors.password}
                  success={validation.password && formData.password.length > 0}
                  animationDelay={200}
                  placeholder="Enter your password"
                />
              </View>

              <View style={styles.actionButtons}>
                <Button
                  title={isLoading ? "Signing In..." : "Sign In"}
                  onPress={handleLogin}
                  variant="gradient"
                  size="lg"
                  fullWidth
                  disabled={!isFormValid || isLoading}
                  loading={isLoading}
                  animationType="glow"
                  style={styles.loginButton}
                />

                <Button
                  title="Forgot Password?"
                  onPress={() => navigation.navigate('ForgotPasswordScreen')}
                  variant="ghost"
                  style={styles.forgotPasswordButton}
                />
              </View>
            </Card>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtonsContainer}>
              <Button
                title="Continue with Google"
                onPress={() => console.log('Google login')}
                variant="outline"
                size="lg"
                fullWidth
                icon="google"
                style={styles.socialButton}
              />
              
              <Button
                title="Continue with Apple"
                onPress={() => console.log('Apple login')}
                variant="outline"
                size="lg"
                fullWidth
                icon="apple"
              />
            </View>

            {/* Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Button
                title="Sign Up"
                onPress={() => navigation.navigate('RegisterUser')}
                variant="ghost"
                style={styles.signUpButton}
              />
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;