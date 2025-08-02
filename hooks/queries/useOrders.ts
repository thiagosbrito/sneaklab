"use client";

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrderAction, updateOrderStatusAction, getUserOrdersAction } from '@/lib/actions/order-actions';
import { CreateOrderData } from '@/utils/orders';
import type { Order } from '@/db/schema';

// Server Action result types
interface ServerActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Create order mutation using Server Actions
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const result = await createOrderAction(orderData);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create order');
      }
      return result;
    },
    onSuccess: (data) => {
      // Invalidate user orders query to refetch after successful creation
      queryClient.invalidateQueries({ queryKey: ['orders', 'user'] });
      
      // If we have the created order, add it to the cache optimistically
      if (data.data) {
        queryClient.setQueryData(
          ['orders', 'user'], 
          (oldData: ServerActionResult<Order[]> | undefined) => {
            if (!oldData?.data) return oldData;
            return {
              ...oldData,
              data: [data.data!, ...oldData.data]
            };
          }
        );
      }
    },
    onError: (error: Error) => {
      console.error('Order creation failed:', error);
    }
  });
}

// Update order status mutation (admin only)
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status,
      notes 
    }: { 
      orderId: string; 
      status: string;
      notes?: string;
    }) => {
      const result = await updateOrderStatusAction(orderId, status, notes);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update order status');
      }
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'user'] });
      
      // Update specific order in cache if we have the updated data
      if (data.data) {
        queryClient.setQueryData(['order', variables.orderId], data.data);
      }
    },
    onError: (error: Error) => {
      console.error('Order status update failed:', error);
    }
  });
}

// Get user orders query using Server Actions
export function useUserOrders() {
  return useQuery({
    queryKey: ['orders', 'user'],
    queryFn: async () => {
      const result = await getUserOrdersAction();
      if (!result.success) {
        throw new Error(result.error || 'Failed to get orders');
      }
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - orders can change frequently
    gcTime: 5 * 60 * 1000,    // 5 minutes
    retry: (failureCount, error: Error) => {
      // Don't retry on auth errors
      if (error.message.includes('Authentication required')) return false;
      return failureCount < 2;
    },
  });
}

// Helper hook to get user orders state in a unified way
export function useUserOrdersState() {
  const { data, isLoading, error, isError } = useUserOrders();
  
  return {
    orders: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    unauthorized: error?.message?.includes('Authentication required') || false,
  };
}