import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type { Table, OrderHistory, CreateTableRequest } from '../../types';

export function useTables(storeId: string | null) {
  return useQuery<Table[]>({
    queryKey: ['tables', storeId],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/tables', { params: { store_id: storeId } });
      return data;
    },
    enabled: !!storeId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateTableRequest) => {
      const { data } = await apiClient.post('/admin/tables', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}

export function useCompleteTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tableId: string) => {
      await apiClient.post(`/admin/tables/${tableId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useTableHistory(tableId: string | null, dateFrom?: string, dateTo?: string) {
  return useQuery<OrderHistory[]>({
    queryKey: ['tableHistory', tableId, dateFrom, dateTo],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/tables/${tableId}/history`, {
        params: { date_from: dateFrom, date_to: dateTo },
      });
      return data;
    },
    enabled: !!tableId,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
