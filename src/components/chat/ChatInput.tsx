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
import Ionicons from 'react-native-vector-icons/Ionicons';

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
  const theme = {
    colors: {
      surface: '#FFFFFF',
      text: '#1A202C',
      textSecondary: '#4A5568',
      primary: '#FFD700',
      border: '#E2E8F0',
    }
  };
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
        <View style={[styles.attachmentMenu, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity style={styles.attachmentOption} onPress={takePhoto}>
            <View style={[styles.attachmentIconContainer, { backgroundColor: '#FF6B6B' }]}>
            <Ionicons name="camera-alt" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.attachmentOptionText, { color: theme.colors.text }]}>
              Take Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachmentOption} onPress={pickImageFromLibrary}>
            <View style={[styles.attachmentIconContainer, { backgroundColor: '#4ECDC4' }]}>
              <Ionicons name="image" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.attachmentOptionText, { color: theme.colors.text }]}>
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachmentOption} onPress={shareLocation}>
            <View style={[styles.attachmentIconContainer, { backgroundColor: '#45B7D1' }]}>
              <Ionicons name="location" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.attachmentOptionText, { color: theme.colors.text }]}>
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
              <View style={[styles.attachmentIconContainer, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="car" size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.attachmentOptionText, { color: theme.colors.text }]}>
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
        <View style={[styles.carShareModal, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.carShareHeader}>
            <Text style={[styles.carShareTitle, { color: theme.colors.text }]}>
              Share a Car
            </Text>
            <TouchableOpacity onPress={() => setShowCarShareModal(false)}>
              <Text style={{fontSize: 24, color: theme.colors.text}}>×</Text>
            </TouchableOpacity>
          </View>

          {availableCars.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={{fontSize: 48, color: theme.colors.textSecondary}}>🚗❌</Text>
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                No cars available to share
              </Text>
            </View>
          ) : (
            availableCars.map((car) => (
              <TouchableOpacity
                key={car.id}
                style={[styles.carShareItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => {
                  onSendCarShare?.(car.id);
                  setShowCarShareModal(false);
                }}
              >
                <Image source={{ uri: car.image }} style={styles.carShareItemImage} />
                <View style={styles.carShareItemDetails}>
                  <Text style={[styles.carShareItemTitle, { color: theme.colors.text }]}>
                    {car.title}
                  </Text>
                  <Text style={[styles.carShareItemPrice, { color: theme.colors.primary }]}>
                    {car.price}
                  </Text>
                </View>
                <Text style={{fontSize: 20, color: theme.colors.textSecondary}}>›</Text>
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
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E2E8F0',
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
      borderColor: '#E2E8F0',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#FAFBFC',
    },
    textInput: {
      fontSize: 16,
      color: '#1A202C',
      textAlignVertical: 'top',
      minHeight: 20,
    },
    sendButton: {
      backgroundColor: '#FFD700',
      borderRadius: 20,
      padding: 8,
      marginLeft: 8,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 36,
      minHeight: 36,
    },
    sendButtonDisabled: {
      backgroundColor: '#4A5568',
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

    },
    carShareHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E2E8F0',
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
        <Text style={{fontSize: 24, color: disabled ? theme.colors.textSecondary : theme.colors.primary}}>+</Text>
      </TouchableOpacity>
      
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
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
        <Text style={{fontSize: 20, color: '#FFFFFF'}}>➤</Text>
      </TouchableOpacity>

      {renderAttachmentMenu()}
      {renderCarShareModal()}
    </View>
  );
};

export default ChatInput;


