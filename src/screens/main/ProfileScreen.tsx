import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme/ThemeContext';
import { apiClient, ApiSuccessResponse } from '../../services/ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { user, logout } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  // Fetch profile image with caching
  // Fetch profile image with caching
  useEffect(() => {
    let isMounted = true;

    const fetchProfileImage = async () => {
      if (!user) return;

      try {
        if (isMounted) setLoadingImage(true);

        // Fetch user profile to get the image URL
        const response = await apiClient.get<ApiSuccessResponse<{
          profileImageUrl: string | null;
          [key: string]: any;
        }>>('/user/profile');

        if (!isMounted) return;

        if (response.data?.data?.profileImageUrl) {
          let fullImageUrl = response.data.data.profileImageUrl;

          // If URL is relative, prepend the base URL
          if (!fullImageUrl.startsWith('http')) {
            const apiBaseUrl = apiClient.getBaseUrl();
            const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
            const path = fullImageUrl.startsWith('/') ? fullImageUrl : `/${fullImageUrl}`;
            fullImageUrl = `${baseUrl}${path}`;
          }

          console.log('Profile image URL resolved:', fullImageUrl);
          setProfileImageUrl(fullImageUrl);
          await AsyncStorage.setItem('profile_image_url', fullImageUrl);
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
        // Keep cached image if API fails
        const cachedImage = await AsyncStorage.getItem('profile_image_url');
        if (isMounted && cachedImage) {
          setProfileImageUrl(cachedImage);
        }
      } finally {
        if (isMounted) setLoadingImage(false);
      }
    };

    fetchProfileImage();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleComingSoon = (feature: string) => {
    Alert.alert('Coming Soon', `${feature} feature is under development.`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? ',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear cached profile data
              await AsyncStorage.removeItem('profile_image_url');
              await logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile Section */}
      <Card style={styles.profileCard}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person-circle" size={80} color={colors.primary} />
            )}
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.name || user?.username || 'Guest User'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email || 'No email connected'}
          </Text>
          <Text style={[styles.userRole, { color: colors.textSecondary }]}>
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Guest'}
          </Text>
        </View>
      </Card>

      {/* Settings */}
      <View style={styles.settingsContainer}>
        {/* Menu Items */}
        <Card style={styles.settingCard} onPress={() => handleComingSoon('My Listings')}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="list" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>My Listings</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </View>
        </Card>

        <Card style={styles.settingCard} onPress={() => handleComingSoon('Saved Cars')}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="heart-outline" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Saved Cars</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </View>
        </Card>

        <Card style={styles.settingCard} onPress={() => handleComingSoon('Notifications')}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </View>
        </Card>

        <Card style={styles.settingCard} onPress={() => navigation.navigate('Settings')}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="settings" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </View>
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          icon="logout"
          fullWidth
          style={styles.logoutButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
  },
  settingsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  settingCard: {
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 24,
  },
});

export default ProfileScreen;

 
