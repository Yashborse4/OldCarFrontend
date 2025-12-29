import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useToastActions } from '../../components/ui/ToastManager';

interface Props {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const colors = {
    color: '#1A202C',
  };

  const { forgotPassword } = useAuth();
  const { showSuccess, showError } = useToastActions();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      showError('Email Required', 'Please enter your email.');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setEmailSent(true);
      showSuccess(
        'OTP Sent',
        'Check your email for the OTP.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="default" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.color} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={48} color={colors.color} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              leftIcon="email"
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              required
            />

            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading || !email}
              fullWidth
              style={styles.resetButton}
            />

            <TouchableOpacity
              style={styles.backToLoginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.backToLoginText}>
                Remember your password?{' '}
                <Text style={styles.backToLoginAccent}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: '#FAFAFA',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 32,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    color: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,

  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    color: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 2,

  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    gap: 24,
  },
  resetButton: {
    marginTop: 16,
  },
  backToLoginLink: {
    alignSelf: 'center',
    marginTop: 16,
  },
  backToLoginText: {
    fontSize: 15,
    color: '#718096',
  },
  backToLoginAccent: {
    fontWeight: '600',
    color: '#FFD700',
  },
});

export default ForgotPasswordScreen;

