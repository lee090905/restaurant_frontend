import axiosClient from './axiosClient';

export interface DishDTO {
  id: number;
  name: string;
  price: number;
  category: string;
  active: boolean;
}

export const getActiveDishes = async (): Promise<DishDTO[]> => {
  const res = await axiosClient.get('/dishes');
  return res.data;
};

export const createDishes = async (data: {
  name: string;
  price: number;
  category: string;
}) => {
  const res = await axiosClient.post('/dishes', data);
  return res.data;
};

export const updateDishes = async (
  id: number,
  data: Partial<Omit<DishDTO, 'id'>>,
) => {
  const res = await axiosClient.put(`/dishes/${id}`, data);
  return res.data;
};

export const deleteDishes = async (id: number) => {
  const res = await axiosClient.delete(`/dishes/${id}`);
  return res.data;
};
