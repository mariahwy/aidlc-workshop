import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type { Store, CreateStoreRequest, UpdateStoreRequest } from '../../types';

export function useStores() {
  return useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/stores');
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateStoreRequest) => {
      const { data } = await apiClient.post('/admin/stores', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storeId, ...body }: UpdateStoreRequest & { storeId: string }) => {
      const { data } = await apiClient.put(`/admin/stores/${storeId}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (storeId: string) => {
      await apiClient.delete(`/admin/stores/${storeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}
