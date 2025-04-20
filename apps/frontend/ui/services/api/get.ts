import axiosInstance from '@/lib/axios/axiosInstance';

export async function getAPI<T>(endpoint: string): Promise<T> {
  const response = await axiosInstance.get<T>(endpoint);
  return response.data;
}