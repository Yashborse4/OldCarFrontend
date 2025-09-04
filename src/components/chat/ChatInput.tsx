import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActionSheetIOS,
  Platform,
  Image,
} from 'react-native';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import { useTheme } from '../../theme';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, PhotoQuality } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imageUri: string) => void;
  onSendLocation: (latitude: number, longitude: number, address: string) => void;
  onSendCarShare?: (carId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showCarShare?: boolean;
  availableCars?: Array<{
    id: string;
    title: string;
    price: string;
    image: string;
  }>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendImage,
  onSendLocation,
  onSendCarShare,
  placeholder = "Type a message...",
  disabled = false,
  showCarShare = false,
  availableCars = [],
}) => {
  const { colors: theme } = useTheme();
  const [messageText, setMessageText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showCarShareModal, setShowCarShareModal] = useState(false);

  const sendMessage = () => {
    if (!messageText.trim() || disabled) return;
    
    onSendMessage(messageText.trim());
    setMessageText('');
  };

  const pickImageFromLibrary = async () => {
    try {
      const options = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8 as PhotoQuality,
      };

      launchImageLibrary(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          if (response.errorMessage) {
            Alert.alert('Error', 'Failed to pick image from library.');
          }
          return;
        }

        if (response.assets && response.assets[0]) {
          onSendImage(response.assets[0].uri!);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from library.');
    }
    setShowAttachmentMenu(false);
  };

  const takePhoto = async () => {
    try {
      const options = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8 as PhotoQuality,
      };

      launchCamera(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          if (response.errorMessage) {
            Alert.alert('Error', 'Failed to take photo.');
          }
          return;
        }

        if (response.assets && response.assets[0]) {
          onSendImage(response.assets[0].uri!);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo.');
    }
    setShowAttachmentMenu(false);
  };

  const shareLocation = async () => {
    try {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // For simplicity, use coordinates as address since reverse geocoding requires additional setup
          const address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          onSendLocation(latitude, longitude, address);
        },
        (error) => {
          Alert.alert('Error', 'Failed to get your location. Please check your location settings.');
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000,
        }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get your location.');
    }
    setShowAttachmentMenu(false);
  };

  const showAttachmentOptions = () => {
    if (Platform.OS === 'ios') {
      const options = ['Take Photo', 'Choose from Library', 'Share Location'];
      if (showCarShare) options.push('Share Car');
      options.push('Cancel');

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              takePhoto();
              break;
            case 1:
              pickImageFromLibrary();
              break;
            case 2:
              shareLocation();
              break;
            case 3:
              if (showCarShare) {
                setShowCarShareModal(true);
              }
              break;
          }
        }
      );
    } else {
      setShowAttachmentMenu(true);
    }
  };

  const renderAttachmentMenu = () => (
    <Modal
      visible={showAttachmentMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAttachmentMenu(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowAttachmentMenu(false)}
      >
        <View style={[styles.attachmentMenu, { backgroundColor: theme.card }]}>
          <TouchableOpacity style={styles.attachmentOption} onPress={takePhoto}>
            <View style={[styles.attachmentIconContainer, { backgroundColor: '#FF6B6B' }]}>
              <MaterialCommunityIcons name="camera" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.attachmentOptionText, { color: theme.text }]}>
              Take Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachmentOption} onPress={pickImageFromLibrary}>
            <View style={[styles.attachmentIconContainer, { backgroundColor: '#4ECDC4' }]}>
              <MaterialCommunityIcons name="image" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.attachmentOptionText, { color: theme.text }]}>
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachmentOption} onPress={shareLocation}>
            <View style={[styles.attachmentIconContainer, { backgroundColor: '#45B7D1' }]}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.attachmentOptionText, { color: theme.text }]}>
              Location
            </Text>
          </TouchableOpacity>

          {showCarShare && (
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={() => {
                setShowAttachmentMenu(false);
                setShowCarShareModal(true);
              }}
            >
              <View style={[styles.attachmentIconContainer, { backgroundColor: theme.primary }]}>
                <MaterialCommunityIcons name="car" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.attachmentOptionText, { color: theme.text }]}>
                Share Car
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderCarShareModal = () => (
    <Modal
      visible={showCarShareModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCarShareModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.carShareModal, { backgroundColor: theme.card }]}>
          <View style={styles.carShareHeader}>
            <Text style={[styles.carShareTitle, { color: theme.text }]}>
              Share a Car
            </Text>
            <TouchableOpacity onPress={() => setShowCarShareModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {availableCars.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons
                name="car-off"
                size={48}
                color={theme.textSecondary}
              />
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                No cars available to share
              </Text>
            </View>
          ) : (
            availableCars.map((car) => (
              <TouchableOpacity
                key={car.id}
                style={[styles.carShareItem, { borderBottomColor: theme.border }]}
                onPress={() => {
                  onSendCarShare?.(car.id);
                  setShowCarShareModal(false);
                }}
              >
                <Image source={{ uri: car.image }} style={styles.carShareItemImage} />
                <View style={styles.carShareItemDetails}>
                  <Text style={[styles.carShareItemTitle, { color: theme.text }]}>
                    {car.title}
                  </Text>
                  <Text style={[styles.carShareItemPrice, { color: theme.primary }]}>
                    {car.price}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </Modal>
  );

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: 16,
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    attachmentButton: {
      padding: 8,
      marginRight: 8,
      borderRadius: 20,
    },
    textInputContainer: {
      flex: 1,
      maxHeight: 100,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.background,
    },
    textInput: {
      fontSize: 16,
      color: theme.text,
      textAlignVertical: 'top',
      minHeight: 20,
    },
    sendButton: {
      backgroundColor: theme.primary,
      borderRadius: 20,
      padding: 8,
      marginLeft: 8,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 36,
      minHeight: 36,
    },
    sendButtonDisabled: {
      backgroundColor: theme.textSecondary,
      opacity: 0.5,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    attachmentMenu: {
      flexDirection: 'row',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 32,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    attachmentOption: {
      alignItems: 'center',
      marginHorizontal: 12,
    },
    attachmentIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    attachmentOptionText: {
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
    },
    carShareModal: {
      width: '90%',
      maxHeight: '70%',
      borderRadius: 12,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    carShareHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    carShareTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    carShareItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
    },
    carShareItemImage: {
      width: 60,
      height: 45,
      borderRadius: 8,
      marginRight: 12,
    },
    carShareItemDetails: {
      flex: 1,
    },
    carShareItemTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    carShareItemPrice: {
      fontSize: 14,
      fontWeight: '700',
    },
    emptyStateContainer: {
      alignItems: 'center',
      padding: 32,
    },
    emptyStateText: {
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.attachmentButton}
        onPress={showAttachmentOptions}
        disabled={disabled}
      >
        <MaterialCommunityIcons
          name="plus"
          size={24}
          color={disabled ? theme.textSecondary : theme.primary}
        />
      </TouchableOpacity>
      
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
          editable={!disabled}
        />
      </View>
      
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!messageText.trim() || disabled) && styles.sendButtonDisabled
        ]}
        onPress={sendMessage}
        disabled={!messageText.trim() || disabled}
      >
        <MaterialCommunityIcons
          name="send"
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {renderAttachmentMenu()}
      {renderCarShareModal()}
    </View>
  );
};

export default ChatInput;
