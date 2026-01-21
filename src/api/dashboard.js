import axiosClient from './axiosClient';
export const getRevenueByRange = (from, to) => {
    return axiosClient.get('/reports/revenue/range', {
        params: { from, to },
    });
};
export const getDishStatistics = () => {
    return axiosClient.get('/reports/menu');
};
export const getRevenueChart = () => {
    return axiosClient.get('/reports/revenue/chart');
};
export const getActiveDishes = async () => {
    const res = await axiosClient.get('/dishes');
    return res.data;
};
