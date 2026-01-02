import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/ApiClient';
import { useNotifications } from '../../components/ui/ToastManager';

interface Props {
  navigation: any;
  route: any;
}

const OTP_LENGTH = 6;

const EmailVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { notifySuccess, notifyError } = useNotifications();
  const { width } = useWindowDimensions();

  // Get email from route params or fallback to empty
  const email = route.params?.email || '';

  // State
  const [otpValues, setOtpValues] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [activeInputIndex, setActiveInputIndex] = useState(0);

  // Refs
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Calculate generic input size based on screen width
  const inputSize = Math.min(width / 8, 50);

  // Start countdown on mount
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Focus the first input on mount
  useEffect(() => {
    // Small timeout to allow transition/mount to finish
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleVerify = useCallback(async () => {
    const otp = otpValues.join('');
    if (otp.length !== OTP_LENGTH) {
      notifyError(`Please enter a valid ${OTP_LENGTH}-digit OTP`);
      return;
    }

    try {
      setIsLoading(true);
      Keyboard.dismiss();

      const isValid = await apiClient.verifyOtp(email, otp, 'EMAIL_VERIFICATION');

      if (isValid) {
        notifySuccess('Email verified successfully! You can now log in.');
        navigation.replace('LoginScreen');
      } else {
        notifyError('Invalid OTP. Please try again.');
        // Clear inputs on invalid otp? Optional.
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      notifyError(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  }, [email, otpValues, navigation, notifySuccess, notifyError]);

  const handleResendOtp = useCallback(async () => {
    if (countdown > 0) return;

    try {
      setIsResending(true);
      await apiClient.sendOtp(email, 'EMAIL_VERIFICATION');
      notifySuccess('OTP sent successfully!');
      setCountdown(60);
      // Optionally focus first input again
      inputRefs.current[0]?.focus();
      setOtpValues(new Array(OTP_LENGTH).fill(''));
      setActiveInputIndex(0);
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      notifyError(error.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  }, [email, countdown, notifySuccess, notifyError]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otpValues];

    // Handle paste events (if text length > 1)
    if (text.length > 1) {
      const pastedCode = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
      const digits = pastedCode.split('');

      for (let i = 0; i < digits.length; i++) {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = digits[i];
        }
      }
      setOtpValues(newOtp);

      // Submit automatically if full code is pasted
      if (pastedCode.length === OTP_LENGTH) {
        Keyboard.dismiss();
        // We can't immediately call handleVerify because state update is async,
        // but often user will press button. 
        // Or we can use a ref or effect to trigger it.
        // Let's just focus the last filled index.
        const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
        setActiveInputIndex(nextIndex);
      } else {
        const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
        setActiveInputIndex(nextIndex);
      }
      return;
    }

    // Normal typing
    const digit = text.replace(/[^0-9]/g, '');
    newOtp[index] = digit;
    setOtpValues(newOtp);

    // Auto-advance
    if (digit !== '') {
      if (index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
        setActiveInputIndex(index + 1);
      } else {
        // Blur if last digit entered? Or keep focus?
        inputRefs.current[index]?.blur();
        setActiveInputIndex(-1); // No active input
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otpValues[index] === '' && index > 0) {
        // Move to previous input and delete its value
        const newOtp = [...otpValues];
        newOtp[index - 1] = '';
        setOtpValues(newOtp);
        inputRefs.current[index - 1]?.focus();
        setActiveInputIndex(index - 1);
      }
      // If current input is not empty, standard behavior handles deletion, 
      // but onChangeText will catch the empty string update.
    }
  };

  const activeColor = colors.primary;
  const inactiveColor = isDark ? colors.border : '#E0E0E0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
              <Ionicons name="shield-checkmark-outline" size={48} color={colors.primary} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Verification Code</Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Please enter the 6-digit code sent to{'\n'}
              <Text style={{ fontWeight: '700', color: colors.text }}>{email}</Text>
            </Text>

            <View style={styles.otpContainer}>
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <View key={index} style={styles.inputWrapper}>
                  <TextInput
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={[
                      styles.otpInput,
                      {
                        width: inputSize,
                        height: inputSize + 10,
                        borderRadius: 12,
                        backgroundColor: isDark ? '#2A2A2A' : '#F5F5F5',
                        borderColor: activeInputIndex === index || otpValues[index]
                          ? activeColor
                          : inactiveColor,
                        borderWidth: activeInputIndex === index ? 2 : 1,
                        color: colors.text,
                        fontSize: 24,
                      }
                    ]}
                    value={otpValues[index]}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setActiveInputIndex(index)}
                    keyboardType="number-pad"
                    maxLength={Platform.OS === 'ios' ? 1 : 12} // Allow >1 on Android to capture paste more reliably, regex handles stripping
                    selectTextOnFocus
                    selectionColor={colors.primary}
                    textContentType="oneTimeCode" // iOS autofill hint
                  />
                </View>
              ))}
            </View>

            <View style={styles.actionsContainer}>
              <Button
                title={isLoading ? "Verifying..." : "Verify Email"}
                onPress={handleVerify}
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading || otpValues.join('').length !== OTP_LENGTH}
                style={styles.verifyButton}
              />

              <View style={styles.resendContainer}>
                <Text style={[styles.resendText, { color: colors.textSecondary }]}>
                  Didn't receive the code?
                </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={countdown > 0 || isResending}
                >
                  <Text style={[
                    styles.resendLink,
                    { color: countdown > 0 ? colors.textSecondary : colors.primary }
                  ]}>
                    {isResending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
    marginLeft: -8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800', // Extra bold for modern look
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
  },
  inputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    textAlign: 'center',
    fontWeight: '600',
    // Width/Height/Color are set dynamically in render
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 400,
  },
  verifyButton: {
    width: '100%',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    marginRight: 8,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default EmailVerificationScreen;
