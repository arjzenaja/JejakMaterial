import { apiClient, fetchCsrfCookie } from '../client';
import type { ApiResponse, User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
    await fetchCsrfCookie();
    return apiClient<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(): Promise<ApiResponse<null>> {
    return apiClient<ApiResponse<null>>('/auth/logout', {
      method: 'POST',
    });
  },

  async me(): Promise<ApiResponse<User>> {
    return apiClient<ApiResponse<User>>('/auth/me', {
      method: 'GET',
    });
  },
};
