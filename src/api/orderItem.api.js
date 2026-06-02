import axiosClient from './axiosClient';
export const addOrderItem = async (data) => {
    const res = await axiosClient.post('/orderitems', data);
    return res.data;
};
