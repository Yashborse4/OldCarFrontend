import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { carApi } from '../../services/CarApi';
import { apiClient } from '../../services/ApiClient';

const SellCarScreen = ({ navigation }: { navigation: any }) => {
  const isDark = false; // Hardcoded to false (light theme)
  const colors = {
    background: '#FAFBFC',
    surface: '#FFFFFF',
    text: '#1A202C',
    textSecondary: '#4A5568',
    primary: '#FFD700',
    border: '#E2E8F0',
    error: '#EF4444',
  };

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    kilometers: '',
    fuelType: '',
    transmission: '',
    ownerNumber: '1',
    description: '',
    vin: '',
    color: '',
  });

  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedFuelType, setSelectedFuelType] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');

  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'];
  const transmissionTypes = ['Manual', 'Automatic', 'CVT', 'DCT'];

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handlePickImages = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 10,
        quality: 0.8,
      });

      if (result.assets) {
        setSelectedImages(prev => [...prev, ...result.assets!]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetBanner = (index: number) => {
    // Move selected image to index 0
    if (index === 0) return;

    const newImages = [...selectedImages];
    const item = newImages.splice(index, 1)[0];
    newImages.unshift(item);
    setSelectedImages(newImages);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    const uploadPromises = selectedImages.map(async (image) => {
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? image.uri?.replace('file://', '') : image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || `image_${Date.now()}.jpg`,
      });
      formData.append('folder', 'cars/temp'); // Ideally use actual car ID after creation, or temp folder

      try {
        const response = await apiClient.post<{ fileUrl: string }>('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data.fileUrl;
      } catch (error) {
        console.error('Image upload failed', error);
        throw new Error('Failed to upload one or more images');
      }
    });

    return await Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.make || !formData.model || !formData.price || !formData.year) {
      Alert.alert('Missing Fields', 'Please fill in all required fields (Make, Model, Year, Price)');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('No Images', 'Please add at least one image of your car');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload Images
      const imageUrls = await uploadImages();

      // 2. Create Car
      // Note: imageUrls[0] is automatically the banner because we sorted selectedImages
      const carData: any = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        mileage: parseInt(formData.kilometers) || 0,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        numberOfOwners: parseInt(formData.ownerNumber) || 1,
        description: formData.description,
        color: formData.color,
        vin: formData.vin,

        // These are the key fields for images
        imageUrl: imageUrls[0], // Explicitly set banner
        images: imageUrls,      // Full list
      };

      await carApi.createVehicle(carData);

      Alert.alert('Success', 'Your car has been listed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error: any) {
      console.error('Submission error:', error);
      Alert.alert('Error', error.message || 'Failed to list your car. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} translucent={false} hidden={false} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sell Your Car</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Form Container */}
          <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>

            {/* Photo Upload Section */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Photos</Text>
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                Tap image to set correctly as banner (Cover)
              </Text>
            </View>

            <View style={styles.photoContainer}>
              {selectedImages.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.imageWrapper,
                    index === 0 && { borderColor: colors.primary, borderWidth: 3 }
                  ]}
                  onPress={() => handleSetBanner(index)}
                >
                  <Image source={{ uri: img.uri }} style={styles.imageThumbnail} />
                  {index === 0 && (
                    <View style={[styles.bannerBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.bannerText}>Banner</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.addPhotoButton, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' }]}
                onPress={handlePickImages}
              >
                <Ionicons name="camera-outline" size={32} color={colors.primary} />
                <Text style={[styles.addPhotoText, { color: colors.text }]}>Add Photos</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Car Details</Text>

            {/* Make & Model */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Make</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
                placeholder="e.g. Toyota, Honda, BMW"
                placeholderTextColor={colors.textSecondary}
                value={formData.make}
                onChangeText={(text) => handleInputChange('make', text)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Model</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
                placeholder="e.g. Camry, Civic, 3 Series"
                placeholderTextColor={colors.textSecondary}
                value={formData.model}
                onChangeText={(text) => handleInputChange('model', text)}
              />
            </View>

            {/* Year & Price */}
            <View style={styles.rowContainer}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Year</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
                  placeholder="e.g. 2019"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={formData.year}
                  onChangeText={(text) => handleInputChange('year', text)}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Price (₹)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
                  placeholder="e.g. 500000"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={formData.price}
                  onChangeText={(text) => handleInputChange('price', text)}
                />
              </View>
            </View>

            {/* Kilometers */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Kilometers Driven</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
                placeholder="e.g. 45000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                value={formData.kilometers}
                onChangeText={(text) => handleInputChange('kilometers', text)}
              />
            </View>

            {/* Fuel Type */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Fuel Type</Text>
              <View style={styles.optionsContainer}>
                {fuelTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                      selectedFuelType === type && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => {
                      setSelectedFuelType(type);
                      handleInputChange('fuelType', type);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.text },
                        selectedFuelType === type && { color: '#111827', fontWeight: 'bold' }
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Transmission */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Transmission</Text>
              <View style={styles.optionsContainer}>
                {transmissionTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                      selectedTransmission === type && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => {
                      setSelectedTransmission(type);
                      handleInputChange('transmission', type);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.text },
                        selectedTransmission === type && { color: '#111827', fontWeight: 'bold' }
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Owner Number */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Owner Number</Text>
              <View style={styles.optionsContainer}>
                {[1, 2, 3, 4].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.optionButton,
                      { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                      formData.ownerNumber === num.toString() && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => handleInputChange('ownerNumber', num.toString())}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.text },
                        formData.ownerNumber === num.toString() && { color: '#111827', fontWeight: 'bold' }
                      ]}
                    >
                      {num === 1 ? '1st' : num === 2 ? '2nd' : num === 3 ? '3rd' : '4th+'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color & VIN */}
            <View style={styles.rowContainer}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>Color</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
                  placeholder="e.g. White"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.color}
                  onChangeText={(text) => handleInputChange('color', text)}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.text }]}>VIN (Optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
                  placeholder="17 chars"
                  placeholderTextColor={colors.textSecondary}
                  maxLength={17}
                  value={formData.vin}
                  onChangeText={(text) => handleInputChange('vin', text)}
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }
                ]}
                placeholder="Describe your car's condition, features, etc."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
              />
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <View style={styles.submitButtonGradient}>
            {isSubmitting ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <Text style={styles.submitButtonText}>List Your Car</Text>
            )}
          </View>
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
    paddingTop: (StatusBar.currentHeight || 0) + 10,
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formContainer: {
    padding: 16,
    borderRadius: 16,
    margin: 16,
    elevation: 4,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
  },
  bannerBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  removeImageButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});

export default SellCarScreen;


