import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Switch, Text } from 'react-native';
import { useTheme } from '../theme';
import { Feather } from '@react-native-vector-icons/feather';

const ThemeChecker = ({ compact = false }) => {
  const { isDark, toggleTheme, colors: themeColors } = useTheme();

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {!compact && (
        <Text style={[styles.label, { color: themeColors.text }]}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>
      )}
      <View style={styles.switchContainer}>
        <Feather
          name={isDark ? 'moon' : 'sun'}
          size={compact ? 16 : 20}
          color={isDark ? '#FFD700' : '#1E1E1E'}
          style={styles.icon}
        />
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#767577', true: '#121212' }}
          thumbColor={isDark ? themeColors.primary : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
        />
        <Feather
          name={isDark ? 'sun' : 'moon'}
          size={compact ? 16 : 20}
          color={isDark ? '#1E1E1E' : '#FFD700'}
          style={styles.icon}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  compactContainer: {
    padding: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginHorizontal: 8,
  },
});

export default ThemeChecker;



