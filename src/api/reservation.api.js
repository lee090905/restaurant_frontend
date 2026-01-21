import axiosClient from './axiosClient';
export const createReservation = (data) => axiosClient.post('/reservations', data);
