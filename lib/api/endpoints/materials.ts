import { apiClient } from '../client';
import type { ApiResponse, Material, MaterialCategory, Unit } from '@/types';

export interface MaterialListParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number | string;
  is_active?: boolean | string;
}

export interface CreateMaterialPayload {
  code: string;
  name: string;
  category_id: number;
  base_unit_id: number;
  description?: string;
  is_active?: boolean;
}

export interface UpdateMaterialPayload {
  code?: string;
  name?: string;
  category_id?: number;
  base_unit_id?: number;
  description?: string;
  is_active?: boolean;
}

export const materialsApi = {
  async list(params?: MaterialListParams): Promise<ApiResponse<Material[]>> {
    return apiClient<ApiResponse<Material[]>>('/materials', {
      method: 'GET',
      params: params as Record<string, string | number | boolean>,
    });
  },

  async get(id: number | string): Promise<ApiResponse<Material>> {
    return apiClient<ApiResponse<Material>>(`/materials/${id}`, {
      method: 'GET',
    });
  },

  async create(data: CreateMaterialPayload): Promise<ApiResponse<Material>> {
    return apiClient<ApiResponse<Material>>('/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number | string, data: UpdateMaterialPayload): Promise<ApiResponse<Material>> {
    return apiClient<ApiResponse<Material>>(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deactivate(id: number | string): Promise<ApiResponse<Material>> {
    return apiClient<ApiResponse<Material>>(`/materials/${id}/deactivate`, {
      method: 'PATCH',
    });
  },

  async categories(): Promise<ApiResponse<MaterialCategory[]>> {
    return apiClient<ApiResponse<MaterialCategory[]>>('/materials/categories', {
      method: 'GET',
    });
  },

  async units(): Promise<ApiResponse<Unit[]>> {
    return apiClient<ApiResponse<Unit[]>>('/materials/units', {
      method: 'GET',
    });
  },
};

export const materialApi = materialsApi;
