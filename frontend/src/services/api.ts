import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/authConfig';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }

        return response;
      },
      (error) => {
        console.error('API Error:', error);

        // Handle different error types
        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
            case 401:
              // Unauthorized - clear token and redirect to login
              localStorage.removeItem('authToken');
              if (window.location.pathname !== '/login') {
                toast.error('Session expired. Please login again.');
                window.location.href = '/login';
              }
              break;

            case 403:
              toast.error('Access denied. You don\'t have permission to perform this action.');
              break;

            case 404:
              if (!error.config.url?.includes('/health')) {
                toast.error('Resource not found.');
              }
              break;

            case 429:
              toast.error('Too many requests. Please slow down.');
              break;

            case 500:
              toast.error('Server error. Please try again later.');
              break;

            default:
              if (data?.error) {
                toast.error(data.error);
              } else {
                toast.error(`Request failed with status ${status}`);
              }
          }

          return Promise.reject({
            status,
            message: data?.error || 'Request failed',
            data,
          });
        } else if (error.request) {
          // Network error
          toast.error('Network error. Please check your connection.');
          return Promise.reject({
            status: 0,
            message: 'Network error',
            data: null,
          });
        } else {
          // Other error
          toast.error('An unexpected error occurred.');
          return Promise.reject({
            status: 0,
            message: error.message,
            data: null,
          });
        }
      }
    );
  }

  // Generic request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // File upload
  async uploadFile<T = any>(url: string, file: File, onUploadProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onUploadProgress) {
      config.onUploadProgress = (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        }
      };
    }

    const response = await this.api.post<T>(url, formData, config);
    return response.data;
  }

  // Download file
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.api.get(url, {
      responseType: 'blob',
    });

    // Create blob link to download
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Get filename from response headers or use provided filename
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition && contentDisposition.includes('filename=')) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      return await this.get('/health');
    } catch (error) {
      // Don't show toast for health check failures
      throw error;
    }
  }

  // Get raw axios instance for advanced usage
  getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

export const apiService = new ApiService();