import { apiClient } from '../client';
import { ApiResponse, AuditLog, Report } from '@/types';

export const reportApi = {
  list: async (params?: { report_type?: string; page?: number }) => {
    return apiClient<ApiResponse<Report[]>>('/reports', {
      method: 'GET',
      params,
    });
  },

  get: async (id: number) => {
    return apiClient<ApiResponse<Report>>(`/reports/${id}`, {
      method: 'GET',
    });
  },

  generate: async (data: { report_type: string; parameters?: Record<string, unknown> }) => {
    return apiClient<ApiResponse<Report>>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  auditLogs: async (params?: {
    action?: string;
    entity_type?: string;
    from?: string;
    to?: string;
    page?: number;
  }) => {
    return apiClient<ApiResponse<AuditLog[]>>('/audit-logs', {
      method: 'GET',
      params,
    });
  },
};
