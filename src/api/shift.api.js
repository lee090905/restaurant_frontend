import axiosClient from './axiosClient';
export const handleShift = async (username) => {
    const res = await axiosClient.post('/shift', {
        username,
    });
    return res.data;
};
export const getCurrentShift = async () => {
    const res = await axiosClient.get('/workshifts');
    return res.data;
};
