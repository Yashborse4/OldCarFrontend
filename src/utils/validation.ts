/**
 * Comprehensive validation utility for forms and user inputs
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation regex - at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Username validation regex - alphanumeric and underscore, 3-30 chars
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

// Phone number validation regex (supports various formats)
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

/**
 * Validate email address
 */
export const validateEmail = (email: string): FieldValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): FieldValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (
  password: string, 
  confirmPassword: string
): FieldValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Password confirmation is required' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
};

/**
 * Validate username
 */
export const validateUsername = (username: string): FieldValidationResult => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 30) {
    return { isValid: false, error: 'Username must be no more than 30 characters long' };
  }
  
  if (!USERNAME_REGEX.test(username)) {
    return { 
      isValid: false, 
      error: 'Username can only contain letters, numbers, and underscores' 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string): FieldValidationResult => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
};

/**
 * Validate name (first name, last name)
 */
export const validateName = (name: string, fieldName: string): FieldValidationResult => {
  const requiredResult = validateRequired(name, fieldName);
  if (!requiredResult.isValid) {
    return requiredResult;
  }
  
  if (name.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: `${fieldName} must be no more than 50 characters long` };
  }
  
  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-\']+$/;
  if (!nameRegex.test(name)) {
    return { 
      isValid: false, 
      error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (phone: string): FieldValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d\+]/g, '');
  
  if (!PHONE_REGEX.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true };
};

/**
 * Validate OTP code
 */
export const validateOTP = (otp: string): FieldValidationResult => {
  if (!otp) {
    return { isValid: false, error: 'OTP is required' };
  }
  
  if (!/^\d{6}$/.test(otp)) {
    return { isValid: false, error: 'OTP must be 6 digits' };
  }
  
  return { isValid: true };
};

/**
 * Vehicle-specific validations
 */

export const validateVehicleMake = (make: string): FieldValidationResult => {
  return validateRequired(make, 'Vehicle make');
};

export const validateVehicleModel = (model: string): FieldValidationResult => {
  return validateRequired(model, 'Vehicle model');
};

export const validateVehicleYear = (year: number | string): FieldValidationResult => {
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
  
  if (!yearNum) {
    return { isValid: false, error: 'Vehicle year is required' };
  }
  
  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  
  if (yearNum < minYear || yearNum > currentYear + 1) {
    return { 
      isValid: false, 
      error: `Vehicle year must be between ${minYear} and ${currentYear + 1}` 
    };
  }
  
  return { isValid: true };
};

export const validateVehiclePrice = (price: number | string): FieldValidationResult => {
  const priceNum = typeof price === 'string' ? parseFloat(price) : price;
  
  if (!priceNum || priceNum <= 0) {
    return { isValid: false, error: 'Please enter a valid price' };
  }
  
  if (priceNum > 10000000) { // 10 million max
    return { isValid: false, error: 'Price seems too high. Please check and try again' };
  }
  
  return { isValid: true };
};

export const validateVehicleMileage = (mileage: number | string): FieldValidationResult => {
  const mileageNum = typeof mileage === 'string' ? parseFloat(mileage) : mileage;
  
  if (mileageNum < 0) {
    return { isValid: false, error: 'Mileage cannot be negative' };
  }
  
  if (mileageNum > 1000000) { // 1 million miles max
    return { isValid: false, error: 'Mileage seems too high. Please check and try again' };
  }
  
  return { isValid: true };
};

/**
 * Validate registration form
 */
export const validateRegistrationForm = (formData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  // Validate username
  const usernameResult = validateUsername(formData.username);
  if (!usernameResult.isValid) {
    errors.push(usernameResult.error!);
  }
  
  // Validate email
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.push(emailResult.error!);
  }
  
  // Validate password
  const passwordResult = validatePassword(formData.password);
  if (!passwordResult.isValid) {
    errors.push(passwordResult.error!);
  }
  
  // Validate password confirmation
  const confirmPasswordResult = validatePasswordConfirmation(
    formData.password, 
    formData.confirmPassword
  );
  if (!confirmPasswordResult.isValid) {
    errors.push(confirmPasswordResult.error!);
  }
  
  // Validate optional fields if provided
  if (formData.firstName) {
    const firstNameResult = validateName(formData.firstName, 'First name');
    if (!firstNameResult.isValid) {
      errors.push(firstNameResult.error!);
    }
  }
  
  if (formData.lastName) {
    const lastNameResult = validateName(formData.lastName, 'Last name');
    if (!lastNameResult.isValid) {
      errors.push(lastNameResult.error!);
    }
  }
  
  if (formData.phoneNumber) {
    const phoneResult = validatePhoneNumber(formData.phoneNumber);
    if (!phoneResult.isValid) {
      errors.push(phoneResult.error!);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate login form
 */
export const validateLoginForm = (formData: {
  usernameOrEmail: string;
  password: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  // Validate username or email
  if (!formData.usernameOrEmail) {
    errors.push('Username or email is required');
  }
  
  // Validate password
  if (!formData.password) {
    errors.push('Password is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate vehicle form
 */
export const validateVehicleForm = (formData: {
  make: string;
  model: string;
  year: number | string;
  price: number | string;
  mileage?: number | string;
  location: string;
  condition: string;
}): ValidationResult => {
  const errors: string[] = [];
  
  // Validate make
  const makeResult = validateVehicleMake(formData.make);
  if (!makeResult.isValid) {
    errors.push(makeResult.error!);
  }
  
  // Validate model
  const modelResult = validateVehicleModel(formData.model);
  if (!modelResult.isValid) {
    errors.push(modelResult.error!);
  }
  
  // Validate year
  const yearResult = validateVehicleYear(formData.year);
  if (!yearResult.isValid) {
    errors.push(yearResult.error!);
  }
  
  // Validate price
  const priceResult = validateVehiclePrice(formData.price);
  if (!priceResult.isValid) {
    errors.push(priceResult.error!);
  }
  
  // Validate mileage (if provided)
  if (formData.mileage !== undefined && formData.mileage !== '') {
    const mileageResult = validateVehicleMileage(formData.mileage);
    if (!mileageResult.isValid) {
      errors.push(mileageResult.error!);
    }
  }
  
  // Validate location
  const locationResult = validateRequired(formData.location, 'Location');
  if (!locationResult.isValid) {
    errors.push(locationResult.error!);
  }
  
  // Validate condition
  const conditionResult = validateRequired(formData.condition, 'Condition');
  if (!conditionResult.isValid) {
    errors.push(conditionResult.error!);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Utility function to get first validation error
 */
export const getFirstError = (validationResult: ValidationResult): string | undefined => {
  return validationResult.errors.length > 0 ? validationResult.errors[0] : undefined;
};

/**
 * Utility function to format validation errors for display
 */
export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
};


