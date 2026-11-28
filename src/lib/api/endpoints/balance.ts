import { apiClient } from '../client';
import { ApiResponse, MaterialBalance } from '@/types';

export const balanceApi = {
  list: async (params?: {
    material_id?: number;
    location_id?: number;
    from?: string;
    to?: string;
  }) => {
    return apiClient<ApiResponse<MaterialBalance[]>>('/material-balances', {
      method: 'GET',
      params,
    });
  },

  ledger: async (
    materialId: number,
    params?: { location_id?: number; from?: string; to?: string }
  ) => {
    return apiClient<ApiResponse<any[]>>(
      `/material-balances/${materialId}/ledger`,
      {
        method: 'GET',
        params,
      }
    );
  },
};
