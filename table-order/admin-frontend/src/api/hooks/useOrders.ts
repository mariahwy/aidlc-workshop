import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type { Order, UpdateOrderStatusRequest } from '../../types';

export function useOrders(storeId: string | null) {
  return useQuery<Order[]>({
    queryKey: ['orders', storeId],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/orders', { params: { store_id: storeId } });
      return data;
    },
    enabled: !!storeId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, ...body }: UpdateOrderStatusRequest & { orderId: string }) => {
      const { data } = await apiClient.patch(`/admin/orders/${orderId}/status`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      await apiClient.delete(`/admin/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
