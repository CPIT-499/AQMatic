import axiosInstance from '../axios/axiosInstance';

export const getAPI = async <T>(endpoint: string): Promise<T> => {
  const response = await axiosInstance.get<T>(endpoint);
  return response.data;
};