import axios from 'axios';

// IMPORTANT: Replace with your actual backend API URL
const API_URL = 'http://172.27.96.1:9000';

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
}

export const loginUser = async (credentials: { usernameOrEmail: string; password: string }): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      usernameOrEmail: credentials.usernameOrEmail,
      password: credentials.password
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 400) {
        throw new Error('Invalid username or password');
      }
      throw new Error(error.response.data?.message || 'Login failed. Please try again.');
    } else if (error.request) {
      throw new Error('Unable to connect to the server. Please check your connection.');
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const registerUser = async (registerRequest: any) => {
  try {
    console.log('Making register request to:', `${API_URL}/api/auth/register`);
    console.log('Request data:', registerRequest);
    
    const response = await axios.post(`${API_URL}/api/auth/register`, registerRequest);
    console.log('Register response:', response.data);
    return response.data;
  } catch (error: any) {
    console.log('Register error:', error);
    console.log('Error response:', error.response?.data);
    console.log('Error status:', error.response?.status);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     `Registration failed with status ${error.response.status}`;
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to the server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

export const forgotPassword = async (forgotPasswordRequest: any) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/reset-password`, forgotPasswordRequest);
    return response.data;
  } catch (error) {
    throw error;
  }
};


