import axiosInstance from '@/lib/axios/axiosInstance';
import { AxiosRequestConfig } from 'axios';

/**
 * Generic GET request handler using axios instance.
 * Accepts an optional config object for headers, params, etc.
 */
export async function getAPI<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await axiosInstance.get<T>(endpoint, config);
  return response.data;
}