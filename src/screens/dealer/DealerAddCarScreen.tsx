import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';


const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
}

interface CarFormData {
  // Basic Details
  make: string;
  model: string;
  variant: string;
  year: string;
  price: string;
  negotiable: boolean;
  
  // Physical Details
  mileage: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  seatingCapacity: string;
  
  // Ownership & Documents
  ownerNumber: string;
  registrationNumber: string;
  registrationState: string;
  insuranceType: string;
  insuranceExpiry: string;
  pucExpiry: string;
  
  // Engine & Performance
  engineCapacity: string;
  maxPower: string;
  maxTorque: string;
  driveTrain: string;
  
  // Features
  exteriorFeatures: string[];
  interiorFeatures: string[];
  safetyFeatures: string[];
  comfortFeatures: string[];
  entertainmentFeatures: string[];
  
  // Condition & History
  accidentHistory: boolean;
  floodHistory: boolean;
  serviceHistory: 'dealer' | 'independent' | 'mixed' | 'unknown';
  lastServiceDate: string;
  lastServiceKms: string;
  
  // Warranty & Certification
  manufacturerWarranty: boolean;
  warrantyExpiry: string;
  extendedWarranty: boolean;
  rtoCleared: boolean;
  
  // Dealer Specific
  dealerWarranty: boolean;
  dealerWarrantyPeriod: string;
  certificationLevel: 'basic' | 'premium' | 'luxury';
  inspectionReport: boolean;
  
  // Additional Info
  description: string;
  keyFeatures: string[];
  images: string[];
  documents: string[];
}

const MAKES = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'BMW', 'Audi', 'Mercedes-Benz'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'];
const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT'];
const BODY_TYPES = ['Hatchback', 'Sedan', 'SUV', 'Coupe', 'Convertible', 'Wagon'];
const COLORS = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Brown', 'Green', 'Yellow', 'Orange'];

const EXTERIOR_FEATURES = [
  'Alloy Wheels', 'LED Headlights', 'LED DRLs', 'Fog Lights', 'Sunroof', 'Rain Sensing Wipers',
  'Power Windows', 'Central Locking', 'Anti-theft Device', 'Engine Immobilizer',
];

const INTERIOR_FEATURES = [
  'Leather Seats', 'Power Steering', 'AC', 'Heater', 'Adjustable Steering', 'Height Adjustable Driver Seat',
  'Electric Adjust Seat', 'Automatic Climate Control', 'Air Quality Control', 'Remote Engine Start',
];

const SAFETY_FEATURES = [
  'ABS', 'Airbags', 'EBD', 'ESP', 'Traction Control', 'Hill Hold Control',
  'ISOFIX Child Seat Mounts', 'Reverse Camera', 'Parking Sensors', 'Blind Spot Monitor',
];

const COMFORT_FEATURES = [
  'Cruise Control', 'Push Button Start', 'Keyless Entry', 'USB Ports', 'Wireless Charging',
  'Cup Holders', 'Armrest', 'Rear AC Vents', 'Cooled Glove Box', 'Electric Mirrors',
];

const ENTERTAINMENT_FEATURES = [
  'Music System', 'Bluetooth', 'Android Auto', 'Apple CarPlay', 'Navigation System',
  'Touchscreen', 'Steering Mounted Controls', 'Voice Command', 'Premium Sound System',
];

