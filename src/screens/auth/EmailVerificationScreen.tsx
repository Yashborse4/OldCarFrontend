import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

interface Props {
  navigation: any;
}

const EmailVerificationScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { user, refreshUserData, logout } = useAuth();

  const handleRefresh = async () => {
    await refreshUserData();
    if (user && user.emailVerified) {
      navigation.replace('Dashboard');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'} />
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="mail-open-outline" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Verify your email</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We have sent a verification link to {user?.email}.
          Please verify your email to continue using the app.
        </Text>

        <Button
          title="I've verified my email"
          onPress={handleRefresh}
          style={styles.primaryButton}
        />

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Profile')}>
          <Text style={[styles.secondaryText, { color: colors.primary }]}>Change email address</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={[styles.logoutText, { color: colors.textSecondary }]}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  primaryButton: {
    width: '100%',
    marginBottom: 16,
  },
  secondaryButton: {
    marginBottom: 24,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 14,
  },
});

export default EmailVerificationScreen;
