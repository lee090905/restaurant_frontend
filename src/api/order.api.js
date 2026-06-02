import axiosClient from './axiosClient';
export const placeOrderLocal = async (data) => {
    const res = await axiosClient.post('/placeorderlocal', data);
    return res.data.data;
};
export const getOrders = async () => {
    const res = await axiosClient.get('/orders');
    return res.data;
};
export const deleteTable = async (id) => {
    const res = await axiosClient.delete(`/orders/${id}`);
    return res.data;
};
