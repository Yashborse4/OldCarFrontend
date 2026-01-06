import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/ApiClient';
import {
  scaleSize,
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveBorderRadius,
} from '../../utils/responsiveEnhanced';

interface Props {
  navigation: any;
}

interface ProfileData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  dealerName: string;
  showroomName: string;
  address: string;
  city: string;
  dealerStatus: string;
  profileImageUrl: string;
}

const DealerProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { user, refreshUserData } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    location: '',
    dealerName: '',
    showroomName: '',
    address: '',
    city: '',
    dealerStatus: '',
    profileImageUrl: '',
  });

  const [tempProfile, setTempProfile] = useState<ProfileData>(profile);

  // Load profile data
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/user/profile');
      const data = response.data as any;

      const profileData: ProfileData = {
        username: data.username || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        location: data.location || '',
        dealerName: data.dealerName || '',
        showroomName: data.showroomName || '',
        address: data.address || '',
        city: data.city || '',
        dealerStatus: data.dealerStatus || 'UNVERIFIED',
        profileImageUrl: data.profileImageUrl || '',
      };

      setProfile(profileData);
      setTempProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const getVerificationIcon = () => {
    switch (profile.dealerStatus) {
      case 'VERIFIED':
        return <Ionicons name="shield-checkmark" size={20} color="#10B981" />;
      case 'UNVERIFIED':
        return <Ionicons name="time-outline" size={20} color="#F59E0B" />;
      case 'SUSPENDED':
      case 'REJECTED':
        return <Ionicons name="alert-circle" size={20} color="#EF4444" />;
      default:
        return <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />;
    }
  };

  const getVerificationText = () => {
    switch (profile.dealerStatus) {
      case 'VERIFIED': return 'Verified Dealer';
      case 'UNVERIFIED': return 'Verification Pending';
      case 'SUSPENDED': return 'Account Suspended';
      case 'REJECTED': return 'Verification Rejected';
      default: return 'Not Verified';
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData = {
        username: tempProfile.username,
        firstName: tempProfile.firstName,
        lastName: tempProfile.lastName,
        location: tempProfile.location,
        dealerName: tempProfile.dealerName,
        showroomName: tempProfile.showroomName,
        address: tempProfile.address,
        city: tempProfile.city,
      };

      await apiClient.put('/api/user/profile', updateData);

      setProfile(tempProfile);
      setEditMode(false);
      await refreshUserData?.();
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setEditMode(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Dealer Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editMode ? handleSave() : setEditMode(true)}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons
              name={editMode ? 'checkmark' : 'create-outline'}
              size={24}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileHeader, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            {profile.profileImageUrl ? (
              <Image source={{ uri: profile.profileImageUrl }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarText}>
                {profile.dealerName?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'D'}
              </Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.dealerName, { color: colors.text }]}>
                {profile.dealerName || profile.username}
              </Text>
              {getVerificationIcon()}
            </View>
            <Text style={[styles.showroomName, { color: colors.textSecondary }]}>
              {profile.showroomName || 'No showroom name set'}
            </Text>
            <Text style={[styles.verificationText, { color: colors.textSecondary }]}>
              {getVerificationText()}
            </Text>
            {(profile.city || profile.location || profile.address) && (
              <View style={styles.shopLocationRow}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text
                  style={[styles.shopLocationText, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {profile.showroomName
                    ? `${profile.showroomName} • ${profile.city || profile.location}`
                    : profile.address || profile.city || profile.location}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Editable Fields Section */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            You can edit these fields
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Username</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: isDark ? colors.background : '#F3F4F6', color: colors.text, borderColor: colors.border }
              ]}
              value={tempProfile.username}
              onChangeText={(text) => setTempProfile({ ...tempProfile, username: text })}
              editable={editMode}
              placeholder="Enter username"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Dealer Name</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: isDark ? colors.background : '#F3F4F6', color: colors.text, borderColor: colors.border }
              ]}
              value={tempProfile.dealerName}
              onChangeText={(text) => setTempProfile({ ...tempProfile, dealerName: text })}
              editable={editMode}
              placeholder="Enter dealer name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Showroom Name</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: isDark ? colors.background : '#F3F4F6', color: colors.text, borderColor: colors.border }
              ]}
              value={tempProfile.showroomName}
              onChangeText={(text) => setTempProfile({ ...tempProfile, showroomName: text })}
              editable={editMode}
              placeholder="Enter showroom name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isDark ? colors.background : '#F3F4F6', color: colors.text, borderColor: colors.border }
                ]}
                value={tempProfile.firstName}
                onChangeText={(text) => setTempProfile({ ...tempProfile, firstName: text })}
                editable={editMode}
                placeholder="First name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: getResponsiveSpacing('sm') }]}>
              <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isDark ? colors.background : '#F3F4F6', color: colors.text, borderColor: colors.border }
                ]}
                value={tempProfile.lastName}
                onChangeText={(text) => setTempProfile({ ...tempProfile, lastName: text })}
                editable={editMode}
                placeholder="Last name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Address</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: isDark ? colors.background : '#F3F4F6', color: colors.text, borderColor: colors.border }
              ]}
              value={tempProfile.address}
              onChangeText={(text) => setTempProfile({ ...tempProfile, address: text })}
              editable={editMode}
              placeholder="Enter address"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.text }]}>City</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isDark ? colors.background : '#F3F4F6', color: colors.text, borderColor: colors.border }
                ]}
                value={tempProfile.city}
                onChangeText={(text) => setTempProfile({ ...tempProfile, city: text })}
                editable={editMode}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: getResponsiveSpacing('sm') }]}>
              <Text style={[styles.label, { color: colors.text }]}>Location</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isDark ? colors.background : '#F3F4F6', color: colors.text, borderColor: colors.border }
                ]}
                value={tempProfile.location}
                onChangeText={(text) => setTempProfile({ ...tempProfile, location: text })}
                editable={editMode}
                placeholder="Location"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Non-Editable Fields Section */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Information</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            These fields cannot be changed
          </Text>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
            </View>
            <TextInput
              style={[
                styles.input,
                styles.disabledInput,
                { backgroundColor: isDark ? colors.background : '#E5E7EB', color: colors.textSecondary, borderColor: colors.border }
              ]}
              value={profile.email}
              editable={false}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
              <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
            </View>
            <TextInput
              style={[
                styles.input,
                styles.disabledInput,
                { backgroundColor: isDark ? colors.background : '#E5E7EB', color: colors.textSecondary, borderColor: colors.border }
              ]}
              value={profile.phoneNumber || 'Not set'}
              editable={false}
            />
          </View>
        </View>

        {/* Action Buttons */}
        {editMode && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Spacer */}
        <View style={{ height: getResponsiveSpacing('xxl') }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: getResponsiveSpacing('md'),
    fontSize: getResponsiveTypography('sm'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderBottomWidth: 1,
  },
  backButton: {
    padding: scaleSize(4),
  },
  headerTitle: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '700',
  },
  editButton: {
    padding: scaleSize(4),
  },
  content: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSpacing('lg'),
    marginTop: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('xl'),
  },
  avatarContainer: {
    width: scaleSize(80),
    height: scaleSize(80),
    borderRadius: getResponsiveBorderRadius('full'),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: getResponsiveTypography('xxl'),
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: getResponsiveSpacing('md'),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(8),
  },
  dealerName: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '700',
  },
  showroomName: {
    fontSize: getResponsiveTypography('sm'),
    marginTop: scaleSize(2),
  },
  verificationText: {
    fontSize: getResponsiveTypography('xs'),
    marginTop: scaleSize(4),
  },
  shopLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaleSize(6),
  },
  shopLocationText: {
    marginLeft: scaleSize(4),
    fontSize: getResponsiveTypography('xs'),
  },
  section: {
    marginTop: getResponsiveSpacing('md'),
    padding: getResponsiveSpacing('lg'),
    borderRadius: getResponsiveBorderRadius('xl'),
  },
  sectionTitle: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '700',
    marginBottom: scaleSize(4),
  },
  sectionSubtitle: {
    fontSize: getResponsiveTypography('xs'),
    marginBottom: getResponsiveSpacing('md'),
  },
  formGroup: {
    marginBottom: getResponsiveSpacing('md'),
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
    marginBottom: scaleSize(6),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scaleSize(6),
  },
  input: {
    borderWidth: 1,
    borderRadius: getResponsiveBorderRadius('lg'),
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    fontSize: getResponsiveTypography('md'),
  },
  textArea: {
    height: scaleSize(80),
    textAlignVertical: 'top',
    paddingTop: getResponsiveSpacing('sm'),
  },
  disabledInput: {
    opacity: 0.7,
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('md'),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: getResponsiveTypography('md'),
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: getResponsiveTypography('md'),
    fontWeight: '600',
  },
});

export default DealerProfileScreen;
