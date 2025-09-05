/**
 * Comprehensive Form Components
 * Provides advanced form handling with validation, state management, and field helpers
 */

import React, { 
  memo, 
  useCallback, 
  useState, 
  useRef, 
  useEffect, 
  useMemo,
  createContext,
  useContext,
  ReactNode
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../theme';
import { 
  scale, 
  SPACING, 
  FONT_SIZES, 
  DIMENSIONS as RESPONSIVE_DIMENSIONS,
  useResponsive 
} from '../utils/responsive';
import { withPerformanceTracking } from '../utils/performance';
import { BaseInput, PasswordInput, SearchInput, InputRef } from './Input';
import { useNotification } from './Notification';

// Form validation utilities
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  email?: boolean;
  phone?: boolean;
  custom?: (value: any) => string | null;
}

export interface FieldConfig {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'phone' | 'number' | 'search' | 'textarea';
  placeholder?: string;
  validation?: ValidationRule;
  defaultValue?: any;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  options?: Array<{ label: string; value: any }>;
}

// Form context
interface FormContextType {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string | null) => void;
  setTouched: (name: string, touched: boolean) => void;
  validateField: (name: string, value: any) => string | null;
  submit: () => void;
  reset: () => void;
}

const FormContext = createContext<FormContextType | null>(null);

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

// Form validation utilities
export const validators = {
  required: (value: any): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return null;
  },

  minLength: (min: number) => (value: string): string | null => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max: number) => (value: string): string | null => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  },

  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  phone: (value: string): string | null => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  number: (value: any): string | null => {
    if (value !== undefined && value !== null && value !== '' && isNaN(Number(value))) {
      return 'Please enter a valid number';
    }
    return null;
  },

  min: (min: number) => (value: number): string | null => {
    if (value !== undefined && value !== null && value < min) {
      return `Must be at least ${min}`;
    }
    return null;
  },

  max: (max: number) => (value: number): string | null => {
    if (value !== undefined && value !== null && value > max) {
      return `Must be no more than ${max}`;
    }
    return null;
  },

  pattern: (pattern: RegExp, message: string) => (value: string): string | null => {
    if (value && !pattern.test(value)) {
      return message;
    }
    return null;
  },
};

// Field validation function
export const validateField = (value: any, rules: ValidationRule): string | null => {
  if (rules.required) {
    const error = validators.required(value);
    if (error) return error;
  }

  if (!value) return null; // Skip other validations if value is empty and not required

  if (rules.minLength) {
    const error = validators.minLength(rules.minLength)(value);
    if (error) return error;
  }

  if (rules.maxLength) {
    const error = validators.maxLength(rules.maxLength)(value);
    if (error) return error;
  }

  if (rules.email) {
    const error = validators.email(value);
    if (error) return error;
  }

  if (rules.phone) {
    const error = validators.phone(value);
    if (error) return error;
  }

  if (rules.pattern) {
    const error = validators.pattern(rules.pattern, 'Invalid format')(value);
    if (error) return error;
  }

  if (rules.min !== undefined) {
    const error = validators.min(rules.min)(Number(value));
    if (error) return error;
  }

  if (rules.max !== undefined) {
    const error = validators.max(rules.max)(Number(value));
    if (error) return error;
  }

  if (rules.custom) {
    const error = rules.custom(value);
    if (error) return error;
  }

  return null;
};

// Form Provider Component
interface FormProviderProps {
  children: ReactNode;
  initialValues?: Record<string, any>;
  validationSchema?: Record<string, ValidationRule>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  onValidate?: (values: Record<string, any>) => Record<string, string>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  initialValues = {},
  validationSchema = {},
  onSubmit,
  onValidate,
  validateOnChange = false,
  validateOnBlur = true,
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notification = useNotification();

