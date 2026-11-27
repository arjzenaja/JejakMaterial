import { apiClient } from '../client';
import { ApiResponse, Role, User } from '@/types';

export const settingsApi = {
  users: async (params?: { search?: string; page?: number }) => {
    return apiClient<ApiResponse<User[]>>('/users', {
      method: 'GET',
      params,
    });
  },

  createUser: async (data: any) => {
    return apiClient<ApiResponse<User>>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getUser: async (id: number) => {
    return apiClient<ApiResponse<User>>(`/users/${id}`, {
      method: 'GET',
    });
  },

  updateUser: async (id: number, data: any) => {
    return apiClient<ApiResponse<User>>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  roles: async () => {
    return apiClient<ApiResponse<{ roles: Role[]; available_permissions: any[] }>>('/roles', {
      method: 'GET',
    });
  },

  createRole: async (data: { name: string; code: string; permission_ids?: number[] }) => {
    return apiClient<ApiResponse<Role>>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRole: async (id: number, data: { name?: string; permission_ids?: number[] }) => {
    return apiClient<ApiResponse<Role>>(`/roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getSettings: async () => {
    return apiClient<ApiResponse<any>>('/settings', {
      method: 'GET',
    });
  },

  updateSettings: async (data: { name?: string; timezone?: string }) => {
    return apiClient<ApiResponse<any>>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
