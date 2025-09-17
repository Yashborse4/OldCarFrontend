import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const { isDark, toggleTheme, colors } = useTheme();

  const handleComingSoon = (feature: string) => {
    Alert.alert('Coming Soon', `${feature} feature is under development.`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="default" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile Section */}
      <Card style={styles.profileCard}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="account-circle" size={80} color={colors.primary} />
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>
          <Text style={styles.userRole}>Car Enthusiast</Text>
        </View>
      </Card>

      {/* Settings */}
      <View style={styles.settingsContainer}>
        {/* Theme Toggle */}
        <Card style={styles.settingCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons 
                name={isDark ? "dark-mode" : "light-mode"} 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.settingLabel}>
                {isDark ? "Dark Mode" : "Light Mode"}
              </Text>
            </View>
            <Switch 
              value={isDark} 
              onValueChange={toggleTheme} 
              trackColor={{ false: '#E2E8F0', true: colors.primary }} 
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Menu Items */}
        <Card style={styles.settingCard} onPress={() => handleComingSoon('My Listings')}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="list-alt" size={24} color={colors.primary} />
              <Text style={styles.settingLabel}>My Listings</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
          </View>
        </Card>

        <Card style={styles.settingCard} onPress={() => handleComingSoon('Saved Cars')}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="favorite-border" size={24} color={colors.primary} />
              <Text style={styles.settingLabel}>Saved Cars</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
          </View>
        </Card>

        <Card style={styles.settingCard} onPress={() => handleComingSoon('Notifications')}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="notifications-none" size={24} color={colors.primary} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
          </View>
        </Card>

        <Card style={styles.settingCard} onPress={() => navigation.navigate('Settings')}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="settings" size={24} color={colors.primary} />
              <Text style={styles.settingLabel}>Settings</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
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
    backgroundColor: '#FAFAFA',
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
    color: '#1A202C',
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
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#A0AEC0',
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
    color: '#1A202C',
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 24,
  },
});

export default ProfileScreen;


