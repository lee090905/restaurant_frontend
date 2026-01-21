import axiosClient from './axiosClient';

export interface UserCreateData {
  username: string;
  password: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserUpdateData {
  id: number;
  username?: string;
  password?: string;
  role?: string;
}

export const getUsers = async () => {
  const res = await axiosClient.get('/users');
  return res.data;
};

export const createUser = async (data: UserCreateData) => {
  const res = await axiosClient.post('/users', data);
  return res.data;
};

export const updateUser = async (data: UserUpdateData) => {
  const { id, ...payload } = data;
  const res = await axiosClient.put(`/users/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id: number) => {
  const res = await axiosClient.delete(`/users/${id}`);
  return res.data;
};
