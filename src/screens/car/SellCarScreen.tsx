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
} from 'react-native';
import { useTheme } from '../../theme';
import { AntDesign } from '@react-native-vector-icons/ant-design';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const SellCarScreen = ({ navigation }: { navigation: any }) => {
  const { isDark, colors: themeColors } = useTheme();
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    kilometers: '',
    fuelType: '',
    transmission: '',
    ownerNumber: '',
    description: '',
  });

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

  const handleSubmit = () => {
    // In a real app, this would submit the form data to an API
    console.log('Form submitted:', formData);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Sell Your Car</Text>
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
          <View style={[styles.formContainer, { backgroundColor: themeColors.surface }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Car Details</Text>
            
            {/* Make & Model */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Make</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
                placeholder="e.g. Toyota, Honda, BMW"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.make}
                onChangeText={(text) => handleInputChange('make', text)}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Model</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
                placeholder="e.g. Camry, Civic, 3 Series"
                placeholderTextColor={themeColors.textSecondary}
                value={formData.model}
                onChangeText={(text) => handleInputChange('model', text)}
              />
            </View>
            
            {/* Year & Price */}
            <View style={styles.rowContainer}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: themeColors.text }]}>Year</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
                  placeholder="e.g. 2019"
                  placeholderTextColor={themeColors.textSecondary}
                  keyboardType="number-pad"
                  value={formData.year}
                  onChangeText={(text) => handleInputChange('year', text)}
                />
              </View>
              
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: themeColors.text }]}>Price (₹)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
                  placeholder="e.g. 500000"
                  placeholderTextColor={themeColors.textSecondary}
                  keyboardType="number-pad"
                  value={formData.price}
                  onChangeText={(text) => handleInputChange('price', text)}
                />
              </View>
            </View>
            
            {/* Kilometers */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Kilometers Driven</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }]}
                placeholder="e.g. 45000"
                placeholderTextColor={themeColors.textSecondary}
                keyboardType="number-pad"
                value={formData.kilometers}
                onChangeText={(text) => handleInputChange('kilometers', text)}
              />
            </View>
            
            {/* Fuel Type */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Fuel Type</Text>
              <View style={styles.optionsContainer}>
                {fuelTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                      selectedFuelType === type && { backgroundColor: themeColors.primary }
                    ]}
                    onPress={() => {
                      setSelectedFuelType(type);
                      handleInputChange('fuelType', type);
                    }}
                  >
                    <Text 
                      style={[
                        styles.optionText, 
                        { color: themeColors.text },
                        selectedFuelType === type && { color: isDark ? '#111827' : '#111827' }
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
              <Text style={[styles.label, { color: themeColors.text }]}>Transmission</Text>
              <View style={styles.optionsContainer}>
                {transmissionTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                      selectedTransmission === type && { backgroundColor: themeColors.primary }
                    ]}
                    onPress={() => {
                      setSelectedTransmission(type);
                      handleInputChange('transmission', type);
                    }}
                  >
                    <Text 
                      style={[
                        styles.optionText, 
                        { color: themeColors.text },
                        selectedTransmission === type && { color: isDark ? '#111827' : '#111827' }
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
              <Text style={[styles.label, { color: themeColors.text }]}>Owner Number</Text>
              <View style={styles.optionsContainer}>
                {[1, 2, 3, 4].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.optionButton,
                      { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                      formData.ownerNumber === num.toString() && { backgroundColor: themeColors.primary }
                    ]}
                    onPress={() => handleInputChange('ownerNumber', num.toString())}
                  >
                    <Text 
                      style={[
                        styles.optionText, 
                        { color: themeColors.text },
                        formData.ownerNumber === num.toString() && { color: isDark ? '#111827' : '#111827' }
                      ]}
                    >
                      {num === 1 ? '1st' : num === 2 ? '2nd' : num === 3 ? '3rd' : '4th+'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Description</Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.textArea, 
                  { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: themeColors.text }
                ]}
                placeholder="Describe your car's condition, features, etc."
                placeholderTextColor={themeColors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
              />
            </View>
            
            {/* Photo Upload Section */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>Photos</Text>
              <View style={styles.photoContainer}>
                <TouchableOpacity 
                  style={[styles.addPhotoButton, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' }]}
                >
                  <AntDesign name="plus" size={24} color={themeColors.primary} />
                  <Text style={[styles.addPhotoText, { color: themeColors.text }]}>Add Photos</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Submit Button */}
      <View style={[styles.bottomContainer, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <LinearGradient
            colors={['#FFD700', '#E6C200', '#D4AF37']} // Gold gradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.submitButtonGradient}
          >
            <Text style={styles.submitButtonText}>List Your Car</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 14,
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
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});

export default SellCarScreen;


