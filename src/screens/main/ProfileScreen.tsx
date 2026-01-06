import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { apiClient, ApiSuccessResponse } from '../../services/ApiClient';
import { useAuth } from '../../context/AuthContext';
import {
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveBorderRadius,
  scaleSize,
  wp,
} from '../../utils/responsiveEnhanced';
import {
  useStaggerAnimation,
  AnimatedPressable,
  hapticFeedback,
} from '../../components/ui/MicroInteractionsModern';

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { user, logout } = useAuth();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  // Staggered animation for entry
  const animValues = useStaggerAnimation(new Array(4).fill(0), 100);
  // 0: Header/Avatar, 1: Personal Info, 2: Account Info, 3: Logout/Footer

  useEffect(() => {
    let isMounted = true;
    const fetchProfileImage = async () => {
      if (!user) return;
      try {
        if (isMounted) setLoadingImage(true);
        // Try getting from cache first
        const cachedImage = await AsyncStorage.getItem('profile_image_url');
        if (cachedImage && isMounted) setProfileImageUrl(cachedImage);

        const response = await apiClient.get<ApiSuccessResponse<{
          profileImageUrl: string | null;
          [key: string]: any;
        }>>('/user/profile');

        if (!isMounted) return;

        if (response.data?.data?.profileImageUrl) {
          let fullImageUrl = response.data.data.profileImageUrl;
          if (!fullImageUrl.startsWith('http')) {
            const apiBaseUrl = apiClient.getBaseUrl();
            const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
            const path = fullImageUrl.startsWith('/') ? fullImageUrl : `/${fullImageUrl}`;
            fullImageUrl = `${baseUrl}${path}`;
          }
          setProfileImageUrl(fullImageUrl);
          await AsyncStorage.setItem('profile_image_url', fullImageUrl);
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      } finally {
        if (isMounted) setLoadingImage(false);
      }
    };
    fetchProfileImage();
    return () => { isMounted = false; };
  }, [user]);

  const handleComingSoon = useCallback((feature: string) => {
    hapticFeedback.light();
    Alert.alert('Coming Soon', `${feature} is under development.`);
  }, []);

  const handleLogout = useCallback(() => {
    hapticFeedback.medium();
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
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
  }, [logout, navigation]);

  // Reusable Info Row Component
  const InfoRow = ({ icon, label, value, isLast = false }: { icon: string, label: string, value: string, isLast?: boolean }) => (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
      <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }]}>
        <Ionicons name={icon as any} size={scaleSize(20)} color={colors.text} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  // Reusable Section Card
  const SectionCard = ({ title, children, showEdit = false, onEdit, animIndex }: any) => (
    <Animated.View style={[
      styles.card,
      {
        backgroundColor: isDark ? colors.surface : '#FFFFFF',
        opacity: animValues[animIndex],
        transform: [{ translateY: animValues[animIndex].interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }]
      }
    ]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        {showEdit && (
          <TouchableOpacity onPress={onEdit}>
            <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#F2F2F7' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      {/* Header & Avatar */}
      <Animated.View style={[
        styles.headerContainer,
        {
          opacity: animValues[0],
          transform: [{ translateY: animValues[0].interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
        }
      ]}>
        <SafeAreaView edges={['top']} style={{ alignItems: 'center', width: '100%' }}>
          <View style={styles.navBar}>
             {/* Use transparent/dummy text to center the title if back button exists, or just absolute center */}
             <Text style={[styles.screenTitle, { color: colors.text }]}>Profile</Text>
          </View>

          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarContainer, { borderColor: colors.surface }]}>
              {profileImageUrl ? (
                <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#333' : '#E0E0E0' }]}>
                   <Ionicons name="person" size={scaleSize(50)} color={colors.textSecondary} />
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.editBadge, { backgroundColor: colors.surface, borderColor: isDark ? '#000' : '#FFF' }]}
              onPress={() => handleComingSoon('Edit Profile Picture')}
            >
              <Ionicons name="pencil" size={scaleSize(14)} color={colors.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Info Card */}
        <SectionCard 
          title="Personal info" 
          showEdit 
          onEdit={() => handleComingSoon('Edit Personal Info')}
          animIndex={1}
        >
          <InfoRow 
            icon="person-outline" 
            label="Name" 
            value={user?.username || 'Guest User'} 
          />
          <InfoRow 
            icon="mail-outline" 
            label="E-mail" 
            value={user?.email || 'No email connected'} 
          />
          <InfoRow 
            icon="call-outline" 
            label="Phone number" 
            value={user?.phoneNumber || '+1 234 567 8900'} 
          />
           <InfoRow 
            icon="home-outline" 
            label="Home address" 
            value={user?.location || 'Not set'} 
            isLast
          />
        </SectionCard>

        {/* Account Info Card */}
        <SectionCard 
          title="Account info" 
          animIndex={2}
        >
           <TouchableOpacity onPress={() => navigation.navigate('MyGarage')} style={styles.menuItem}>
              <InfoRow icon="car-sport-outline" label="My Garage" value="View your vehicles" />
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{position:'absolute', right: 0}} />
           </TouchableOpacity>
           
           <TouchableOpacity onPress={() => handleComingSoon('Settings')} style={styles.menuItem}>
              <InfoRow icon="settings-outline" label="Settings" value="App preferences" isLast />
               <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{position:'absolute', right: 0}} />
           </TouchableOpacity>
        </SectionCard>

        {/* Logout Button */}
        <Animated.View style={{ 
          marginTop: 20, 
          paddingHorizontal: getResponsiveSpacing('lg'),
          opacity: animValues[3],
          transform: [{ translateY: animValues[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
        }}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            rounded="full"
            icon="log-out-outline"
          />
        </Animated.View>
        
        <View style={{ height: 100 }} /> 
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    zIndex: 1,
  },
  navBar: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '700',
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: 10,
  },
  avatarContainer: {
    width: scaleSize(120),
    height: scaleSize(120),
    borderRadius: scaleSize(60),
    padding: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Ensure image stays round
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: scaleSize(18),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 3,
  },
  scrollContent: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingTop: 10,
  },
  card: {
    borderRadius: 32, // Highly rounded as per design
    padding: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '800',
  },
  editButtonText: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: scaleSize(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: getResponsiveTypography('xs'),
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: getResponsiveTypography('md'),
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});

export default ProfileScreen;
