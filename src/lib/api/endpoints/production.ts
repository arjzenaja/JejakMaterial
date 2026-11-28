import { apiClient } from '../client';
import type { ApiResponse, ProductionRecord } from '@/types';

export interface ProductionListParams {
  page?: number;
  per_page?: number;
  search?: string;
  process_code?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  from?: string;
  to?: string;
}

export interface ProductionInputPayload {
  material_id: number;
  quantity: number | string;
  unit_id: number;
  source_movement_line_id?: number | null;
}

export interface ProductionOutputPayload {
  output_name: string;
  output_type: 'product' | 'by_product' | 'waste';
  output_material_id?: number | null;
  quantity: number | string;
  unit_id: number;
}

export interface CreateProductionPayload {
  production_date: string;
  process_code: string;
  inputs: ProductionInputPayload[];
  outputs: ProductionOutputPayload[];
}

export interface UpdateProductionPayload {
  production_date?: string;
  process_code?: string;
  inputs?: ProductionInputPayload[];
  outputs?: ProductionOutputPayload[];
}

export const productionApi = {
  async list(params?: ProductionListParams): Promise<ApiResponse<ProductionRecord[]>> {
    return apiClient<ApiResponse<ProductionRecord[]>>('/production-records', {
      method: 'GET',
      params: params as Record<string, string | number | boolean>,
    });
  },

  async get(id: number | string): Promise<ApiResponse<ProductionRecord>> {
    return apiClient<ApiResponse<ProductionRecord>>(`/production-records/${id}`, {
      method: 'GET',
    });
  },

  async create(data: CreateProductionPayload): Promise<ApiResponse<ProductionRecord>> {
    return apiClient<ApiResponse<ProductionRecord>>('/production-records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number | string, data: UpdateProductionPayload): Promise<ApiResponse<ProductionRecord>> {
    return apiClient<ApiResponse<ProductionRecord>>(`/production-records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async finalize(id: number | string): Promise<ApiResponse<ProductionRecord>> {
    return apiClient<ApiResponse<ProductionRecord>>(`/production-records/${id}/finalize`, {
      method: 'POST',
    });
  },
};
