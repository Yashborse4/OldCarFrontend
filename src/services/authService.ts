import { apiClient } from './ApiClient';
import { ApiError } from './ApiClient';

// Separate authentication service with dedicated endpoints

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirm {
  email: string;
  otp: string;
}

export interface OtpLoginCredentials {
  email: string;
  otp: string;
}

/**
 * Standard login with username/email and password
 * Endpoint: POST /api/auth/login
 */
export async function loginWithPassword(credentials: LoginCredentials) {
  return await apiClient.login(credentials);
}

/**
 * Request email verification OTP
 * Endpoint: POST /api/auth/request-email-verification
 */
export async function requestEmailVerification(request: EmailVerificationRequest): Promise<void> {
  try {
    await apiClient.sendOtp(request.email, 'EMAIL_VERIFICATION');
  } catch (error) {
    console.error('Failed to request email verification:', error);
    throw error;
  }
}

/**
 * Verify email with OTP
 * Endpoint: POST /api/auth/verify-email-otp
 */
export async function verifyEmailOtp(verification: EmailVerificationConfirm) {
  try {
    const authData = await apiClient.verifyOtp(verification.email, verification.otp, 'EMAIL_VERIFICATION');
    return authData;
  } catch (error) {
    console.error('Failed to verify email OTP:', error);
    throw error;
  }
}

/**
 * Login with OTP (passwordless login)
 * Endpoint: POST /api/auth/login-otp
 */
export async function loginWithOtp(credentials: OtpLoginCredentials) {
  try {
    const authData = await apiClient.verifyOtp(credentials.email, credentials.otp, 'LOGIN');
    return authData;
  } catch (error) {
    console.error('Failed to login with OTP:', error);
    throw error;
  }
}

/**
 * Request password reset OTP
 * Endpoint: POST /api/auth/request-password-reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await apiClient.forgotPassword(email);
  } catch (error) {
    console.error('Failed to request password reset:', error);
    throw error;
  }
}

/**
 * Reset password with OTP
 * Endpoint: POST /api/auth/reset-password-otp
 */
export async function resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<void> {
  try {
    await apiClient.resetPassword({
      username: email,
      otp: otp,
      newPassword: newPassword
    });
  } catch (error) {
    console.error('Failed to reset password with OTP:', error);
    throw error;
  }
}

// Export the new auth service
export const authService = {
  loginWithPassword,
  requestEmailVerification,
  verifyEmailOtp,
  loginWithOtp,
  requestPasswordReset,
  resetPasswordWithOtp
};

export default authService;