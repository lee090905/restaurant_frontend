import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../axiosClient';
import { placeOrderLocal, addOrderItem } from '../../index';

// Mutation để gọi món (có hỗ trợ Optimistic Updates)
export const useAddItemsMutation = (tableId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, items }: { orderId: number | null; items: any[] }) => {
      let finalOrderId = orderId;
      const currentUserId = sessionStorage.getItem('userId');

      // Nếu chưa có orderId (bàn đang trống), tạo order mới
      if (!finalOrderId) {
        const res = await placeOrderLocal({
          userId: Number(currentUserId),
          table_id: tableId!,
          items: [],
        });
        finalOrderId = res.id;
      }

      // Đẩy tất cả các món lên server
      if (finalOrderId) {
        await Promise.all(
          items.map((item) =>
            addOrderItem({
              id: item.dish_id,
              order: finalOrderId!,
              dish: item.dish_id,
              quantity: item.quantity,
              price: item.price,
              status: 'pending',
              note: item.note,
            })
          )
        );
      }
      return finalOrderId;
    },
    onMutate: async ({ orderId, items }) => {
      if (!tableId) return;

      // Hủy bỏ các request đang fetch data để tránh ghi đè
      await queryClient.cancelQueries({ queryKey: ['order', tableId] });

      // Lấy dữ liệu cũ để fallback nếu lỗi
      const previousOrder = queryClient.getQueryData(['order', tableId]);

      // Optimistic Update: Thêm các items mới vào cache ngay lập tức
      queryClient.setQueryData(['order', tableId], (old: any) => {
        const currentItems = old?.items || [];
        // Map draft items thành dạng giống API response
        const newItems = items.map(i => ({
          id: Math.random(), // ID tạm thời
          dish_id: i.dish_id,
          name: i.name || i.dish_name,
          price: i.price,
          quantity: i.quantity,
          note: i.note,
          status: 'pending'
        }));
        
        return {
          ...old,
          id: orderId || old?.id || 9999, // ID tạm nếu tạo mới
          items: [...currentItems, ...newItems]
        };
      });

      return { previousOrder };
    },
    onError: (err, variables, context) => {
      // Nếu có lỗi, khôi phục lại dữ liệu cũ
      if (context?.previousOrder && tableId) {
        queryClient.setQueryData(['order', tableId], context.previousOrder);
      }
      alert('Có lỗi xảy ra khi gọi món, vui lòng thử lại!');
    },
    onSettled: () => {
      // Dù thành công hay thất bại, fetch lại dữ liệu thật từ server
      if (tableId) {
        queryClient.invalidateQueries({ queryKey: ['order', tableId] });
        queryClient.invalidateQueries({ queryKey: ['tables'] });
      }
    },
  });
};

// Mutation Hủy món - GỌI API THẬT
export const useCancelItemMutation = (tableId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { orderItemId: number, reason: string }) => {
      const res = await axiosClient.post('/orderitems/cancel', payload);
      return res.data;
    },
    onSettled: () => {
      if (tableId) {
        queryClient.invalidateQueries({ queryKey: ['order', tableId] });
      }
    }
  });
};

// Mutation Chuyển Bàn (Gộp / Tách) - GỌI API THẬT
export const useSplitMergeMutation = (currentTableId: number | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ mode, targetTableId, items }: any) => {
      if (mode === 'merge') {
        const res = await axiosClient.post('/orders/merge', {
          fromTableId: currentTableId,
          toTableId: targetTableId
        });
        return res.data;
      } else {
        const res = await axiosClient.post('/orders/split', {
          fromTableId: currentTableId,
          toTableId: targetTableId,
          items: items // mảng { dish_id, quantity }
        });
        return res.data;
      }
    },
    onSettled: (_, __, variables) => {
      if (currentTableId) queryClient.invalidateQueries({ queryKey: ['order', currentTableId] });
      if (variables.targetTableId) queryClient.invalidateQueries({ queryKey: ['order', variables.targetTableId] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    }
  });
};
