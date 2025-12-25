import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors } from '../../design-system';

interface Props {
  navigation: any;
}

interface DealerProfile {
  id: string;
  dealerName: string;
  showroomName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  profileImage: string;
  totalListings: number;
  activeListings: number;
  soldThisMonth: number;
}


const DealerProfileScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const colors = {
    success: '#48BB78',
    warning: '#ED8936',
    error: '#F56565',
    textSecondary: '#4A5568',
    text: '#1A202C',
    primary: '#FFD700',
    background: '#FAFBFC',
    border: '#E2E8F0',
  };
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<DealerProfile>({
    id: '1',
    dealerName: 'Premium Auto Sales',
    showroomName: 'Premium Auto Hub',
    ownerName: 'Rajesh Kumar',
    email: 'rajesh@premiumauto.com',
    phone: '+91 9876543210',
    address: 'Shop No. 15, Sector 18, Auto Market',
    city: 'Mumbai',
    verificationStatus: 'verified',
    profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    totalListings: 47,
    activeListings: 42,
    soldThisMonth: 23,
  });

  const [tempProfile, setTempProfile] = useState<DealerProfile>(profile);

  const getVerificationIcon = () => {
    switch (profile.verificationStatus) {
      case 'verified':
        return <Ionicons name="checkmark-circle" size={20} color={colors.success} />;
      case 'pending':
        return <Ionicons name="time" size={20} color={colors.warning} />;
      case 'rejected':
        return <Ionicons name="alert-circle" size={20} color={colors.error} />;
      default:
        return <Ionicons name="help-circle" size={20} color={colors.textSecondary} />;
    }
  };

  const getVerificationText = () => {
    switch (profile.verificationStatus) {
      case 'verified': return 'Verified Dealer';
      case 'pending': return 'Verification Pending';
      case 'rejected': return 'Verification Rejected';
      default: return 'Not Verified';
    }
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setProfile(tempProfile);
      setEditMode(false);
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }, 1000);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setEditMode(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dealer Profile</Text>
          <TouchableOpacity
            onPress={() => editMode ? handleSave() : setEditMode(true)}
            disabled={loading}
          >
            <Ionicons
              name={editMode ? 'check' : 'edit'}
              size={24}
              color={loading ? colors.textSecondary : colors.primary }
            />
          </TouchableOpacity>
        </View>
      </Card>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.dealerName}>{profile.dealerName}</Text>
                {getVerificationIcon()}
              </View>
              <Text style={styles.ownerName}>{profile.ownerName}</Text>
              <Text style={styles.verificationText}>{getVerificationText()}</Text>
            </View>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{profile.totalListings}</Text>
            <Text style={styles.statLabel}>Total Listings</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{profile.activeListings}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{profile.soldThisMonth}</Text>
            <Text style={styles.statLabel}>Sold This Month</Text>
          </Card>
        </View>

        {/* Profile Information */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Dealer Name</Text>
            <TextInput
              style={styles.input}
              value={tempProfile.dealerName}
              onChangeText={(text) => setTempProfile({ ...tempProfile, dealerName: text })}
              editable={editMode}
              placeholder="Enter dealer name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Showroom Name</Text>
            <TextInput
              style={styles.input}
              value={tempProfile.showroomName}
              onChangeText={(text) => setTempProfile({ ...tempProfile, showroomName: text })}
              editable={editMode}
              placeholder="Enter showroom name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Owner Name</Text>
            <TextInput
              style={styles.input}
              value={tempProfile.ownerName}
              onChangeText={(text) => setTempProfile({ ...tempProfile, ownerName: text })}
              editable={editMode}
              placeholder="Enter owner name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={tempProfile.email}
              onChangeText={(text) => setTempProfile({ ...tempProfile, email: text })}
              editable={editMode}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={tempProfile.phone}
              onChangeText={(text) => setTempProfile({ ...tempProfile, phone: text })}
              editable={editMode}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={tempProfile.address}
              onChangeText={(text) => setTempProfile({ ...tempProfile, address: text })}
              editable={editMode}
              placeholder="Enter complete address"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={tempProfile.city}
              onChangeText={(text) => setTempProfile({ ...tempProfile, city: text })}
              editable={editMode}
              placeholder="Enter city"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </Card>

        {/* Action Buttons */}
        {editMode && (
          <View style={styles.actionContainer}>
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title={loading ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              disabled={loading}
              style={styles.saveButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC'
  },
  headerCard: {
    marginHorizontal: 0,
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C'
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileCard: {
    marginTop: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dealerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
          marginRight: 8,
  },
  ownerName: {
    fontSize: 16,
    color: colors.textSecondary,
          marginBottom: 4,
  },
  verificationText: {
    fontSize: 14,
    color: colors.textSecondary
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
          marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
          textAlign: 'center',
  },
  infoCard: {
    marginTop: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
          marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
          marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
          borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
          backgroundColor: colors.background
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 30,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default DealerProfileScreen;

