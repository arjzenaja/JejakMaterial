export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class ValidationError extends ApiError {
  errors: Record<string, string[]>;
  constructor(message: string, errors: Record<string, string[]>) {
    super(message, 422, errors);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AuthError extends ApiError {
  constructor(message: string = 'Sesi telah berakhir atau Anda belum login.') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

export class PermissionError extends ApiError {
  constructor(message: string = 'Anda tidak memiliki hak akses untuk tindakan ini.') {
    super(message, 403);
    this.name = 'PermissionError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Data tidak ditemukan.') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Terjadi kesalahan pada server backend.') {
    super(message, 500);
    this.name = 'ServerError';
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// For Laravel Sanctum CSRF cookie
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api(\/v\d+)?\/?$/, '');

let csrfFetched = false;

export async function fetchCsrfCookie(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch(`${BACKEND_ORIGIN}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
    });
    csrfFetched = true;
  } catch {
    // If backend doesn't have sanctum csrf-cookie or fails, continue gracefully
  }
}

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers = {}, ...rest } = options;

  let url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const xsrfToken = getCsrfTokenFromCookie();
  if (xsrfToken) {
    defaultHeaders['X-XSRF-TOKEN'] = xsrfToken;
  }

  const response = await fetch(url, {
    ...rest,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
  });

  let responseData: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      const text = await response.text();
      responseData = text ? { message: text } : null;
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    const message =
      responseData?.message ||
      `Permintaan gagal dengan status ${response.status} (${response.statusText})`;

    if (response.status === 401) {
      throw new AuthError(message);
    }
    if (response.status === 403) {
      throw new PermissionError(message);
    }
    if (response.status === 404) {
      throw new NotFoundError(message);
    }
    if (response.status === 422) {
      throw new ValidationError(message, responseData?.errors || {});
    }
    if (response.status >= 500) {
      throw new ServerError(message);
    }
    throw new ApiError(message, response.status, responseData);
  }

  // Response envelope unwrap: if response has { success: true, data: ... }
  return responseData as T;
}
