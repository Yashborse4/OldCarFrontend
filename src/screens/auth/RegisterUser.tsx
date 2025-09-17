import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useAuth } from '../../context/AuthContext';
import { validateRegistrationForm } from '../../utils/validation';
import { ErrorHandler } from '../../components/ErrorHandler';
import { getRoleName } from '../../utils/permissions';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

import { RegisterScreenNavigationProp } from '../../navigation/types';

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterUser: React.FC<Props> = ({ navigation }) => {
  const { colors: themeColors } = useTheme();
  const { register, isLoading: authLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [isLoading, setIsLoading] = useState(false);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRegister = async () => {
    // Clear previous errors
    setError(null);
    
    // Validate form
    const validationResult = validateRegistrationForm({
      username,
      email,
      password,
      confirmPassword,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      phoneNumber: phoneNumber || undefined,
    });

    if (!validationResult.isValid) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: validationResult.errors[0], // Show first error
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({ 
        username, 
        email, 
        password, 
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phoneNumber: phoneNumber || undefined,
        role 
      });
      // AuthContext handles navigation on successful registration
    } catch (error: any) {
      setError(error);
      console.error('Registration error:', error);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="default" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to find your perfect car</Text>
          </View>

          <View style={styles.form}>
            <ErrorHandler 
              error={error} 
              onRetry={handleRetryRegistration}
              onDismiss={dismissError}
            />

            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              leftIcon="person"
              placeholder="Enter your username"
              autoCapitalize="none"
              returnKeyType="next"
              required
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  leftIcon="person"
                  placeholder="First name"
                  returnKeyType="next"
                  containerStyle={styles.halfInput}
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  leftIcon="person"
                  placeholder="Last name"
                  returnKeyType="next"
                  containerStyle={styles.halfInput}
                />
              </View>
            </View>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              leftIcon="email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              required
            />

            <Input
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              leftIcon="phone"
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              returnKeyType="next"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              leftIcon="lock"
              placeholder="Enter your password"
              secureTextEntry
              returnKeyType="next"
              required
            />

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              leftIcon="lock"
              placeholder="Confirm your password"
              secureTextEntry
              returnKeyType="done"
              required
            />

            <TouchableOpacity
              style={styles.rolePicker}
              onPress={() => setPickerVisible(true)}
            >
              <Text style={styles.roleLabel}>Role</Text>
              <View style={styles.roleButton}>
                <MaterialIcons name="group" size={20} color={themeColors.textSecondary} />
                <Text style={styles.roleText}>{getRoleName(role)}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color={themeColors.textSecondary} />
              </View>
            </TouchableOpacity>
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
          >
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInAccent}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        transparent
        visible={isPickerVisible}
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setRole('VIEWER');
                setPickerVisible(false);
              }}
            >
              <Text style={styles.modalOptionTitle}>Viewer</Text>
              <Text style={styles.modalOptionSubtitle}>Browse and view cars</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setRole('SELLER');
                setPickerVisible(false);
              }}
            >
              <Text style={styles.modalOptionTitle}>Seller</Text>
              <Text style={styles.modalOptionSubtitle}>List and sell your cars</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, styles.modalOptionLast]}
              onPress={() => {
                setRole('DEALER');
                setPickerVisible(false);
              }}
            >
              <Text style={styles.modalOptionTitle}>Dealer</Text>
              <Text style={styles.modalOptionSubtitle}>Professional car dealer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  halfInput: {
    marginBottom: 0,
  },
  rolePicker: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 8,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
  },
  roleText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: '#1A202C',
    marginLeft: 12,
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  signInLink: {
    alignSelf: 'center',
  },
  signInText: {
    fontSize: 15,
    color: '#718096',
  },
  signInAccent: {
    fontWeight: '600',
    color: '#FFD700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalOptionLast: {
    borderBottomWidth: 0,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  modalOptionSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
});

export default RegisterUser;


