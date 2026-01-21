import axiosClient from './axiosClient';
export const getUsers = async () => {
    const res = await axiosClient.get('/users');
    return res.data;
};
export const createUser = async (data) => {
    const res = await axiosClient.post('/users', data);
    return res.data;
};
export const updateUser = async (data) => {
    const { id, ...payload } = data;
    const res = await axiosClient.put(`/users/${id}`, payload);
    return res.data;
};
export const deleteUser = async (id) => {
    const res = await axiosClient.delete(`/users/${id}`);
    return res.data;
};
