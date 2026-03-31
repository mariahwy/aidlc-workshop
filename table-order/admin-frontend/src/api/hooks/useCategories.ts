import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryReorderRequest } from '../../types';

export function useCategories(storeId: string | null) {
  return useQuery<Category[]>({
    queryKey: ['categories', storeId],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/categories', { params: { store_id: storeId } });
      return data;
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateCategoryRequest) => {
      const { data } = await apiClient.post('/admin/categories', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ categoryId, ...body }: UpdateCategoryRequest & { categoryId: string }) => {
      const { data } = await apiClient.put(`/admin/categories/${categoryId}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      await apiClient.delete(`/admin/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CategoryReorderRequest) => {
      await apiClient.patch('/admin/categories/reorder', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
