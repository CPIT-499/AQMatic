import axiosInstance from '../axios/axiosInstance';

export const postAPI = async <T, U>(endpoint: string, data: U): Promise<T> => {
  const response = await axiosInstance.post<T>(endpoint, data);
  return response.data;
};