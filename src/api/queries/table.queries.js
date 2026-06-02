import { useQuery } from '@tanstack/react-query';
import axiosClient from '../axiosClient';
// Lấy danh sách bàn, cấu hình polling mỗi 3s
export const useTablesQuery = () => {
    return useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            const res = await axiosClient.get('/tables');
            // format lại nếu cần
            return res.data.map((t) => ({
                ...t,
                area: Number(t.area),
            }));
        },
        refetchInterval: 3000, // Real-time polling
    });
};
// Lấy hóa đơn đang mở của 1 bàn
export const useTableOrderQuery = (tableId) => {
    return useQuery({
        queryKey: ['order', tableId],
        queryFn: async () => {
            if (!tableId)
                return null;
            try {
                const res = await axiosClient.get(`/orders/open-by-table/${tableId}`);
                return res.data;
            }
            catch (error) {
                // Có thể bàn này đang trống chưa có hóa đơn mở
                return null;
            }
        },
        enabled: !!tableId,
    });
};
