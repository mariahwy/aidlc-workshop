import { useMutation } from '@tanstack/react-query';
import apiClient from '../client';
import type { ImageUploadResponse } from '../../types';

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<ImageUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post('/admin/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
  });
}
