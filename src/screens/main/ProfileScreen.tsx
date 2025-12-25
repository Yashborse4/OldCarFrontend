import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme/ThemeContext';

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { colors } = theme;

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
          onPress: () => navigation.replace('Login'),
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
            <Ionicons name="person-circle" size={80} color={colors.primary} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>John Doe</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>john.doe@example.com</Text>
          <Text style={[styles.userRole, { color: colors.textSecondary }]}>Car Enthusiast</Text>
        </View>
      </Card>

      {/* Settings */}
      <View style={styles.settingsContainer}>
        {/* Theme Toggle */}
        <Card style={styles.settingCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={isDark ? "dark-mode" : "light-mode"}
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
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

