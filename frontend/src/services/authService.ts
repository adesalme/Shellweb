import { apiService } from './api';
import { LoginRequest, AzureAuthRequest, AuthResponse, ApiResponse, User } from '../types';

class AuthService {
  // Local authentication
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/auth/login', credentials);
  }

  // Azure AD authentication
  async verifyAzureToken(request: AzureAuthRequest): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/auth/azure/verify', request);
  }

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return await apiService.get<ApiResponse<User>>('/auth/me');
  }

  // Refresh token (if implemented)
  async refreshToken(): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/auth/refresh');
  }

  // Logout (server-side cleanup if needed)
  async logout(): Promise<ApiResponse> {
    return await apiService.post<ApiResponse>('/auth/logout');
  }
}

export const authService = new AuthService();