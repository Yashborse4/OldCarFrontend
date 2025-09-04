import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue as rf } from 'react-native-responsive-fontsize';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';


interface Props {
  navigation: any;
}

// Real authentication functions using API client

const showToast = (type: 'success' | 'error', title: string, message: string) => {
  Alert.alert(title, message);
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const { login, isLoading: authLoading } = useAuth();
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Create modern dark UI color palette
  const uiColors = {
    // Dark theme focused colors
    background: '#0A0A0B',
    backgroundSecondary: '#111113',
    card: 'rgba(18, 18, 20, 0.95)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    accent: '#007AFF',
    accentHover: '#0056CC',
    error: '#FF453A',
    warning: '#FF9F0A',
    success: '#32D74B',
    inputBg: 'rgba(28, 28, 30, 0.9)',
    inputBorder: 'rgba(255, 255, 255, 0.12)',
    inputBorderFocused: '#007AFF',
    shadow: 'rgba(0, 0, 0, 0.3)',
    gradientPrimary: ['#1A1A1C', '#2A2A2E', '#1F1F23'],
    gradientButton: ['#007AFF', '#0056CC'],
    gradientCard: ['rgba(28, 28, 30, 0.95)', 'rgba(22, 22, 24, 0.98)'],
  };

  // State management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Initialize animations
  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Keyboard visibility handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Login functionality
  const handleLogin = async () => {
    setLoginAttempted(true);
    if (!email || !password) {
      showToast('error', 'Missing Fields', 'Please enter your email and password.');
      return;
    }
    
    try {
      console.log('Attempting login with:', { email: email.trim() });
      await login({ 
        usernameOrEmail: email.trim(), 
        password 
      });
      
      console.log('Login successful');
      // AuthContext shows success toast, so we just navigate
      setTimeout(() => {
        navigation.replace('Dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      // AuthContext handles error toasts, so we don't need to show them again
    }
  };

  // Input focus handlers
  const handleInputFocus = (inputName: 'email' | 'password', isFocused: boolean) => {
    if (inputName === 'email') {
      setEmailFocused(isFocused);
    } else {
      setPasswordFocused(isFocused);
    }
  };

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Dismiss keyboard when tapping outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: uiColors.background,
    },
    gradientBackground: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: wp('6%'),
      paddingVertical: hp('4%'),
    },
    logoSection: {
      alignItems: 'center',
      marginBottom: hp('6%'),
    },
    logoContainer: {
      width: wp('20%'),
      height: wp('20%'),
      borderRadius: wp('6%'),
      backgroundColor: uiColors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp('3%'),
      shadowColor: uiColors.accent,
      shadowOffset: { width: 0, height: hp('1%') },
      shadowOpacity: 0.3,
      shadowRadius: wp('5%'),
      elevation: 10,
    },
    title: {
      fontSize: rf(28),
      fontWeight: '800',
      marginBottom: hp('1%'),
      letterSpacing: -0.5,
      textAlign: 'center',
      color: uiColors.text,
    },
    subtitle: {
      fontSize: rf(16),
      fontWeight: '400',
      textAlign: 'center',
      marginBottom: hp('1%'),
      letterSpacing: 0.2,
      color: uiColors.textSecondary,
    },
    formSection: {
      width: '100%',
      maxWidth: wp('90%'),
      alignSelf: 'center',
    },
    formCard: {
      width: '100%',
      borderRadius: wp('6%'),
      padding: wp('8%'),
      marginTop: hp('4%'),
      backgroundColor: uiColors.card,
      borderWidth: 1,
      borderColor: uiColors.cardBorder,
      shadowColor: uiColors.shadow,
      shadowOffset: { width: 0, height: hp('2.5%') },
      shadowOpacity: 0.25,
      shadowRadius: wp('6%'),
      elevation: 15,
    },
    inputGroup: {
      marginBottom: hp('3.5%'),
    },
    inputLabel: {
      fontSize: rf(13),
      fontWeight: '600',
      marginBottom: hp('1.5%'),
      letterSpacing: 0.3,
      color: uiColors.textSecondary,
      textTransform: 'uppercase',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderRadius: wp('4%'),
      paddingHorizontal: wp('5%'),
      paddingVertical: hp('0.5%'),
      backgroundColor: uiColors.inputBg,
      borderColor: uiColors.inputBorder,
      shadowColor: uiColors.shadow,
      shadowOffset: { width: 0, height: hp('0.5%') },
      shadowOpacity: 0.1,
      shadowRadius: wp('2%'),
      elevation: 3,
    },
    inputContainerFocused: {
      borderColor: uiColors.inputBorderFocused,
      backgroundColor: uiColors.inputBg,
      shadowOpacity: 0.2,
      shadowRadius: wp('3%'),
      transform: [{ scale: 1.02 }],
    },
    inputContainerError: {
      borderColor: uiColors.error,
      backgroundColor: 'rgba(255, 69, 58, 0.08)',
    },
    input: {
      flex: 1,
      fontSize: rf(15),
      paddingVertical: hp('2%'),
      paddingHorizontal: 0,
      color: uiColors.text,
      fontWeight: '500',
    },
    inputIcon: {
      marginRight: wp('4%'),
      color: uiColors.textTertiary,
    },
    inputIconFocused: {
      color: uiColors.accent,
    },
    inputIconError: {
      color: uiColors.error,
    },
    eyeButton: {
      padding: wp('2%'),
      marginLeft: wp('3%'),
      borderRadius: wp('2%'),
    },
    errorText: {
      fontSize: rf(12),
      marginTop: hp('1%'),
      marginLeft: wp('1%'),
      color: uiColors.error,
      fontWeight: '500',
    },
    warningText: {
      fontSize: rf(12),
      marginTop: hp('1%'),
      marginLeft: wp('1%'),
      color: uiColors.warning,
      fontWeight: '500',
    },
    loginButton: {
      width: '100%',
      height: hp('7.5%'),
      borderRadius: wp('4.5%'),
      marginTop: hp('4%'),
      marginBottom: hp('2.5%'),
      shadowColor: uiColors.accent,
      shadowOffset: { width: 0, height: hp('1%') },
      shadowOpacity: 0.3,
      shadowRadius: wp('4%'),
      elevation: 10,
      overflow: 'hidden',
    },
    buttonGradient: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: wp('5%'),
      borderRadius: wp('4.5%'),
    },
    loginButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: rf(16),
      marginLeft: wp('2%'),
      letterSpacing: 0.3,
    },
    buttonDisabled: {
      opacity: 0.6,
      transform: [{ scale: 0.98 }],
    },
    forgotPassword: {
      alignSelf: 'center',
      marginTop: hp('1%'),
      marginBottom: hp('3%'),
      paddingVertical: hp('1%'),
      paddingHorizontal: wp('3%'),
      borderRadius: wp('2%'),
    },
    forgotPasswordText: {
      fontSize: rf(14),
      fontWeight: '600',
      color: uiColors.accent,
      letterSpacing: 0.2,
      paddingVertical: hp('1%'),
      paddingHorizontal: wp('3%'),
      borderRadius: wp('2%'),
    },
    bottomSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: hp('4%'),
      paddingTop: hp('3%'),
      borderTopWidth: 1,
      borderTopColor: uiColors.cardBorder,
    },
    bottomText: {
      fontSize: rf(14),
      marginRight: wp('2%'),
      color: uiColors.textSecondary,
      fontWeight: '500',
    },
    signUpButton: {
      paddingVertical: hp('1%'),
      paddingHorizontal: wp('3%'),
      borderRadius: wp('2%'),
    },
    signUpText: {
      fontSize: rf(14),
      fontWeight: '700',
      color: uiColors.accent,
      letterSpacing: 0.2,
    },
  });

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <LinearGradient
          colors={uiColors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        >
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            {/* Animated Logo Section */}
            <Animated.View 
              style={[
                styles.logoSection,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              <Animatable.View 
                animation="pulse" 
                iterationCount="infinite" 
                duration={2000}
                style={styles.logoContainer}
              >
                <MaterialIcons
                  name="directions-car"
                  size={rf(30)}
                  color="#FFFFFF"
                />
              </Animatable.View>
              <Animatable.Text 
                animation="fadeInUp" 
                delay={300}
                style={styles.title}
              >
                Welcome Back
              </Animatable.Text>
              {!keyboardVisible && (
                <Animatable.Text 
                  animation="fadeInUp" 
                  delay={500}
                  style={styles.subtitle}
                >
                  Sign in to your account
                </Animatable.Text>
              )}
            </Animated.View>

            {/* Animated Form Section */}
            <Animatable.View
              animation="fadeInUp"
              delay={800}
              style={styles.formSection}
            >
              <LinearGradient
                colors={uiColors.gradientCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.formCard}
              >
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Email or Username
                  </Text>
                  <Animatable.View
                    animation={emailFocused ? 'pulse' : undefined}
                    style={[
                      styles.inputContainer,
                      emailFocused && styles.inputContainerFocused,
                      loginAttempted && !email && styles.inputContainerError,
                    ]}
                  >
                    <AntDesign
                      name="user"
                      size={rf(18)}
                      style={[
                        styles.inputIcon,
                        emailFocused && styles.inputIconFocused,
                        loginAttempted && !email && styles.inputIconError,
                      ]}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email or username"
                      placeholderTextColor={uiColors.textTertiary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      onFocus={() => handleInputFocus('email', true)}
                      onBlur={() => handleInputFocus('email', false)}
                    />
                    {email && (
                      <AntDesign
                        name={isValidEmail(email) ? 'check-circle' : 'exclamation-circle'}
                        size={rf(16)}
                        style={{
                          marginLeft: 8,
                          color: isValidEmail(email) ? uiColors.success : uiColors.warning,
                        }}
                      />
                    )}
                  </Animatable.View>
                  {loginAttempted && !email && (
                    <Animatable.Text animation="shake" style={styles.errorText}>
                      Email is required
                    </Animatable.Text>
                  )}
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Password
                  </Text>
                  <Animatable.View
                    animation={passwordFocused ? 'pulse' : undefined}
                    style={[
                      styles.inputContainer,
                      passwordFocused && styles.inputContainerFocused,
                      loginAttempted && !password && styles.inputContainerError,
                    ]}
                  >
                    <AntDesign
                      name="lock"
                      size={rf(18)}
                      style={[
                        styles.inputIcon,
                        passwordFocused && styles.inputIconFocused,
                        loginAttempted && !password && styles.inputIconError,
                      ]}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor={uiColors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      returnKeyType="go"
                      onSubmitEditing={handleLogin}
                      onFocus={() => handleInputFocus('password', true)}
                      onBlur={() => handleInputFocus('password', false)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                      activeOpacity={0.7}
                    >
                      <AntDesign
                        name={showPassword ? 'eye' : 'eye-o'}
                        size={rf(18)}
                        style={{
                          color: passwordFocused ? uiColors.accent : uiColors.textTertiary,
                        }}
                      />
                    </TouchableOpacity>
                  </Animatable.View>
                  {loginAttempted && !password && (
                    <Animatable.Text animation="shake" style={styles.errorText}>
                      Password is required
                    </Animatable.Text>
                  )}
                  {password && password.length > 0 && password.length < 6 && (
                    <Animatable.Text animation="fadeIn" style={styles.warningText}>
                      Password should be at least 6 characters
                    </Animatable.Text>
                  )}
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  style={[styles.loginButton, (authLoading || isLoading) && styles.buttonDisabled]}
                  disabled={authLoading || isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={uiColors.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {(authLoading || isLoading) ? (
                      <>
                        <ActivityIndicator color="#FFFFFF" size="small" />
                        <Text style={styles.loginButtonText}>Signing In...</Text>
                      </>
                    ) : (
                      <>
                        <AntDesign name="login" size={rf(16)} color="#FFFFFF" />
                        <Text style={styles.loginButtonText}>Sign In</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('ForgotPasswordScreen');
                  }}
                  style={styles.forgotPassword}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                  <Text style={styles.bottomText}>Don't have an account?</Text>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('RegisterUser');
                    }}
                    style={styles.signUpButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.signUpText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animatable.View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

