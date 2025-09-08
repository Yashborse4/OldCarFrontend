import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

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
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  businessLicense: string;
  gstNumber: string;
  established: string;
  specializations: string[];
  businessHours: {
    weekdays: string;
    weekends: string;
  };
  description: string;
  website: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments: {
    businessLicense: boolean;
    gstCertificate: boolean;
    addressProof: boolean;
    ownerPhoto: boolean;
  };
  profileImage: string;
  showroomImages: string[];
}

const SPECIALIZATIONS = [
  'Luxury Cars',
  'SUVs',
  'Sedans',
  'Hatchbacks',
  'Electric Vehicles',
  'Commercial Vehicles',
  'Sports Cars',
  'Vintage Cars',
];

const DealerProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'verification'>('profile');

  const [profile, setProfile] = useState<DealerProfile>({
    id: '1',
    dealerName: 'Premium Auto Sales',
    showroomName: 'Premium Auto Hub',
    ownerName: 'Rajesh Kumar',
    email: 'rajesh@premiumauto.com',
    phone: '+91 9876543210',
    whatsapp: '+91 9876543210',
    address: 'Shop No. 15, Sector 18, Auto Market',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    businessLicense: 'BL123456789',
    gstNumber: '27ABCDE1234F1Z5',
    established: '2018',
    specializations: ['Luxury Cars', 'SUVs', 'Sedans'],
    businessHours: {
      weekdays: '9:00 AM - 8:00 PM',
      weekends: '10:00 AM - 6:00 PM',
    },
    description: 'We are a trusted dealer specializing in premium and luxury vehicles with over 5 years of experience in the automotive industry.',
    website: 'www.premiumauto.com',
    socialMedia: {
      facebook: 'PremiumAutoSales',
      instagram: 'premiumauto_mumbai',
      youtube: 'PremiumAutoChannel',
    },
    verificationStatus: 'verified',
    verificationDocuments: {
      businessLicense: true,
      gstCertificate: true,
      addressProof: true,
      ownerPhoto: true,
    },
    profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    showroomImages: [
      'https://images.pexels.com/photos/97075/pexels-photo-97075.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
  });

  const [tempProfile, setTempProfile] = useState<DealerProfile>(profile);

  const getVerificationStatus = () => {
    const status = profile.verificationStatus;
    switch (status) {
      case 'verified':
        return { color: '#4CAF50', icon: 'check-circle', text: 'Verified Dealer', bg: '#4CAF5015' };
      case 'pending':
        return { color: '#FF9800', icon: 'clock', text: 'Verification Pending', bg: '#FF980015' };
      case 'rejected':
        return { color: '#F44336', icon: 'close-circle', text: 'Verification Rejected', bg: '#F4433615' };
      default:
        return { color: '#757575', icon: 'help-circle', text: 'Not Verified', bg: '#75757515' };
    }
  };

  const getCompletionPercentage = () => {
    const fields = [
      profile.dealerName,
      profile.showroomName,
      profile.ownerName,
      profile.email,
      profile.phone,
      profile.address,
      profile.city,
      profile.businessLicense,
      profile.gstNumber,
      profile.description,
    ];
    const completed = fields.filter(field => field && field.trim() !== '').length;
    const docsCompleted = Object.values(profile.verificationDocuments).filter(Boolean).length;
    return Math.round(((completed + docsCompleted) / (fields.length + 4)) * 100);
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProfile(tempProfile);
      setEditMode(false);
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }, 1500);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setEditMode(false);
  };

  const toggleSpecialization = (specialization: string) => {
    const current = tempProfile.specializations;
    const updated = current.includes(specialization)
      ? current.filter(s => s !== specialization)
      : [...current, specialization];
    setTempProfile({ ...tempProfile, specializations: updated });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'business':
        return renderBusinessTab();
      case 'verification':
        return renderVerificationTab();
      default:
        return null;
    }
  };

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {/* Profile Image */}
      <View style={styles.profileImageSection}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: tempProfile.profileImage }} style={styles.profileImageLarge} />
          {editMode && (
            <TouchableOpacity
              style={[styles.editImageButton, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowImagePicker(true)}
            >
              <MaterialCommunityIcons name="camera" size={16} color="#111827" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.dealerNameLarge, { color: themeColors.text }]}>{tempProfile.dealerName}</Text>
        <Text style={[styles.ownerNameSubtitle, { color: themeColors.textSecondary }]}>
          Owner: {tempProfile.ownerName}
        </Text>
      </View>

      {/* Basic Information */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Basic Information</Text>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Dealer Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.dealerName}
            onChangeText={(text) => setTempProfile({ ...tempProfile, dealerName: text })}
            editable={editMode}
            placeholder="Enter dealer name"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Showroom Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.showroomName}
            onChangeText={(text) => setTempProfile({ ...tempProfile, showroomName: text })}
            editable={editMode}
            placeholder="Enter showroom name"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Owner Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.ownerName}
            onChangeText={(text) => setTempProfile({ ...tempProfile, ownerName: text })}
            editable={editMode}
            placeholder="Enter owner name"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.description}
            onChangeText={(text) => setTempProfile({ ...tempProfile, description: text })}
            editable={editMode}
            placeholder="Describe your dealership"
            placeholderTextColor={themeColors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Contact Information */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Contact Information</Text>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.email}
            onChangeText={(text) => setTempProfile({ ...tempProfile, email: text })}
            editable={editMode}
            placeholder="Enter email address"
            placeholderTextColor={themeColors.textSecondary}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Phone Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.phone}
            onChangeText={(text) => setTempProfile({ ...tempProfile, phone: text })}
            editable={editMode}
            placeholder="Enter phone number"
            placeholderTextColor={themeColors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>WhatsApp Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.whatsapp}
            onChangeText={(text) => setTempProfile({ ...tempProfile, whatsapp: text })}
            editable={editMode}
            placeholder="Enter WhatsApp number"
            placeholderTextColor={themeColors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Specializations */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Specializations</Text>
        <View style={styles.specializationsContainer}>
          {SPECIALIZATIONS.map((specialization) => (
            <TouchableOpacity
              key={specialization}
              style={[
                styles.specializationChip,
                { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                tempProfile.specializations.includes(specialization) && { backgroundColor: themeColors.primary },
              ]}
              onPress={() => editMode && toggleSpecialization(specialization)}
              disabled={!editMode}
            >
              <Text
                style={[
                  styles.specializationText,
                  { color: themeColors.text },
                  tempProfile.specializations.includes(specialization) && { color: '#111827' },
                ]}
              >
                {specialization}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderBusinessTab = () => (
    <View style={styles.tabContent}>
      {/* Business Details */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Business Details</Text>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Business License Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.businessLicense}
            onChangeText={(text) => setTempProfile({ ...tempProfile, businessLicense: text })}
            editable={editMode}
            placeholder="Enter business license number"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>GST Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.gstNumber}
            onChangeText={(text) => setTempProfile({ ...tempProfile, gstNumber: text })}
            editable={editMode}
            placeholder="Enter GST number"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Established Year</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.established}
            onChangeText={(text) => setTempProfile({ ...tempProfile, established: text })}
            editable={editMode}
            placeholder="Enter establishment year"
            placeholderTextColor={themeColors.textSecondary}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Address */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Address Information</Text>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.address}
            onChangeText={(text) => setTempProfile({ ...tempProfile, address: text })}
            editable={editMode}
            placeholder="Enter complete address"
            placeholderTextColor={themeColors.textSecondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.rowContainer}>
          <View style={styles.halfWidth}>
            <Text style={[styles.label, { color: themeColors.text }]}>City</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
              value={tempProfile.city}
              onChangeText={(text) => setTempProfile({ ...tempProfile, city: text })}
              editable={editMode}
              placeholder="City"
              placeholderTextColor={themeColors.textSecondary}
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={[styles.label, { color: themeColors.text }]}>State</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
              value={tempProfile.state}
              onChangeText={(text) => setTempProfile({ ...tempProfile, state: text })}
              editable={editMode}
              placeholder="State"
              placeholderTextColor={themeColors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>PIN Code</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.pincode}
            onChangeText={(text) => setTempProfile({ ...tempProfile, pincode: text })}
            editable={editMode}
            placeholder="Enter PIN code"
            placeholderTextColor={themeColors.textSecondary}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
      </View>

      {/* Business Hours */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Business Hours</Text>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Weekdays</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.businessHours.weekdays}
            onChangeText={(text) => setTempProfile({ 
              ...tempProfile, 
              businessHours: { ...tempProfile.businessHours, weekdays: text }
            })}
            editable={editMode}
            placeholder="e.g., 9:00 AM - 8:00 PM"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Weekends</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.businessHours.weekends}
            onChangeText={(text) => setTempProfile({ 
              ...tempProfile, 
              businessHours: { ...tempProfile.businessHours, weekends: text }
            })}
            editable={editMode}
            placeholder="e.g., 10:00 AM - 6:00 PM"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>
      </View>

      {/* Online Presence */}
      <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Online Presence</Text>
        
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Website</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.website}
            onChangeText={(text) => setTempProfile({ ...tempProfile, website: text })}
            editable={editMode}
            placeholder="Enter website URL"
            placeholderTextColor={themeColors.textSecondary}
            keyboardType="url"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Facebook Page</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.socialMedia.facebook}
            onChangeText={(text) => setTempProfile({ 
              ...tempProfile, 
              socialMedia: { ...tempProfile.socialMedia, facebook: text }
            })}
            editable={editMode}
            placeholder="Facebook page name"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: themeColors.text }]}>Instagram Handle</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
            value={tempProfile.socialMedia.instagram}
            onChangeText={(text) => setTempProfile({ 
              ...tempProfile, 
              socialMedia: { ...tempProfile.socialMedia, instagram: text }
            })}
            editable={editMode}
            placeholder="Instagram username"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>
      </View>
    </View>
  );

  const renderVerificationTab = () => {
    const verification = getVerificationStatus();
    const completionPercentage = getCompletionPercentage();

    return (
      <View style={styles.tabContent}>
        {/* Verification Status */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <View style={styles.verificationHeader}>
            <View style={[styles.verificationBadge, { backgroundColor: verification.bg }]}>
              <MaterialCommunityIcons name={verification.icon as any} size={24} color={verification.color} />
            </View>
            <View style={styles.verificationInfo}>
              <Text style={[styles.verificationTitle, { color: themeColors.text }]}>{verification.text}</Text>
              <Text style={[styles.verificationSubtitle, { color: themeColors.textSecondary }]}>
                Profile Completion: {completionPercentage}%
              </Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={[styles.progressBar, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' }]}>
            <View 
              style={[
                styles.progressFill, 
                { backgroundColor: themeColors.primary, width: `${completionPercentage}%` }
              ]} 
            />
          </View>
        </View>

        {/* Document Verification */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Document Verification</Text>
          
          {Object.entries(profile.verificationDocuments).map(([key, uploaded]) => {
            const docNames = {
              businessLicense: 'Business License',
              gstCertificate: 'GST Certificate',
              addressProof: 'Address Proof',
              ownerPhoto: 'Owner Photo',
            };

            return (
              <TouchableOpacity
                key={key}
                style={[styles.documentItem, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' }]}
                onPress={() => {
                  Alert.alert(
                    uploaded ? 'Document Uploaded' : 'Upload Document',
                    uploaded ? 'This document has been uploaded and is under review.' : 'Please upload this document for verification.'
                  );
                }}
              >
                <View style={styles.documentInfo}>
                  <MaterialCommunityIcons 
                    name={uploaded ? 'check-circle' : 'file-upload'} 
                    size={20} 
                    color={uploaded ? '#4CAF50' : themeColors.textSecondary} 
                  />
                  <Text style={[styles.documentName, { color: themeColors.text }]}>
                    {docNames[key as keyof typeof docNames]}
                  </Text>
                </View>
                <Text style={[
                  styles.documentStatus, 
                  { color: uploaded ? '#4CAF50' : themeColors.textSecondary }
                ]}>
                  {uploaded ? 'Uploaded' : 'Required'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Verification Benefits */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Verification Benefits</Text>
          
          {[
            { icon: 'shield-check', text: 'Verified dealer badge on all listings' },
            { icon: 'trending-up', text: 'Higher visibility in search results' },
            { icon: 'handshake', text: 'Increased buyer trust and confidence' },
            { icon: 'star', text: 'Access to premium dealer features' },
          ].map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <MaterialCommunityIcons name={benefit.icon as any} size={16} color={themeColors.primary} />
              <Text style={[styles.benefitText, { color: themeColors.text }]}>{benefit.text}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const verification = getVerificationStatus();
  const completionPercentage = getCompletionPercentage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrow-left" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Dealer Profile</Text>
        <TouchableOpacity
          onPress={() => editMode ? handleSave() : setEditMode(true)}
          disabled={loading}
        >
          <MaterialCommunityIcons
            name={editMode ? 'check' : 'pencil'}
            size={24}
            color={loading ? themeColors.textSecondary : themeColors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: themeColors.surface }]}>
        {[
          { key: 'profile', label: 'Profile', icon: 'account' },
          { key: 'business', label: 'Business', icon: 'office-building' },
          { key: 'verification', label: 'Verification', icon: 'shield-check' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && [styles.activeTab, { borderBottomColor: themeColors.primary }],
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? themeColors.primary : themeColors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? themeColors.primary : themeColors.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderTabContent()}
        </ScrollView>

        {/* Action Buttons */}
        {editMode && (
          <View style={[styles.actionButtons, { backgroundColor: themeColors.surface }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelButtonText, { color: themeColors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: themeColors.primary }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealerNameLarge: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  ownerNameSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specializationChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  specializationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  verificationBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  verificationInfo: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  verificationSubtitle: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  documentStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});

export default DealerProfileScreen;


