import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest, ReorderRequest } from '../../types';

export function useMenuItems(storeId: string | null, categoryId?: string | null) {
  return useQuery<MenuItem[]>({
    queryKey: ['menus', storeId, categoryId],
    queryFn: async () => {
      const params: Record<string, string> = { store_id: storeId! };
      if (categoryId) params.category_id = categoryId;
      const { data } = await apiClient.get('/admin/menus', { params });
      return data;
    },
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateMenuItemRequest) => {
      const { data } = await apiClient.post('/admin/menus', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ menuId, ...body }: UpdateMenuItemRequest & { menuId: string }) => {
      const { data } = await apiClient.put(`/admin/menus/${menuId}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (menuId: string) => {
      await apiClient.delete(`/admin/menus/${menuId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}

export function useReorderMenuItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ReorderRequest) => {
      await apiClient.patch('/admin/menus/reorder', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
  });
}
