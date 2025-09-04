import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse } from './api';

export const USER_STORAGE_KEY = '@user_token'; // store JWT token only
export const AUTH_STATUS_KEY = '@is_authorized';
export const USER_NAME_KEY = '@user_name';

export const storeAuthData = async (authData: AuthResponse) => {
  try {
    // Store token securely (optional)
    await Keychain.setGenericPassword(authData.username || authData.email || 'user', authData.token);

    // Store JWT token in AsyncStorage
    await AsyncStorage.setItem(USER_STORAGE_KEY, authData.token);
    // Store username
    await AsyncStorage.setItem(USER_NAME_KEY, authData.username);
    // Set auth status
    await AsyncStorage.setItem(AUTH_STATUS_KEY, 'true');
  } catch (error) {
    console.error('Failed to store auth data', error);
    throw new Error('Could not save authentication session.');
  }
};

export const getStoredToken = async (): Promise<string | null> => {
  try {
    // Try Keychain first
    const credentials = await Keychain.getGenericPassword();
    if (credentials) return credentials.password;
    // Fallback to AsyncStorage
    return await AsyncStorage.getItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to retrieve stored token', error);
    return null;
  }
};

export const getStoredUser = async () => {
  try {
    const username = await AsyncStorage.getItem(USER_NAME_KEY);
    return username;
  } catch (error) {
    console.error('Failed to retrieve stored user name', error);
    return null;
  }
};

export const isUserAuthorized = async (): Promise<boolean> => {
    try {
        const isAuthorized = await AsyncStorage.getItem(AUTH_STATUS_KEY);
        const token = await getStoredToken();
        return isAuthorized === 'true' && !!token;
    } catch (error) {
        console.error('Failed to check auth status', error);
        return false;
    }
};

export const clearAuthData = async () => {
  try {
    await Keychain.resetGenericPassword();
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_NAME_KEY);
    await AsyncStorage.removeItem(AUTH_STATUS_KEY);
  } catch (error) {
    console.error('Failed to clear auth data', error);
  }
};
