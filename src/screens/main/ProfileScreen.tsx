import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useTheme } from '../../theme';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import LinearGradient from 'react-native-linear-gradient';

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={[styles.avatarContainer, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' }]}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>John Doe</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>john.doe@example.com</Text>
      </View>

      {/* Settings Cards */}
      <View style={styles.settingsContainer}>
        {/* Theme Toggle */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.settingItem} onPress={toggleTheme}>
            <View style={styles.settingLeft}>
              <MaterialIcons 
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
              trackColor={{ false: '#767577', true: colors.primary }} 
              thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'} 
              ios_backgroundColor="#3e3e3e"
            />
          </TouchableOpacity>
        </View>

        {/* My Listings */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="list" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>My Listings</Text>
            </View>
            <AntDesign name="right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Saved Cars */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="favorite-border" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Saved Cars</Text>
            </View>
            <AntDesign name="right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="notifications-none" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
            </View>
            <AntDesign name="right" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <LinearGradient
            colors={['#FFD700', '#E6C200', '#D4AF37']} // Gold gradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.logoutButtonGradient}
          >
            <MaterialIcons name="logout" size={20} color="#111827" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  settingsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
  },
  logoutButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});

export default ProfileScreen;