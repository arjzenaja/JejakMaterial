import { apiClient } from '../client';
import { ApiResponse, MaterialFlow, MaterialLoss } from '@/types';

export const flowApi = {
  list: async (params?: { from?: string; to?: string; process_code?: string; page?: number }) => {
    return apiClient<ApiResponse<MaterialFlow[]>>('/material-flows', {
      method: 'GET',
      params,
    });
  },

  get: async (id: number) => {
    return apiClient<ApiResponse<any>>(`/material-flows/${id}`, {
      method: 'GET',
    });
  },

  losses: async (params?: { from?: string; to?: string; page?: number }) => {
    return apiClient<ApiResponse<MaterialLoss[]>>('/material-losses', {
      method: 'GET',
      params,
    });
  },
};
