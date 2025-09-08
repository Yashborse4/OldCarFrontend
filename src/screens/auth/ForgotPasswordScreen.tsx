import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useTheme } from '../../theme';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

// Mock forgot password function
const forgotPassword = async (data: { email: string }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.email) {
        resolve({ message: 'Reset email sent successfully' });
      } else {
        reject(new Error('Invalid email'));
      }
    }, 2000);
  });
};

const showToast = (type: 'success' | 'error', title: string, message: string) => {
  Alert.alert(title, message);
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Create dynamic UI colors based on theme
  const uiColors = {
    background: themeColors.background,
    card: themeColors.surface,
    text: themeColors.text,
    textSecondary: themeColors.textSecondary,
    accent: themeColors.primary,
    error: isDark ? '#FF453A' : '#FF3B30',
    success: '#30D158',
    warning: '#FFA000',
    border: themeColors.border,
    inputBg: isDark ? 'rgba(35, 35, 38, 0.9)' : 'rgba(248, 249, 252, 0.9)',
    shadow: themeColors.shadow,
    goldGradient: [themeColors.primary, '#E6C200', '#D4AF37'],
  };

  const handleResetPassword = async () => {
    if (!email) {
      showToast('error', 'Email Required', 'Please enter your email address.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    try {
      await forgotPassword({ email });
      setEmailSent(true);
      showToast(
        'success',
        'Email Sent',
        'If an account exists, a reset link has been sent to your email.'
      );
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
    } catch (error: any) {
      // To prevent email enumeration, show a generic success message even on error.
      setEmailSent(true);
      showToast(
        'success',
        'Email Sent',
        'If an account exists, a reset link has been sent to your email.'
      );
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: uiColors.background,
    },
    gradientBackground: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    keyboardContainer: {
      width: '100%',
      alignItems: 'center',
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: 32,
      width: '100%',
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 12,
      letterSpacing: 0.5,
      textAlign: 'center',
      color: isDark ? '#FFFFFF' : '#333333',
    },
    subtitle: {
      fontSize: 16,
      opacity: 0.9,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: 10,
      letterSpacing: 0.3,
      color: uiColors.textSecondary,
    },
    formCard: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      borderRadius: 20,
      padding: 24,
      marginTop: 16,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 15,
      borderWidth: 1,
      backgroundColor: uiColors.card,
      borderColor: uiColors.border,
    },
    formSection: {
      width: '100%',
    },
    formGroup: {
      marginBottom: 24,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      letterSpacing: 0.2,
      color: uiColors.text,
    },
    inputLabelFocused: {
      color: uiColors.accent,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 4,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderColor: uiColors.border,
      backgroundColor: uiColors.inputBg,
    },
    inputContainerFocused: {
      borderColor: uiColors.accent,
      backgroundColor: isDark ? 'rgba(35, 35, 38, 0.7)' : 'rgba(255, 255, 255, 0.9)',
    },
    input: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 0,
      color: uiColors.text,
    },
    inputIcon: {
      marginRight: 12,
      color: uiColors.textSecondary,
    },
    inputIconFocused: {
      color: uiColors.accent,
    },
    validationIcon: {
      marginLeft: 8,
    },
    resetButton: {
      width: '100%',
      height: 52,
      borderRadius: 16,
      marginTop: 12,
      marginBottom: 16,
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
      overflow: 'hidden',
    },
    buttonGradient: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: 16,
      borderRadius: 16,
    },
    resetButtonText: {
      color: '#111827',
      fontWeight: '700',
      fontSize: 18,
      marginLeft: 8,
      letterSpacing: 0.5,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    backToLogin: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
      paddingVertical: 8,
    },
    backToLoginText: {
      fontSize: 15,
      fontWeight: '600',
      color: uiColors.accent,
    },
    helpSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    helpText: {
      fontSize: 13,
      lineHeight: 18,
      marginLeft: 8,
      flex: 1,
      color: uiColors.textSecondary,
    },
    successCard: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      borderRadius: 20,
      padding: 24,
      marginTop: 16,
      backgroundColor: isDark ? 'rgba(48, 209, 88, 0.1)' : 'rgba(48, 209, 88, 0.1)',
      borderWidth: 1,
      borderColor: uiColors.success,
      alignItems: 'center',
    },
    successIcon: {
      marginBottom: 16,
    },
    successTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 8,
      color: uiColors.success,
      textAlign: 'center',
    },
    successMessage: {
      fontSize: 16,
      lineHeight: 22,
      textAlign: 'center',
      color: uiColors.textSecondary,
      marginBottom: 16,
    },
    redirectMessage: {
      fontSize: 14,
      color: uiColors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <LinearGradient
        colors={isDark ? ['#0A1017', '#1C2732', '#2A3743'] : ['#F0F4F8', '#E3EAF2', '#D6E0EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <MaterialIcons
                  name="lock-reset"
                  size={50}
                  color={uiColors.accent}
                />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                {emailSent
                  ? 'Check your email for reset instructions'
                  : 'Enter your email address and we\'ll send you instructions to reset your password'}
              </Text>
            </View>
            
            {emailSent ? (
              // Success State
              <View style={styles.successCard}>
                <MaterialIcons
                  name="mark-email-read"
                  size={64}
                  color={uiColors.success}
                  style={styles.successIcon}
                />
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successMessage}>
                  We've sent password reset instructions to your email address. Please check your inbox and follow the link to reset your password.
                </Text>
                <Text style={styles.redirectMessage}>
                  Redirecting to login screen...
                </Text>
              </View>
            ) : (
              // Form State
              <View style={styles.formCard}>
                <View style={styles.formSection}>
                  {/* Email Input */}
                  <View style={styles.formGroup}>
                    <Text
                      style={[
                        styles.inputLabel,
                        emailFocused && styles.inputLabelFocused,
                      ]}
                    >
                      Email Address
                    </Text>
                    <View
                      style={[
                        styles.inputContainer,
                        emailFocused && styles.inputContainerFocused,
                      ]}
                    >
                      <AntDesign
                        name="mail"
                        size={20}
                        style={[
                          styles.inputIcon,
                          emailFocused && styles.inputIconFocused,
                        ]}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email address"
                        placeholderTextColor={uiColors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="go"
                        onSubmitEditing={handleResetPassword}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                      />
                      {email && (
                        <AntDesign
                          name={isValidEmail(email) ? 'check-circle' : 'exclamation-circle'}
                          size={18}
                          style={[
                            styles.validationIcon,
                            {
                              color: isValidEmail(email) ? uiColors.success : uiColors.warning,
                            },
                          ]}
                        />
                      )}
                    </View>
                  </View>
                  
                  {/* Reset Button */}
                  <TouchableOpacity
                    onPress={handleResetPassword}
                    style={[styles.resetButton, isLoading && styles.buttonDisabled]}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={uiColors.goldGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      {isLoading ? (
                        <>
                          <ActivityIndicator color="#333333" size="small" />
                          <Text style={styles.resetButtonText}>Sending...</Text>
                        </>
                      ) : (
                        <>
                          <MaterialIcons name="send" size={20} color="#333333" />
                          <Text style={styles.resetButtonText}>Send Reset Link</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  {/* Back to Login */}
                  <TouchableOpacity
                    style={styles.backToLogin}
                    onPress={() => navigation.goBack()}
                  >
                    <MaterialIcons name="arrow-left" size={16} color={uiColors.accent} style={{ marginRight: 6 }} />
                    <Text style={styles.backToLoginText}>Back to Sign In</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Help Section */}
                <View style={styles.helpSection}>
                  <MaterialIcons name="info-outline" size={16} color={uiColors.textSecondary} />
                  <Text style={styles.helpText}>
                    Check your spam folder if you don't receive the email within 5 minutes. The reset link will expire in 1 hour for security reasons.
                  </Text>
                </View>
              </View>
            )}
          </KeyboardAvoidingView>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;


