import axiosClient from './axiosClient';
export const getTables = async () => {
    const res = await axiosClient.get('/tables');
    return res.data;
};
export const createTable = async (data) => {
    const res = await axiosClient.post('/tables', data);
    return res.data;
};
export const updateTable = async (id, data) => {
    const res = await axiosClient.put(`/tables/${id}`, data);
    return res.data;
};
export const deleteTable = async (id) => {
    const res = await axiosClient.delete(`/tables/${id}`);
    return res.data;
};
