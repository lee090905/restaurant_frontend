import axiosClient from './axiosClient';

export const login = (data: { username: string; password: string }) =>
  axiosClient.post('/login', data);
