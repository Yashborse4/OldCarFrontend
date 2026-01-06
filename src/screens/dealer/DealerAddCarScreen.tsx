import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Gradient } from '../../components/ui/Gradient';
import {
  scaleSize,
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveBorderRadius,
  wp,
  hp,
} from '../../utils/responsiveEnhanced';

interface Props {
  navigation: any;
}

// Car brands with icons
const CAR_BRANDS = [
  { id: 'maruti', name: 'Maruti Suzuki', icon: '🚗' },
  { id: 'hyundai', name: 'Hyundai', icon: '🚙' },
  { id: 'tata', name: 'Tata', icon: '🚐' },
  { id: 'mahindra', name: 'Mahindra', icon: '🚕' },
  { id: 'honda', name: 'Honda', icon: '🏎️' },
  { id: 'toyota', name: 'Toyota', icon: '🚘' },
  { id: 'kia', name: 'Kia', icon: '🚖' },
  { id: 'mg', name: 'MG', icon: '🏁' },
  { id: 'skoda', name: 'Skoda', icon: '🚔' },
  { id: 'volkswagen', name: 'Volkswagen', icon: '🚓' },
];

const FUEL_TYPES = [
  { id: 'petrol', name: 'Petrol', icon: 'water-outline' },
  { id: 'diesel', name: 'Diesel', icon: 'flash-outline' },
  { id: 'electric', name: 'Electric', icon: 'battery-charging-outline' },
  { id: 'cng', name: 'CNG', icon: 'leaf-outline' },
  { id: 'hybrid', name: 'Hybrid', icon: 'sync-outline' },
];

const TRANSMISSION_TYPES = [
  { id: 'manual', name: 'Manual', icon: 'cog-outline' },
  { id: 'automatic', name: 'Automatic', icon: 'settings-outline' },
];

const OWNER_OPTIONS = [
  { id: '1', label: '1st Owner', sublabel: 'First hand' },
  { id: '2', label: '2nd Owner', sublabel: 'Second hand' },
  { id: '3', label: '3rd Owner', sublabel: 'Third hand' },
  { id: '4+', label: '4+ Owners', sublabel: 'Multiple owners' },
];

const COLORS = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', hex: '#1A1A1A' },
  { id: 'silver', name: 'Silver', hex: '#C0C0C0' },
  { id: 'grey', name: 'Grey', hex: '#808080' },
  { id: 'red', name: 'Red', hex: '#DC2626' },
  { id: 'blue', name: 'Blue', hex: '#2563EB' },
  { id: 'brown', name: 'Brown', hex: '#92400E' },
  { id: 'green', name: 'Green', hex: '#059669' },
];

interface FormData {
  // Step 1: Car Identity
  brand: string;
  model: string;
  variant: string;
  color: string;

  // Step 2: Ownership & Registration
  registrationYear: string;
  ownerNumber: string;
  fuelType: string;
  transmission: string;
  mileage: string;
  usage: string;

  // Step 3: Condition
  accidentHistory: boolean | null;
  repaintedParts: boolean | null;
  engineIssues: boolean | null;
  floodDamage: boolean | null;
  insuranceClaims: boolean | null;

  // Step 4: Pricing & Media
  price: string;
  description: string;
  images: string[];
}

const TOTAL_STEPS = 4;
const ADD_CAR_DRAFT_KEY = '@dealer_add_car_draft';

const DealerAddCarScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { colors } = theme;
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    brand: '',
    model: '',
    variant: '',
    color: '',
    registrationYear: '',
    ownerNumber: '',
    fuelType: '',
    transmission: '',
    mileage: '',
    usage: '',
    accidentHistory: null,
    repaintedParts: null,
    engineIssues: null,
    floodDamage: null,
    insuranceClaims: null,
    price: '',
    description: '',
    images: [],
  });

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      AsyncStorage.setItem(ADD_CAR_DRAFT_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const stored = await AsyncStorage.getItem(ADD_CAR_DRAFT_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<FormData>;
          setFormData(prev => ({ ...prev, ...parsed }));
        }
      } catch {
      }
    };

    loadDraft();
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return formData.brand && formData.model;
      case 2:
        return formData.registrationYear && formData.fuelType && formData.transmission;
      case 3:
        return true; // All optional
      case 4:
        return formData.price;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: API call to submit car
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));
      AsyncStorage.removeItem(ADD_CAR_DRAFT_KEY).catch(() => {});
      Alert.alert(
        'Success! 🎉',
        'Your car listing has been submitted for review.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============= STEP COMPONENTS =============

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Step {currentStep} of {TOTAL_STEPS}
        </Text>
        <Text style={[styles.progressTitle, { color: colors.text }]}>
          {currentStep === 1 && 'Identify Your Car'}
          {currentStep === 2 && 'Ownership Details'}
          {currentStep === 3 && 'Condition Check'}
          {currentStep === 4 && 'Pricing & Photos'}
        </Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: isDark ? colors.surface : '#E5E7EB' }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${(currentStep / TOTAL_STEPS) * 100}%`, backgroundColor: colors.primary }
          ]}
        />
      </View>
    </View>
  );

  // Step 1: Car Identity
  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepQuestion, { color: colors.text }]}>
        What car are you selling?
      </Text>
      <Text style={[styles.stepHint, { color: colors.textSecondary }]}>
        Select your car's brand to get started
      </Text>

      {/* Brand Selection */}
      <View style={styles.brandGrid}>
        {CAR_BRANDS.map(brand => (
          <TouchableOpacity
            key={brand.id}
            style={[
              styles.brandCard,
              { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border },
              formData.brand === brand.id && { borderColor: colors.primary, backgroundColor: isDark ? '#1F2937' : '#FEF3C7' }
            ]}
            onPress={() => updateField('brand', brand.id)}
          >
            <Text style={styles.brandEmoji}>{brand.icon}</Text>
            <Text style={[styles.brandName, { color: colors.text }]} numberOfLines={1}>
              {brand.name}
            </Text>
            {formData.brand === brand.id && (
              <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={12} color="#111827" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Model Input */}
      {formData.brand && (
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Model Name *</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: isDark ? colors.surface : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
            value={formData.model}
            onChangeText={(text) => updateField('model', text)}
            placeholder="e.g., Swift, i20, Nexon"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      )}

      {/* Variant Input */}
      {formData.model && (
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Variant (Optional)</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: isDark ? colors.surface : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
            value={formData.variant}
            onChangeText={(text) => updateField('variant', text)}
            placeholder="e.g., VXi, Sportz, XM"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      )}

      {/* Color Selection */}
      {formData.model && (
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Color (Optional)</Text>
          <View style={styles.colorGrid}>
            {COLORS.map(color => (
              <TouchableOpacity
                key={color.id}
                style={[
                  styles.colorChip,
                  { backgroundColor: color.hex, borderColor: formData.color === color.id ? colors.primary : colors.border }
                ]}
                onPress={() => updateField('color', color.id)}
              >
                {formData.color === color.id && (
                  <Ionicons name="checkmark" size={16} color={color.id === 'white' || color.id === 'silver' ? '#111827' : '#FFFFFF'} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: hp(15) }} />
    </ScrollView>
  );

  // Step 2: Ownership & Registration
  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepQuestion, { color: colors.text }]}>
        Tell us about the car's history
      </Text>
      <Text style={[styles.stepHint, { color: colors.textSecondary }]}>
        This helps buyers make informed decisions
      </Text>

      {/* Registration Year */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Registration Year *</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: isDark ? colors.surface : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
          value={formData.registrationYear}
          onChangeText={(text) => updateField('registrationYear', text)}
          placeholder="e.g., 2020"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>

      {/* Owner Number */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Number of Owners</Text>
        <View style={styles.ownerGrid}>
          {OWNER_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.ownerCard,
                { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border },
                formData.ownerNumber === option.id && { borderColor: colors.primary, backgroundColor: isDark ? '#1F2937' : '#FEF3C7' }
              ]}
              onPress={() => updateField('ownerNumber', option.id)}
            >
              <Text style={[styles.ownerLabel, { color: colors.text }]}>{option.label}</Text>
              <Text style={[styles.ownerSublabel, { color: colors.textSecondary }]}>{option.sublabel}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fuel Type */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Fuel Type *</Text>
        <View style={styles.optionRow}>
          {FUEL_TYPES.map(fuel => (
            <TouchableOpacity
              key={fuel.id}
              style={[
                styles.optionPill,
                { backgroundColor: isDark ? colors.surface : '#F3F4F6', borderColor: colors.border },
                formData.fuelType === fuel.id && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => updateField('fuelType', fuel.id)}
            >
              <Ionicons
                name={fuel.icon as any}
                size={18}
                color={formData.fuelType === fuel.id ? '#111827' : colors.text}
              />
              <Text style={[
                styles.optionPillText,
                { color: formData.fuelType === fuel.id ? '#111827' : colors.text }
              ]}>
                {fuel.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transmission */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Transmission *</Text>
        <View style={styles.transmissionRow}>
          {TRANSMISSION_TYPES.map(trans => (
            <TouchableOpacity
              key={trans.id}
              style={[
                styles.transmissionCard,
                { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border },
                formData.transmission === trans.id && { borderColor: colors.primary, backgroundColor: isDark ? '#1F2937' : '#FEF3C7' }
              ]}
              onPress={() => updateField('transmission', trans.id)}
            >
              <View style={[styles.transmissionIcon, { backgroundColor: formData.transmission === trans.id ? colors.primary : (isDark ? '#374151' : '#E5E7EB') }]}>
                <Ionicons name={trans.icon as any} size={24} color={formData.transmission === trans.id ? '#111827' : colors.text} />
              </View>
              <Text style={[styles.transmissionName, { color: colors.text }]}>{trans.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Kilometers Driven */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Kilometers Driven</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: isDark ? colors.surface : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
          value={formData.mileage}
          onChangeText={(text) => updateField('mileage', text)}
          placeholder="e.g., 45000"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
        />
      </View>

      {/* Usage */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Usage</Text>
        <View style={styles.optionRow}>
          {[
            { id: 'personal', label: 'Personal' },
            { id: 'commercial', label: 'Commercial' },
          ].map(option => {
            const isSelected = formData.usage === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : isDark
                      ? colors.surface
                      : '#F3F4F6',
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => updateField('usage', option.id)}
              >
                <Text
                  style={[
                    styles.optionPillText,
                    { color: isSelected ? '#111827' : colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[
              styles.optionPill,
              {
                backgroundColor: isDark ? colors.surface : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
            onPress={() => updateField('usage', '')}
          >
            <Text style={[styles.optionPillText, { color: colors.textSecondary }]}>
              I’ll add later
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: hp(15) }} />
    </ScrollView>
  );

  // Step 3: Condition Check
  const renderStep3 = () => {
    const questions = [
      { key: 'accidentHistory', question: 'Has the car been in an accident?', icon: 'warning-outline' },
      { key: 'repaintedParts', question: 'Any parts repainted or replaced?', icon: 'color-palette-outline' },
      { key: 'engineIssues', question: 'Engine or transmission issues?', icon: 'construct-outline' },
      { key: 'floodDamage', question: 'Any flood damage history?', icon: 'water-outline' },
      { key: 'insuranceClaims', question: 'Insurance claims made?', icon: 'document-text-outline' },
    ];

    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.stepQuestion, { color: colors.text }]}>
          Let's verify the condition
        </Text>
        <Text style={[styles.stepHint, { color: colors.textSecondary }]}>
          Honest answers build buyer trust 💪
        </Text>

        {questions.map((q, index) => (
          <View
            key={q.key}
            style={[styles.conditionCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }]}
          >
            <View style={styles.conditionHeader}>
              <View style={[styles.conditionIconWrap, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                <Ionicons name={q.icon as any} size={20} color={colors.text} />
              </View>
              <Text style={[styles.conditionQuestion, { color: colors.text }]}>{q.question}</Text>
            </View>
            <View style={styles.conditionButtons}>
              {['Yes', 'No', 'Not Sure'].map(answer => {
                const value = answer === 'Yes' ? true : answer === 'No' ? false : null;
                const isSelected = formData[q.key as keyof FormData] === value;
                return (
                  <TouchableOpacity
                    key={answer}
                    style={[
                      styles.conditionButton,
                      { backgroundColor: isDark ? '#374151' : '#F3F4F6' },
                      isSelected && {
                        backgroundColor: answer === 'Yes' ? '#FEE2E2' : answer === 'No' ? '#D1FAE5' : '#FEF3C7',
                        borderColor: answer === 'Yes' ? '#EF4444' : answer === 'No' ? '#10B981' : '#F59E0B',
                        borderWidth: 1,
                      }
                    ]}
                    onPress={() => updateField(q.key as keyof FormData, value as any)}
                  >
                    <Text style={[
                      styles.conditionButtonText,
                      { color: colors.text },
                      isSelected && { fontWeight: '600' }
                    ]}>
                      {answer}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: hp(15) }} />
      </ScrollView>
    );
  };

  // Step 4: Pricing & Media
  const renderStep4 = () => {
    const registrationYearNumber = parseInt(formData.registrationYear || '0', 10);
    const mileageNumber = parseInt(formData.mileage || '0', 10);

    const getPriceSuggestion = () => {
      if (!registrationYearNumber || Number.isNaN(registrationYearNumber)) {
        return null;
      }

      const currentYear = new Date().getFullYear();
      const age = Math.max(0, currentYear - registrationYearNumber);

      let base = 300000;
      if (age <= 3) {
        base = 700000;
      } else if (age <= 7) {
        base = 500000;
      }

      if (mileageNumber && !Number.isNaN(mileageNumber)) {
        if (mileageNumber > 100000) {
          base *= 0.7;
        } else if (mileageNumber > 60000) {
          base *= 0.85;
        }
      }

      const min = Math.max(100000, Math.round(base * 0.9));
      const max = Math.round(base * 1.1);

      return {
        min: min.toLocaleString('en-IN'),
        max: max.toLocaleString('en-IN'),
      };
    };

    const suggestion = getPriceSuggestion();

    const autoDescriptionParts = [];
    const brandName = CAR_BRANDS.find(b => b.id === formData.brand)?.name;
    if (brandName || formData.model) {
      autoDescriptionParts.push(`${brandName || ''} ${formData.model || ''}`.trim());
    }
    if (formData.registrationYear) {
      autoDescriptionParts.push(`Registered in ${formData.registrationYear}`);
    }
    if (formData.mileage) {
      autoDescriptionParts.push(`${formData.mileage} km driven`);
    }
    if (formData.fuelType) {
      autoDescriptionParts.push(`${formData.fuelType.toUpperCase()} fuel`);
    }
    const autoDescription = autoDescriptionParts.length
      ? `${autoDescriptionParts.join(' • ')}. Well maintained, ready for a new owner.`
      : '';

    return (
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.stepQuestion, { color: colors.text }]}>
          Set your price and add photos
        </Text>
        <Text style={[styles.stepHint, { color: colors.textSecondary }]}>
          Great photos get 3x more inquiries!
        </Text>

        {/* Price Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Expected Price *</Text>
          <View style={[styles.priceInput, { backgroundColor: isDark ? colors.surface : '#F3F4F6', borderColor: colors.border }]}>
            <Text style={[styles.currencySymbol, { color: colors.text }]}>₹</Text>
            <TextInput
              style={[styles.priceTextInput, { color: colors.text }]}
              value={formData.price}
              onChangeText={(text) => updateField('price', text)}
              placeholder="e.g., 5,00,000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
          </View>
          {suggestion ? (
            <Text style={[styles.priceHint, { color: colors.textSecondary }]}>
              Suggested range: ₹{suggestion.min} – ₹{suggestion.max}
            </Text>
          ) : (
            <Text style={[styles.priceHint, { color: colors.textSecondary }]}>
              💡 Tip: Add registration year and mileage for a smarter suggestion
            </Text>
          )}
        </View>

      {/* Photo Upload */}
      <View style={styles.inputSection}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Car Photos</Text>
        <View style={styles.photoGrid}>
          {['Front View', 'Rear View', 'Interior', 'Dashboard', 'Engine'].map((label, index) => (
            <TouchableOpacity
              key={label}
              style={[styles.photoBox, { backgroundColor: isDark ? colors.surface : '#F3F4F6', borderColor: colors.border }]}
            >
              <Ionicons name="camera-outline" size={28} color={colors.primary} />
              <Text style={[styles.photoLabel, { color: colors.textSecondary }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

        {/* Description */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Description (Optional)</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: isDark ? colors.surface : '#F3F4F6', color: colors.text, borderColor: colors.border }]}
            value={formData.description}
            onChangeText={(text) => updateField('description', text)}
            placeholder={autoDescription || 'Add any additional details about your car...'}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Preview Card */}
        <View style={[styles.previewCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.previewTitle, { color: colors.text }]}>📋 Listing Preview</Text>
          <View style={styles.previewContent}>
            <Text style={[styles.previewCarName, { color: colors.text }]}>
              {brandName || 'Brand'} {formData.model || 'Model'}
            </Text>
            <Text style={[styles.previewVariant, { color: colors.textSecondary }]}>
              {formData.variant || 'Variant'} • {formData.registrationYear || 'Year'} • {formData.mileage ? `${formData.mileage} km` : 'Mileage'}
            </Text>
            <Text style={[styles.previewPrice, { color: colors.primary }]}>
              ₹{formData.price ? parseInt(formData.price, 10).toLocaleString('en-IN') : '0'}
            </Text>
          </View>
        </View>

        <View style={{ height: hp(15) }} />
      </ScrollView>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };

  // ============= MAIN RENDER =============

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add New Car</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Step Content */}
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {renderStepContent()}
      </KeyboardAvoidingView>

      {/* Bottom Action */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {currentStep < TOTAL_STEPS ? (
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: canProceed() ? colors.primary : (isDark ? '#374151' : '#D1D5DB') }
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={[styles.continueText, { color: canProceed() ? '#111827' : colors.textSecondary }]}>
              Continue
            </Text>
            <Ionicons name="arrow-forward" size={20} color={canProceed() ? '#111827' : colors.textSecondary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#111827" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#111827" />
                <Text style={styles.submitText}>Submit for Review</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderBottomWidth: 1,
  },
  backButton: {
    padding: scaleSize(4),
  },
  headerTitle: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '700',
  },
  closeButton: {
    padding: scaleSize(4),
  },

  // Progress
  progressContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
  },
  progressHeader: {
    marginBottom: getResponsiveSpacing('sm'),
  },
  progressText: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '500',
  },
  progressTitle: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '700',
    marginTop: scaleSize(2),
  },
  progressTrack: {
    height: scaleSize(4),
    borderRadius: scaleSize(2),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: scaleSize(2),
  },

  // Content
  contentContainer: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  stepQuestion: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '700',
    marginTop: getResponsiveSpacing('md'),
  },
  stepHint: {
    fontSize: getResponsiveTypography('sm'),
    marginTop: scaleSize(4),
    marginBottom: getResponsiveSpacing('lg'),
  },

  // Brand Grid
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('sm'),
  },
  brandCard: {
    width: (wp(100) - getResponsiveSpacing('lg') * 2 - getResponsiveSpacing('sm') * 4) / 5,
    aspectRatio: 1,
    borderRadius: getResponsiveBorderRadius('lg'),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaleSize(4),
  },
  brandEmoji: {
    fontSize: scaleSize(24),
    marginBottom: scaleSize(4),
  },
  brandName: {
    fontSize: getResponsiveTypography('xs'),
    fontWeight: '500',
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: scaleSize(4),
    right: scaleSize(4),
    width: scaleSize(16),
    height: scaleSize(16),
    borderRadius: scaleSize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Input Section
  inputSection: {
    marginTop: getResponsiveSpacing('lg'),
  },
  inputLabel: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
    marginBottom: scaleSize(8),
  },
  textInput: {
    borderWidth: 1,
    borderRadius: getResponsiveBorderRadius('lg'),
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    fontSize: getResponsiveTypography('md'),
  },
  textArea: {
    borderWidth: 1,
    borderRadius: getResponsiveBorderRadius('lg'),
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    fontSize: getResponsiveTypography('md'),
    minHeight: scaleSize(100),
  },

  // Color Grid
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('sm'),
  },
  colorChip: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: getResponsiveBorderRadius('full'),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Owner Grid
  ownerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('sm'),
  },
  ownerCard: {
    flex: 1,
    minWidth: (wp(100) - getResponsiveSpacing('lg') * 2 - getResponsiveSpacing('sm')) / 2 - 1,
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
    borderWidth: 1,
  },
  ownerLabel: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
  },
  ownerSublabel: {
    fontSize: getResponsiveTypography('xs'),
    marginTop: scaleSize(2),
  },

  // Option Row
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('sm'),
  },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: getResponsiveBorderRadius('full'),
    borderWidth: 1,
    gap: scaleSize(6),
  },
  optionPillText: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '500',
  },

  // Transmission
  transmissionRow: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('md'),
  },
  transmissionCard: {
    flex: 1,
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('xl'),
    borderWidth: 1,
    alignItems: 'center',
  },
  transmissionIcon: {
    width: scaleSize(48),
    height: scaleSize(48),
    borderRadius: getResponsiveBorderRadius('full'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scaleSize(8),
  },
  transmissionName: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
  },

  // Condition
  conditionCard: {
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('xl'),
    borderWidth: 1,
    marginBottom: getResponsiveSpacing('sm'),
  },
  conditionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  conditionIconWrap: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: getResponsiveBorderRadius('md'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getResponsiveSpacing('sm'),
  },
  conditionQuestion: {
    flex: 1,
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '500',
  },
  conditionButtons: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('sm'),
  },
  conditionButton: {
    flex: 1,
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: getResponsiveBorderRadius('md'),
    alignItems: 'center',
  },
  conditionButtonText: {
    fontSize: getResponsiveTypography('sm'),
  },

  // Price
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: getResponsiveBorderRadius('lg'),
    paddingHorizontal: getResponsiveSpacing('md'),
  },
  currencySymbol: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '700',
    marginRight: scaleSize(8),
  },
  priceTextInput: {
    flex: 1,
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '600',
    paddingVertical: getResponsiveSpacing('md'),
  },
  priceHint: {
    fontSize: getResponsiveTypography('xs'),
    marginTop: scaleSize(8),
  },

  // Photo Grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('sm'),
  },
  photoBox: {
    width: (wp(100) - getResponsiveSpacing('lg') * 2 - getResponsiveSpacing('sm') * 2) / 3,
    aspectRatio: 1,
    borderRadius: getResponsiveBorderRadius('lg'),
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {
    fontSize: getResponsiveTypography('xs'),
    marginTop: scaleSize(4),
    textAlign: 'center',
  },

  // Preview
  previewCard: {
    marginTop: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('xl'),
    borderWidth: 1,
  },
  previewTitle: {
    fontSize: getResponsiveTypography('sm'),
    fontWeight: '600',
    marginBottom: getResponsiveSpacing('sm'),
  },
  previewContent: {},
  previewCarName: {
    fontSize: getResponsiveTypography('lg'),
    fontWeight: '700',
  },
  previewVariant: {
    fontSize: getResponsiveTypography('sm'),
    marginTop: scaleSize(2),
  },
  previewPrice: {
    fontSize: getResponsiveTypography('xl'),
    fontWeight: '800',
    marginTop: scaleSize(8),
  },

  // Bottom Bar
  bottomBar: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderTopWidth: 1,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
    gap: scaleSize(8),
  },
  continueText: {
    fontSize: getResponsiveTypography('md'),
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: getResponsiveBorderRadius('lg'),
    gap: scaleSize(8),
  },
  submitText: {
    fontSize: getResponsiveTypography('md'),
    fontWeight: '600',
    color: '#111827',
  },
});

export default DealerAddCarScreen;