const DealerAddCarScreen: React.FC<Props> = ({ navigation }) => {
  const isDark = false;
  const colors = {
    background: '#FAFBFC',
    surface: '#FFFFFF',
    text: '#1A202C',
    textSecondary: '#4A5568',
    primary: '#FFD700',
    border: '#E2E8F0',
    error: '#F56565',
    success: '#48BB78',
  };
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const [formData, setFormData] = useState<CarFormData>({
    make: '',
    model: '',
    variant: '',
    year: '',
    price: '',
    negotiable: true,
    mileage: '',
    fuelType: '',
    transmission: '',
    bodyType: '',
    color: '',
    seatingCapacity: '',
    ownerNumber: '',
    registrationNumber: '',
    registrationState: '',
    insuranceType: '',
    insuranceExpiry: '',
    pucExpiry: '',
    engineCapacity: '',
    maxPower: '',
    maxTorque: '',
    driveTrain: '',
    exteriorFeatures: [],
    interiorFeatures: [],
    safetyFeatures: [],
    comfortFeatures: [],
    entertainmentFeatures: [],
    accidentHistory: false,
    floodHistory: false,
    serviceHistory: 'dealer',
    lastServiceDate: '',
    lastServiceKms: '',
    manufacturerWarranty: false,
    warrantyExpiry: '',
    extendedWarranty: false,
    rtoCleared: true,
    dealerWarranty: true,
    dealerWarrantyPeriod: '6 months',
    certificationLevel: 'premium',
    inspectionReport: true,
    description: '',
    keyFeatures: [],
    images: [],
    documents: [],
  });

  const steps = [
    { title: 'Basic Info', icon: 'directions-car' },
    { title: 'Specifications', icon: 'settings' },
    { title: 'Features', icon: 'star' },
    { title: 'History', icon: 'history' },
    { title: 'Warranty', icon: 'verified' },
    { title: 'Media', icon: 'image' },
  ];

  const handleInputChange = <K extends keyof CarFormData>(field: K, value: CarFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (category: keyof Pick<CarFormData, 'exteriorFeatures' | 'interiorFeatures' | 'safetyFeatures' | 'comfortFeatures' | 'entertainmentFeatures'>, feature: string) => {
    const current = formData[category];
    const updated = current.includes(feature)
      ? current.filter(f => f !== feature)
      : [...current, feature];
    handleInputChange(category, updated);
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const previousStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Car listing created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }, 2000);
  };

  const renderStepIndicator = () => (
    <View style={[styles.stepIndicator, { backgroundColor: colors.surface }]}>
      {steps.map((step, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.stepItem,
            index <= activeStep && [styles.stepItemActive, { backgroundColor: colors.primary }],
          ]}
          onPress={() => setActiveStep(index)}
        >
          <Ionicons
            name={step.icon as any}
            size={16}
            color={index <= activeStep ? '#111827' : colors.textSecondary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Basic Information</Text>
      
      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Make *</Text>
          <View style={[styles.dropdown, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' }]}>
            <Text style={[styles.dropdownText, { color: formData.make ? colors.text : colors.textSecondary }]}>
              {formData.make || 'Select Make'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </View>
        </View>

        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Year *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
            value={formData.year}
            onChangeText={(text) => handleInputChange('year', text)}
            placeholder="e.g., 2020"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Model *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
          value={formData.model}
          onChangeText={(text) => handleInputChange('model', text)}
          placeholder="e.g., Swift, i20, Nexon"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Variant</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
          value={formData.variant}
          onChangeText={(text) => handleInputChange('variant', text)}
          placeholder="e.g., VXI, Sportz, XM"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Price (₹) *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
            value={formData.price}
            onChangeText={(text) => handleInputChange('price', text)}
            placeholder="e.g., 500000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Mileage *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
            value={formData.mileage}
            onChangeText={(text) => handleInputChange('mileage', text)}
            placeholder="e.g., 45000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.checkboxGroup}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleInputChange('negotiable', !formData.negotiable)}
        >
          <Ionicons
            name={formData.negotiable ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.checkboxText, { color: colors.text }]}>Price is negotiable</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Registration No.</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
            value={formData.registrationNumber}
            onChangeText={(text) => handleInputChange('registrationNumber', text)}
            placeholder="e.g., MH12AB1234"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Reg. State</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
            value={formData.registrationState}
            onChangeText={(text) => handleInputChange('registrationState', text)}
            placeholder="e.g., Maharashtra"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
    </View>
  );

  const renderSpecifications = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Technical Specifications</Text>
      
      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Fuel Type *</Text>
          <View style={styles.optionsContainer}>
            {FUEL_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionChip,
                  { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                  formData.fuelType === type && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleInputChange('fuelType', type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.text },
                    formData.fuelType === type && { backgroundColor: '#111827' },
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Transmission *</Text>
          <View style={styles.optionsContainer}>
            {TRANSMISSION_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionChip,
                  { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                  formData.transmission === type && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleInputChange('transmission', type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.text },
                    formData.transmission === type && { backgroundColor: '#111827' },
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Body Type</Text>
          <View style={styles.optionsContainer}>
            {BODY_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionChip,
                  { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                  formData.bodyType === type && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleInputChange('bodyType', type)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.text },
                    formData.bodyType === type && { backgroundColor: '#111827' },
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Color</Text>
          <View style={styles.optionsContainer}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.optionChip,
                  { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                  formData.color === color && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleInputChange('color', color)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.text },
                  formData.color === color && { color: '#111827' },
                  ]}
                >
                  {color}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Engine Capacity (cc)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
            value={formData.engineCapacity}
            onChangeText={(text) => handleInputChange('engineCapacity', text)}
            placeholder="e.g., 1200"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Seating Capacity</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
            value={formData.seatingCapacity}
            onChangeText={(text) => handleInputChange('seatingCapacity', text)}
            placeholder="e.g., 5"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Max Power (bhp)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
            value={formData.maxPower}
            onChangeText={(text) => handleInputChange('maxPower', text)}
            placeholder="e.g., 90"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Max Torque (Nm)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
            value={formData.maxTorque}
            onChangeText={(text) => handleInputChange('maxTorque', text)}
            placeholder="e.g., 113"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>
      </View>
    </View>
  );

  const renderFeatures = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Car Features</Text>
      
      {/* Exterior Features */}
      <View style={styles.featureSection}>
        <Text style={[styles.featureSectionTitle, { color: colors.text }]}>Exterior Features</Text>
        <View style={styles.featuresGrid}>
          {EXTERIOR_FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature}
              style={[
                styles.featureChip,
                { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                formData.exteriorFeatures.includes(feature) && { backgroundColor: colors.primary },
              ]}
              onPress={() => toggleFeature('exteriorFeatures', feature)}
            >
              <Text
                style={[
                  styles.featureText,
                  { color: colors.text },
                  formData.exteriorFeatures.includes(feature) && { color: '#111827' },
                ]}
              >
                {feature}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Interior Features */}
      <View style={styles.featureSection}>
        <Text style={[styles.featureSectionTitle, { color: colors.text }]}>Interior Features</Text>
        <View style={styles.featuresGrid}>
          {INTERIOR_FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature}
              style={[
                styles.featureChip,
                { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                formData.interiorFeatures.includes(feature) && { backgroundColor: colors.primary },
              ]}
              onPress={() => toggleFeature('interiorFeatures', feature)}
            >
              <Text
                style={[
                  styles.featureText,
                  { color: colors.text },
                  formData.interiorFeatures.includes(feature) && { color: '#111827' },
                ]}
              >
                {feature}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Safety Features */}
      <View style={styles.featureSection}>
        <Text style={[styles.featureSectionTitle, { color: colors.text }]}>Safety Features</Text>
        <View style={styles.featuresGrid}>
          {SAFETY_FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature}
              style={[
                styles.featureChip,
                { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                formData.safetyFeatures.includes(feature) && { backgroundColor: colors.primary },
              ]}
              onPress={() => toggleFeature('safetyFeatures', feature)}
            >
              <Text
                style={[
                  styles.featureText,
                  { color: colors.text },
                  formData.safetyFeatures.includes(feature) && { color: '#111827' },
                ]}
              >
                {feature}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderHistory = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Vehicle History</Text>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Owner Number</Text>
        <View style={styles.optionsContainer}>
          {[1, 2, 3, 4].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.optionChip,
                { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                formData.ownerNumber === num.toString() && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleInputChange('ownerNumber', num.toString())}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.text },
                  formData.ownerNumber === num.toString() && { color: '#111827' },
                ]}
              >
                {num === 1 ? '1st' : num === 2 ? '2nd' : num === 3 ? '3rd' : '4th+'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.checkboxGroup}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleInputChange('accidentHistory', !formData.accidentHistory)}
        >
          <Ionicons
            name={formData.accidentHistory ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.checkboxText, { color: colors.text }]}>Has accident history</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleInputChange('floodHistory', !formData.floodHistory)}
        >
          <Ionicons
            name={formData.floodHistory ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.checkboxText, { color: colors.text }]}>Has flood history</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Service History</Text>
        <View style={styles.optionsContainer}>
          {[
            { key: 'dealer', label: 'Dealer Service' },
            { key: 'independent', label: 'Independent' },
            { key: 'mixed', label: 'Mixed' },
            { key: 'unknown', label: 'Unknown' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.optionChip,
                { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                formData.serviceHistory === option.key && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleInputChange('serviceHistory', option.key as any)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.text },
                  formData.serviceHistory === option.key && { backgroundColor: '#111827' },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Last Service Date</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
            value={formData.lastServiceDate}
            onChangeText={(text) => handleInputChange('lastServiceDate', text)}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.formColumn}>
          <Text style={[styles.label, { color: colors.text }]}>Service Kms</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
            value={formData.lastServiceKms}
            onChangeText={(text) => handleInputChange('lastServiceKms', text)}
            placeholder="e.g., 40000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>
      </View>
    </View>
  );

  const renderWarranty = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Warranty & Certification</Text>
      
      <View style={styles.checkboxGroup}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleInputChange('manufacturerWarranty', !formData.manufacturerWarranty)}
        >
          <Ionicons
            name={formData.manufacturerWarranty ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.checkboxText, { color: colors.text }]}>Manufacturer warranty available</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleInputChange('extendedWarranty', !formData.extendedWarranty)}
        >
          <Ionicons
            name={formData.extendedWarranty ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.checkboxText, { color: colors.text }]}>Extended warranty available</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleInputChange('dealerWarranty', !formData.dealerWarranty)}
        >
          <Ionicons
            name={formData.dealerWarranty ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.checkboxText, { color: colors.text }]}>Dealer warranty included</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleInputChange('rtoCleared', !formData.rtoCleared)}
        >
          <Ionicons
            name={formData.rtoCleared ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.checkboxText, { color: colors.text }]}>RTO clearance available</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleInputChange('inspectionReport', !formData.inspectionReport)}
        >
          <Ionicons
            name={formData.inspectionReport ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={colors.primary}
          />
          <Text style={[styles.checkboxText, { color: colors.text }]}>Professional inspection report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Dealer Warranty Period</Text>
        <View style={styles.optionsContainer}>
          {['3 months', '6 months', '1 year', '2 years'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.optionChip,
                { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                formData.dealerWarrantyPeriod === period && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleInputChange('dealerWarrantyPeriod', period)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.text },
                  formData.dealerWarrantyPeriod === period && { backgroundColor: '#111827' },
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Certification Level</Text>
        <View style={styles.optionsContainer}>
          {[
            { key: 'basic', label: 'Basic Check' },
            { key: 'premium', label: 'Premium Certified' },
            { key: 'luxury', label: 'Luxury Certified' },
          ].map((level) => (
            <TouchableOpacity
              key={level.key}
              style={[
                styles.optionChip,
                { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
                formData.certificationLevel === level.key && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleInputChange('certificationLevel', level.key as any)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.text },
                  formData.certificationLevel === level.key && { backgroundColor: '#111827' },
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderMedia = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Images & Description</Text>
      
      {/* Image Upload Section */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Car Images</Text>
        <TouchableOpacity
          style={[styles.imageUpload, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' }]}
          onPress={() => setShowImagePicker(true)}
        >
          <Ionicons name="add-a-photo" size={32} color={colors.primary} />
          <Text style={[styles.imageUploadText, { color: colors.text }]}>Add Images</Text>
          <Text style={[styles.imageUploadSubtext, { color: colors.textSecondary }]}>
            Upload high-quality images (Max 10)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          placeholder="Describe the car's condition, unique features, recent maintenance, etc."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {/* Key Features */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Key Highlights</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA', color: colors.text }]}
          placeholder="Enter key features (comma separated)"
          placeholderTextColor={colors.textSecondary}
          multiline
        />
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: return renderBasicInfo();
      case 1: return renderSpecifications();
      case 2: return renderFeatures();
      case 3: return renderHistory();
      case 4: return renderWarranty();
      case 5: return renderMedia();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add New Car</Text>
        <Text style={[styles.stepCounter, { color: colors.textSecondary }]}>
          {activeStep + 1} of {steps.length}
        </Text>
      </View>

      {renderStepIndicator()}

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderStepContent()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={[styles.navigationButtons, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.secondaryButton,
              { backgroundColor: isDark ? '#2C2C2C' : '#F5F7FA' },
              activeStep === 0 && styles.disabledButton,
            ]}
            onPress={previousStep}
            disabled={activeStep === 0}
          >
            <Text style={[styles.navButtonText, { color: activeStep === 0 ? colors.textSecondary : colors.text }]}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.Button, { backgroundColor: colors.primary }]}
            onPress={activeStep === steps.length - 1 ? handleSubmit : nextStep}
            disabled={loading}
          >
            <Text style={styles.ButtonText}>
              {loading ? 'Creating...' : activeStep === steps.length - 1 ? 'Create Listing' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 12,
    paddingBottom: 16,
    elevation: 2,

  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  stepCounter: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  stepItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    color: '#E0E0E0',
  },
  stepItemActive: {
    borderColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stepContent: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  formColumn: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  dropdown: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkboxGroup: {
    gap: 16,
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  featureSection: {
    marginBottom: 24,
  },
  featureSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '500',
  },
  imageUpload: {
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderStyle: 'dashed',
  },
  imageUploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  imageUploadSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    elevation: 4,

  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    color: '#E0E0E0',
  },
  Button: {
    // backgroundColor set dynamically
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  ButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default DealerAddCarScreen;


