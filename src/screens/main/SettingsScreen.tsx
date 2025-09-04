import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../theme';

const SettingsScreen = () => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
        <Animatable.View 
          animation={isDark ? "fadeIn" : "fadeIn"}
          duration={500}
          style={[styles.card, { backgroundColor: colors.surface }]}
        >
          <TouchableOpacity style={styles.row} onPress={toggleTheme}>
            <MaterialIcons 
              name={isDark ? "dark-mode" : "light-mode"} 
              size={24} 
              color={'#FFD700'} 
            />
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {isDark ? "Dark Mode" : "Light Mode"}
            </Text>
            <Switch 
              value={isDark} 
              onValueChange={toggleTheme} 
              trackColor={{ false: '#767577', true: '#FFD700' }} 
              thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'} 
              ios_backgroundColor="#3e3e3e"
            />
          </TouchableOpacity>
        </Animatable.View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Premium Features</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.row}>
            <MaterialIcons name="workspace-premium" size={24} color={'#FFD700'} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>Premium Midnight Gold</Text>
            <MaterialIcons name="check-circle" size={24} color={'#FFD700'} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 18,
    marginLeft: 15,
    flex: 1,
  },
});

export default SettingsScreen;