  // Calculate if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Set field value
  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    if (validateOnChange) {
      const fieldRules = validationSchema[name];
      if (fieldRules) {
        const error = validateField(value, fieldRules);
        setErrors(prev => ({
          ...prev,
          [name]: error || '',
        }));
      }
    }
  }, [validationSchema, validateOnChange]);

  // Set field error
  const setError = useCallback((name: string, error: string | null) => {
    setErrors(prev => ({
      ...prev,
      [name]: error || '',
    }));
  }, []);

  // Set field touched
  const setTouched = useCallback((name: string, touchedValue: boolean) => {
    setTouchedState(prev => ({ ...prev, [name]: touchedValue }));

    if (validateOnBlur && touchedValue) {
      const fieldRules = validationSchema[name];
      if (fieldRules) {
        const error = validateField(values[name], fieldRules);
        setErrors(prev => ({
          ...prev,
          [name]: error || '',
        }));
      }
    }
  }, [validationSchema, validateOnBlur, values]);

  // Validate individual field
  const validateFieldValue = useCallback((name: string, value: any) => {
    const fieldRules = validationSchema[name];
    if (fieldRules) {
      return validateField(value, fieldRules);
    }
    return null;
  }, [validationSchema]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // Schema validation
    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(values[fieldName], validationSchema[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    // Custom validation
    if (onValidate) {
      const customErrors = onValidate(values);
      Object.assign(newErrors, customErrors);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationSchema, onValidate]);

  // Submit form
  const submit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const isFormValid = validateAll();
      
      if (!isFormValid) {
        notification.show({
          type: 'error',
          message: 'Please fix the errors in the form',
        });
        return;
      }

      await onSubmit(values);
      
      notification.show({
        type: 'success',
        message: 'Form submitted successfully',
      });
    } catch (error) {
      notification.show({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to submit form',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAll, onSubmit, notification]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  const contextValue: FormContextType = {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setError,
    setTouched,
    validateField: validateFieldValue,
    submit,
    reset,
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

// Field Component
interface FieldProps {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'phone' | 'number' | 'search';
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: 'outlined' | 'filled' | 'underlined';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  
  // Password specific
  showPasswordStrength?: boolean;
  
  // Search specific
  onClear?: () => void;
}

const FieldComponent: React.FC<FieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  helperText,
  disabled = false,
  required = false,
  variant = 'outlined',
  size = 'medium',
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  showPasswordStrength = false,
  onClear,
}) => {
  const form = useForm();
  const inputRef = useRef<InputRef>(null);

  const value = form.values[name] || '';
  const error = form.errors[name];
  const touched = form.touched[name];

  const handleChangeText = useCallback((text: string) => {
    form.setValue(name, text);
  }, [form, name]);

  const handleBlur = useCallback(() => {
    form.setTouched(name, true);
  }, [form, name]);

  const finalLabel = required && label ? `${label} *` : label;
  const displayError = touched ? error : undefined;

  // Render appropriate input based on type
  const renderInput = () => {
    const commonProps = {
      value,
      onChangeText: handleChangeText,
      onBlur: handleBlur,
      label: finalLabel,
      placeholder,
      error: displayError,
      helperText: displayError ? undefined : helperText,
      disabled: disabled || form.isSubmitting,
      variant,
      size,
      leftIcon,
      rightIcon,
      onRightIconPress,
      style,
      ref: inputRef,
    };

    switch (type) {
      case 'password':
        return (
          <PasswordInput
            {...commonProps}
            showPasswordStrength={showPasswordStrength}
          />
        );

      case 'search':
        return (
          <SearchInput
            {...commonProps}
            onClear={onClear}
          />
        );

      case 'email':
        return (
          <BaseInput
            {...commonProps}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCompleteType="email"
            leftIcon={leftIcon || 'email'}
          />
        );

      case 'phone':
        return (
          <BaseInput
            {...commonProps}
            keyboardType="phone-pad"
            autoCompleteType="tel"
            leftIcon={leftIcon || 'phone'}
          />
        );

      case 'number':
        return (
          <BaseInput
            {...commonProps}
            keyboardType="numeric"
          />
        );

      default:
        return <BaseInput {...commonProps} />;
    }
  };

  return renderInput();
};

// Form Component
interface FormProps {
  children: ReactNode;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  initialValues?: Record<string, any>;
  validationSchema?: Record<string, ValidationRule>;
  style?: ViewStyle;
  scrollEnabled?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

const FormComponent: React.FC<FormProps> = ({
  children,
  onSubmit,
  initialValues,
  validationSchema,
  style,
  scrollEnabled = true,
  keyboardShouldPersistTaps = 'handled',
}) => {
  const Container = scrollEnabled ? ScrollView : View;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.formContainer, style]}
    >
      <FormProvider
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Container
          style={styles.formContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        >
          {children}
        </Container>
      </FormProvider>
    </KeyboardAvoidingView>
  );
};

// Submit Button Component
interface SubmitButtonProps {
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
}

const SubmitButtonComponent: React.FC<SubmitButtonProps> = ({
  title = 'Submit',
  loading: externalLoading,
  disabled: externalDisabled,
  style,
  variant = 'filled',
  size = 'medium',
  icon,
}) => {
  const { colors } = useTheme();
  const form = useForm();

  const isLoading = externalLoading || form.isSubmitting;
  const isDisabled = externalDisabled || !form.isValid || isLoading;

  const handlePress = useCallback(() => {
    if (!isDisabled) {
      form.submit();
    }
  }, [form, isDisabled]);

  const getButtonStyles = () => {
    const baseStyle = {
      paddingHorizontal: size === 'small' ? SPACING.md : size === 'large' ? SPACING.xl : SPACING.lg,
      paddingVertical: size === 'small' ? SPACING.sm : size === 'large' ? SPACING.lg : SPACING.md,
      borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: size === 'small' ? scale(36) : size === 'large' ? scale(56) : scale(48),
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: isDisabled ? colors.surfaceDisabled : colors.primary,
          elevation: isDisabled ? 0 : 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDisabled ? 0 : 0.1,
          shadowRadius: 4,
        };

      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isDisabled ? colors.border : colors.primary,
        };

      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          paddingHorizontal: SPACING.md,
        };

      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    if (isDisabled) {
      return colors.textDisabled;
    }

    switch (variant) {
      case 'filled':
        return colors.onPrimary;
      case 'outlined':
      case 'text':
        return colors.primary;
      default:
        return colors.text;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={handlePress}
      disabled={isDisabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
    >
      {icon && !isLoading && (
        <Icon
          name={icon}
          size={scale(size === 'small' ? 16 : size === 'large' ? 24 : 20)}
          color={getTextColor()}
          style={styles.buttonIcon}
        />
      )}
      
      {isLoading && (
        <View style={styles.buttonIcon}>
          {/* Loading indicator would go here */}
          <Icon
            name="hourglass-empty"
            size={scale(size === 'small' ? 16 : size === 'large' ? 24 : 20)}
            color={getTextColor()}
          />
        </View>
      )}
      
      <Text
        style={[
          styles.buttonText,
          {
            color: getTextColor(),
            fontSize: size === 'small' ? FONT_SIZES.sm : size === 'large' ? FONT_SIZES.lg : FONT_SIZES.md,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Reset Button Component
interface ResetButtonProps {
  title?: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

const ResetButtonComponent: React.FC<ResetButtonProps> = ({
  title = 'Reset',
  onPress,
  style,
  variant = 'text',
  size = 'medium',
}) => {
  const { colors } = useTheme();
  const form = useForm();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      form.reset();
    }
  }, [form, onPress]);

  return (
    <TouchableOpacity
      style={[
        styles.resetButton,
        {
          paddingHorizontal: size === 'small' ? SPACING.md : size === 'large' ? SPACING.xl : SPACING.lg,
          paddingVertical: size === 'small' ? SPACING.sm : size === 'large' ? SPACING.lg : SPACING.md,
        },
        style,
      ]}
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text
        style={[
          styles.resetButtonText,
          {
            color: colors.textSecondary,
            fontSize: size === 'small' ? FONT_SIZES.sm : size === 'large' ? FONT_SIZES.lg : FONT_SIZES.md,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
  },
  formContent: {
    flex: 1,
    padding: SPACING.md,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  resetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RESPONSIVE_DIMENSIONS.borderRadius.medium,
  },
  resetButtonText: {
    fontWeight: '500',
    textAlign: 'center',
  },
});

// Memoized exports
export const Form = memo(withPerformanceTracking(FormComponent, 'Form'));
export const Field = memo(withPerformanceTracking(FieldComponent, 'Field'));
export const SubmitButton = memo(withPerformanceTracking(SubmitButtonComponent, 'SubmitButton'));
export const ResetButton = memo(withPerformanceTracking(ResetButtonComponent, 'ResetButton'));

// Display names
Form.displayName = 'Form';
Field.displayName = 'Field';
SubmitButton.displayName = 'SubmitButton';
ResetButton.displayName = 'ResetButton';

// Export hook and utilities
export { useForm, validators, validateField };
export default Form;
