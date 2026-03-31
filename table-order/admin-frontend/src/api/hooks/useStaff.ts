import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type { User, CreateStaffRequest, UpdateStaffRequest } from '../../types';

export function useStaff(storeId: string | null) {
  return useQuery<User[]>({
    queryKey: ['staff', storeId],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/staff', { params: { store_id: storeId } });
      return data;
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateStaffRequest) => {
      const { data } = await apiClient.post('/admin/staff', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, ...body }: UpdateStaffRequest & { userId: string }) => {
      const { data } = await apiClient.put(`/admin/staff/${userId}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/admin/staff/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}
