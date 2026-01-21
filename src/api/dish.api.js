import axiosClient from './axiosClient';
export const getActiveDishes = async () => {
    const res = await axiosClient.get('/dishes');
    return res.data;
};
export const createDishes = async (data) => {
    const res = await axiosClient.post('/dishes', data);
    return res.data;
};
export const updateDishes = async (id, data) => {
    const res = await axiosClient.put(`/dishes/${id}`, data);
    return res.data;
};
export const deleteDishes = async (id) => {
    const res = await axiosClient.delete(`/dishes/${id}`);
    return res.data;
};
