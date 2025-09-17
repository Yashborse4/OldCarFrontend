import React from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useTheme } from '../../theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const SettingsScreen = ({ navigation }: { navigation?: any }) => {
  const { isDark, toggleTheme, colors } = useTheme();

  const handleComingSoon = (feature: string) => {
    Alert.alert('Coming Soon', `${feature} is under development.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your preferences</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.settingCard} onPress={() => handleComingSoon('Edit Profile')}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="person" size={24} color={colors.primary} />
                <Text style={styles.settingLabel}>Edit Profile</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
            </View>
          </Card>

          <Card style={styles.settingCard} onPress={() => handleComingSoon('Privacy Settings')}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="privacy-tip" size={24} color={colors.primary} />
                <Text style={styles.settingLabel}>Privacy Settings</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
            </View>
          </Card>

          <Card style={styles.settingCard} onPress={() => handleComingSoon('Notifications')}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="notifications" size={24} color={colors.primary} />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card style={styles.settingCard} onPress={() => handleComingSoon('Help Center')}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="help" size={24} color={colors.primary} />
                <Text style={styles.settingLabel}>Help Center</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
            </View>
          </Card>

          <Card style={styles.settingCard} onPress={() => handleComingSoon('Contact Us')}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="contact-support" size={24} color={colors.primary} />
                <Text style={styles.settingLabel}>Contact Us</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textSecondary} />
            </View>
          </Card>
        </View>

        {navigation && (
          <Button
            title="Back to Dashboard"
            variant="outline"
            onPress={() => navigation.navigate('Dashboard')}
            fullWidth
            style={styles.backButton}
          />
        )}
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
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#718096',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 16,
  },
  settingCard: {
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A202C',
    marginLeft: 12,
  },
  backButton: {
    marginTop: 24,
    marginBottom: 32,
  },
});

export default SettingsScreen;



