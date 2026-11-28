import { apiClient } from '../client';
import { ApiResponse } from '@/types';

export const dashboardApi = {
  summary: async () => {
    return apiClient<ApiResponse<any>>('/dashboard/summary', {
      method: 'GET',
    });
  },

  trends: async (params?: { days?: number }) => {
    return apiClient<ApiResponse<any>>('/dashboard/trends', {
      method: 'GET',
      params,
    });
  },
};
