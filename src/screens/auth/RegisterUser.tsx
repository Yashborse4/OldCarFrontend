import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../theme';
import Toast from 'react-native-toast-message';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import { useAuth } from '../../context/AuthContext';
import { validateRegistrationForm, formatValidationErrors } from '../../utils/validation';
import { ErrorHandler } from '../../components/ErrorHandler';
import { getRoleName } from '../../utils/permissions';

import { RegisterScreenNavigationProp } from '../../navigation/types';

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterUser: React.FC<Props> = ({ navigation }) => {

  const { isDark, colors } = useTheme();
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

  // Adaptive color palette
  const systemColors = {
    background: themeColors.background,
    card: themeColors.surface,
    label: themeColors.text,
    secondaryLabel: themeColors.textSecondary,
    accent: themeColors.primary,
    error: '#FF3B30',
    warning: '#FFA000',
    border: themeColors.border,
    inputBg: isDark ? 'rgba(45, 45, 50, 0.8)' : themeColors.surface,
    shadow: themeColors.shadow,
  };

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
    <SafeAreaView style={[styles.container, { backgroundColor: systemColors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollViewContent]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header (hidden for modern look) */}
          {/* <View style={styles.header} /> */}
          <View style={styles.headerSpacer} />
          <View style={styles.titleSection}>
            <Text style={[styles.textTitle, { color: systemColors.label }]}>Create an Account</Text>
            <Text style={[styles.textSecondary, { color: systemColors.secondaryLabel, marginTop: 8 }]}>Join us to find your perfect car</Text>
          </View>
          <View style={[styles.card, { backgroundColor: systemColors.card, shadowColor: systemColors.shadow }]}> 
            {/* Error Handler */}
            <ErrorHandler 
              error={error} 
              onRetry={handleRetryRegistration}
              onDismiss={dismissError}
            />
            
            <View style={styles.formGroup}>
              <View style={[styles.inputContainer, { borderColor: systemColors.border, backgroundColor: systemColors.inputBg }]}> 
                <AntDesign name="user" size={20} style={[styles.inputIcon, { color: systemColors.secondaryLabel }]} />
                <TextInput
                  style={[styles.input, { color: systemColors.label }]}
                  placeholder="Username *"
                  placeholderTextColor={systemColors.secondaryLabel}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <View style={[styles.inputContainer, { borderColor: systemColors.border, backgroundColor: systemColors.inputBg }]}> 
                  <AntDesign name="user" size={20} style={[styles.inputIcon, { color: systemColors.secondaryLabel }]} />
                  <TextInput
                    style={[styles.input, { color: systemColors.label }]}
                    placeholder="First Name"
                    placeholderTextColor={systemColors.secondaryLabel}
                    value={firstName}
                    onChangeText={setFirstName}
                    returnKeyType="next"
                  />
                </View>
              </View>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <View style={[styles.inputContainer, { borderColor: systemColors.border, backgroundColor: systemColors.inputBg }]}> 
                  <AntDesign name="user" size={20} style={[styles.inputIcon, { color: systemColors.secondaryLabel }]} />
                  <TextInput
                    style={[styles.input, { color: systemColors.label }]}
                    placeholder="Last Name"
                    placeholderTextColor={systemColors.secondaryLabel}
                    value={lastName}
                    onChangeText={setLastName}
                    returnKeyType="next"
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <View style={[styles.inputContainer, { borderColor: systemColors.border, backgroundColor: systemColors.inputBg }]}> 
                <AntDesign name="mail" size={20} style={[styles.inputIcon, { color: systemColors.secondaryLabel }]} />
                <TextInput
                  style={[styles.input, { color: systemColors.label }]}
                  placeholder="Email Address *"
                  placeholderTextColor={systemColors.secondaryLabel}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <View style={[styles.inputContainer, { borderColor: systemColors.border, backgroundColor: systemColors.inputBg }]}> 
                <AntDesign name="phone" size={20} style={[styles.inputIcon, { color: systemColors.secondaryLabel }]} />
                <TextInput
                  style={[styles.input, { color: systemColors.label }]}
                  placeholder="Phone Number"
                  placeholderTextColor={systemColors.secondaryLabel}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <View style={[styles.inputContainer, { borderColor: systemColors.border, backgroundColor: systemColors.inputBg }]}> 
                <AntDesign name="lock" size={20} style={[styles.inputIcon, { color: systemColors.secondaryLabel }]} />
                <TextInput
                  style={[styles.input, { color: systemColors.label }]}
                  placeholder="Password *"
                  placeholderTextColor={systemColors.secondaryLabel}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="next"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <View style={[styles.inputContainer, { borderColor: systemColors.border, backgroundColor: systemColors.inputBg }]}> 
                <AntDesign name="lock" size={20} style={[styles.inputIcon, { color: systemColors.secondaryLabel }]} />
                <TextInput
                  style={[styles.input, { color: systemColors.label }]}
                  placeholder="Confirm Password *"
                  placeholderTextColor={systemColors.secondaryLabel}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  returnKeyType="next"
                />
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.inputContainer, styles.rolePicker, { borderColor: systemColors.border, backgroundColor: systemColors.inputBg }]}
              onPress={() => setPickerVisible(true)}
            >
              <AntDesign name="team" size={20} style={[styles.inputIcon, { color: systemColors.secondaryLabel }]} />
              <Text style={[styles.input, { color: systemColors.label }]}>
                {getRoleName(role)}
              </Text>
              <AntDesign name="down" size={16} style={{ color: systemColors.secondaryLabel }} />
            </TouchableOpacity>
          </View>
          <Modal
            animationType="fade"
            transparent={true}
            visible={isPickerVisible}
            onRequestClose={() => setPickerVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPressOut={() => setPickerVisible(false)}
            >
              <View style={[styles.modalContent, { backgroundColor: systemColors.card, shadowColor: systemColors.shadow }]}> 
                <TouchableOpacity
                  style={[styles.listItem, { borderBottomColor: systemColors.border }]}
                  onPress={() => {
                    setRole('VIEWER');
                    setPickerVisible(false);
                  }}
                >
                  <Text style={[styles.textBody, { color: systemColors.label }]}>Viewer</Text>
                  <Text style={[styles.textCaption, { color: systemColors.secondaryLabel }]}>Browse and view cars</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.listItem, { borderBottomColor: systemColors.border }]}
                  onPress={() => {
                    setRole('SELLER');
                    setPickerVisible(false);
                  }}
                >
                  <Text style={[styles.textBody, { color: systemColors.label }]}>Seller</Text>
                  <Text style={[styles.textCaption, { color: systemColors.secondaryLabel }]}>List and sell your cars</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.listItem, styles.listItemLast]}
                  onPress={() => {
                    setRole('DEALER');
                    setPickerVisible(false);
                  }}
                >
                  <Text style={[styles.textBody, { color: systemColors.label }]}>Dealer</Text>
                  <Text style={[styles.textCaption, { color: systemColors.secondaryLabel }]}>Professional car dealer</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
          <TouchableOpacity
            onPress={handleRegister}
            style={[styles.buttonPrimary, { backgroundColor: systemColors.accent }, (isLoading || authLoading) && styles.buttonDisabled]}
            disabled={isLoading || authLoading}
          >
            {(isLoading || authLoading) ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signInLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.textSecondary, { color: systemColors.secondaryLabel }]}>Already have an account?{' '}
              <Text style={[styles.textAccent, { color: systemColors.accent }]}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'transparent',
  },
  headerSpacer: {
    height: 12,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  textTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  textSecondary: {
    fontSize: 15,
    color: '#888',
    opacity: 0.85,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formGroupHalf: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
    color: '#888',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    paddingVertical: 8,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  rolePicker: {
    marginBottom: 0,
    minHeight: 44,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  listItem: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'transparent',
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  textBody: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  buttonPrimary: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
    flexDirection: 'row',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInLink: {
    marginTop: 24,
    alignSelf: 'center',
  },
  textAccent: {
    fontWeight: '700',
    fontSize: 15,
  },
  textCaption: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
});

export default RegisterUser;


