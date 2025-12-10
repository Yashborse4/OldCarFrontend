import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gradient } from '../../components/ui/Gradient';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useAuth } from '../../context/AuthContext';
import { validateRegistrationForm } from '../../utils/validation';
import { useTheme } from '../../theme/ThemeContext';
import { getRoleName } from '../../utils/permissions';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

import { RegisterScreenNavigationProp } from '../../navigation/types';

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterUser: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { register, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [isLoading, setIsLoading] = useState(false);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRegister = async () => {
    // Clear previous errors
    setError(null);

    // Basic validation
    if (!email || !password) {
      Alert.alert(
        'Required Fields',
        'Please enter your email and password'
      );
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address'
      );
      return;
    }

    // Password length validation
    if (password.length < 6) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters'
      );
      return;
    }

    setIsLoading(true);
    try {
      // Use email as username
      await register({
        username: email,
        email,
        password,
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradientHeader: {
      paddingBottom: 25,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
    },
    headerSafe: {
      paddingHorizontal: 20,
    },
    header: {
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 5,
    },
    iconContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 6,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      fontWeight: '500',
      paddingHorizontal: 20,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 50,
    },
    formCard: {
      marginTop: -30,
      marginHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: isDark ? colors.border : 'rgba(99, 102, 241, 0.1)',
    },
    formCardInner: {
      padding: 28,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: isDark ? colors.border : '#E5E7EB',
      marginVertical: 24,
      marginHorizontal: -8,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: 16,
    },
    sectionIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: isDark ? `${colors.primary}20` : `${colors.primary}10`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.3,
    },
    inputSection: {
      marginBottom: 15,

    },
    row: {
      flexDirection: 'row',
      gap: 14,
      marginBottom: 18,
    },
    halfWidth: {
      flex: 1,
    },
    halfInput: {
      marginBottom: 0,
    },
    rolePicker: {
      marginBottom: 0,
    },
    roleLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
      letterSpacing: 0.3,
    },
    roleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 2,
      borderColor: isDark ? colors.border : '#E5E7EB',
      backgroundColor: isDark ? colors.surfaceVariant : '#FAFBFC',
      paddingHorizontal: 18,
      paddingVertical: 16,
      minHeight: 60,
    },
    roleIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: isDark
        ? `${colors.primary}25`
        : `${colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    roleText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    registerButton: {
      marginTop: 32,
      marginBottom: 24,
      borderRadius: 16,
      height: 58,
    },
    signInLink: {
      alignSelf: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    signInText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
      textAlign: 'center',
    },
    signInAccent: {
      fontWeight: '700',
      color: colors.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'flex-end',
      padding: 0,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingBottom: Platform.OS === 'ios' ? 38 : 28,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 28,
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border : '#F3F4F6',
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 0.3,
    },
    modalClose: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? colors.surfaceVariant : '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 28,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.border : '#F3F4F6',
      backgroundColor: colors.surface,
    },
    modalOptionSelected: {
      backgroundColor: isDark
        ? `${colors.primary}18`
        : `${colors.primary}10`,
      borderLeftWidth: 5,
      borderLeftColor: colors.primary,
    },
    modalOptionLast: {
      borderBottomWidth: 0,
    },
    modalOptionIcon: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: isDark ? colors.surfaceVariant : '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 18,
    },
    modalOptionIconSelected: {
      backgroundColor: isDark
        ? `${colors.primary}30`
        : `${colors.primary}20`,
    },
    modalOptionContent: {
      flex: 1,
    },
    modalOptionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 5,
      letterSpacing: 0.2,
    },
    modalOptionSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
  });

  return (
    <>
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Gradient
          colors={isDark
            ? [colors.primary, '#3730A3']
            : [colors.primary, '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <SafeAreaView edges={['top']} style={styles.headerSafe}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join in seconds - it's quick and easy!</Text>
            </View>
          </SafeAreaView>
        </Gradient>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formCard}>
              <View style={styles.formCardInner}>

                {/* Quick Sign Up */}
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <MaterialIcons name="rocket-launch" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Quick Sign Up</Text>
                </View>

                <View style={styles.inputSection}>
                  <Input
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    leftIcon="email"
                    placeholder="your.email@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    required
                  />
                </View>



                <View style={styles.inputSection}>
                  <TouchableOpacity
                    style={styles.rolePicker}
                    onPress={() => setPickerVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.roleLabel}>I want to *</Text>
                    <View style={styles.roleButton}>
                      <View style={styles.roleIconContainer}>
                        <MaterialIcons name="group" size={24} color={colors.primary} />
                      </View>
                      <Text style={styles.roleText}>{getRoleName(role)}</Text>
                      <MaterialIcons name="keyboard-arrow-down" size={26} color={colors.textSecondary} />
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputSection}>
                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    leftIcon="lock"
                    placeholder="Create a password (min 6 characters)"
                    secureTextEntry
                    returnKeyType="done"
                    required
                  />
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
                  activeOpacity={0.7}
                >
                  <Text style={styles.signInText}>
                    Already have an account?{' '}
                    <Text style={styles.signInAccent}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <Modal
        animationType="slide"
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Role</Text>
              <TouchableOpacity
                onPress={() => setPickerVisible(false)}
                style={styles.modalClose}
              >
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.modalOption,
                role === 'VIEWER' && styles.modalOptionSelected
              ]}
              onPress={() => {
                setRole('VIEWER');
                setPickerVisible(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.modalOptionIcon,
                role === 'VIEWER' && styles.modalOptionIconSelected
              ]}>
                <MaterialIcons
                  name="person"
                  size={24}
                  color={role === 'VIEWER' ? colors.primary : colors.textSecondary}
                />
              </View>
              <View style={styles.modalOptionContent}>
                <Text style={styles.modalOptionTitle}>Normal User</Text>
                <Text style={styles.modalOptionSubtitle}>Browse, buy and sell cars</Text>
              </View>
              {role === 'VIEWER' && (
                <MaterialIcons name="check-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>



            <TouchableOpacity
              style={[
                styles.modalOption,
                styles.modalOptionLast,
                role === 'DEALER' && styles.modalOptionSelected
              ]}
              onPress={() => {
                setRole('DEALER');
                setPickerVisible(false);
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.modalOptionIcon,
                role === 'DEALER' && styles.modalOptionIconSelected
              ]}>
                <MaterialIcons
                  name="business"
                  size={24}
                  color={role === 'DEALER' ? colors.primary : colors.textSecondary}
                />
              </View>
              <View style={styles.modalOptionContent}>
                <Text style={styles.modalOptionTitle}>Dealer</Text>
                <Text style={styles.modalOptionSubtitle}>Professional car dealer</Text>
              </View>
              {role === 'DEALER' && (
                <MaterialIcons name="check-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>);
};


export default RegisterUser;

