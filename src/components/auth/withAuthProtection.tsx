import React, { ComponentType, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface WithAuthProtectionOptions {
  requireEmailVerification?: boolean;
  redirectTo?: keyof RootStackParamList;
}

export function withAuthProtection<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthProtectionOptions = {}
) {
  const { requireEmailVerification = true, redirectTo = 'Login' } = options;

  return function ProtectedComponent(props: P) {
    const { isAuthenticated, user, isLoading } = useAuth();
    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          // Not authenticated, redirect to login
          navigation.replace(redirectTo);
        } else if (requireEmailVerification && user && !user.emailVerified) {
          // Authenticated but email not verified, redirect to email verification
          navigation.replace('EmailVerificationScreen', { email: user.email });
        }
      }
    }, [isAuthenticated, user, isLoading, navigation, requireEmailVerification, redirectTo]);

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    // Don't render the protected component if not authenticated or email not verified
    if (!isAuthenticated) {
      return null;
    }

    if (requireEmailVerification && user && !user.emailVerified) {
      return null;
    }

    // All checks passed, render the protected component
    return <WrappedComponent {...props} />;
  };
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default withAuthProtection;