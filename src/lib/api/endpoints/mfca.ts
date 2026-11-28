import { apiClient } from '../client';
import { ApiResponse, MfcaAnalysis } from '@/types';

export const mfcaApi = {
  list: async (params?: { status?: string; page?: number }) => {
    return apiClient<ApiResponse<MfcaAnalysis[]>>('/mfca-analyses', {
      method: 'GET',
      params,
    });
  },

  get: async (id: number) => {
    return apiClient<ApiResponse<MfcaAnalysis>>(`/mfca-analyses/${id}`, {
      method: 'GET',
    });
  },

  run: async (data: {
    period_start: string;
    period_end: string;
    scope_type: string;
    scope_id?: number | null;
    method_version: string;
  }) => {
    return apiClient<ApiResponse<MfcaAnalysis>>('/mfca-analyses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
