import { apiClient } from '../client';
import type { ApiResponse, MaterialMovement, Location } from '@/types';

export interface MovementListParams {
  page?: number;
  per_page?: number;
  search?: string;
  movement_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  from?: string;
  to?: string;
}

export interface MovementLinePayload {
  material_id: number;
  quantity: number | string;
  unit_id: number;
  from_location_id?: number | null;
  to_location_id?: number | null;
  unit_cost?: number | string | null;
}

export interface CreateMovementPayload {
  movement_type: string;
  movement_date: string;
  reference_type?: string | null;
  reference_id?: number | null;
  lines: MovementLinePayload[];
}

export interface UpdateMovementPayload {
  movement_type?: string;
  movement_date?: string;
  lines?: MovementLinePayload[];
}

export const movementsApi = {
  async list(params?: MovementListParams): Promise<ApiResponse<MaterialMovement[]>> {
    return apiClient<ApiResponse<MaterialMovement[]>>('/material-movements', {
      method: 'GET',
      params: params as Record<string, string | number | boolean>,
    });
  },

  async get(id: number | string): Promise<ApiResponse<MaterialMovement>> {
    return apiClient<ApiResponse<MaterialMovement>>(`/material-movements/${id}`, {
      method: 'GET',
    });
  },

  async create(data: CreateMovementPayload): Promise<ApiResponse<MaterialMovement>> {
    return apiClient<ApiResponse<MaterialMovement>>('/material-movements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number | string, data: UpdateMovementPayload): Promise<ApiResponse<MaterialMovement>> {
    return apiClient<ApiResponse<MaterialMovement>>(`/material-movements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async post(id: number | string): Promise<ApiResponse<MaterialMovement>> {
    return apiClient<ApiResponse<MaterialMovement>>(`/material-movements/${id}/post`, {
      method: 'POST',
    });
  },

  async reverse(id: number | string): Promise<ApiResponse<MaterialMovement>> {
    return apiClient<ApiResponse<MaterialMovement>>(`/material-movements/${id}/reverse`, {
      method: 'POST',
    });
  },

  async locations(): Promise<ApiResponse<Location[]>> {
    return apiClient<ApiResponse<Location[]>>('/locations', {
      method: 'GET',
    });
  },
};

export const movementApi = movementsApi;
