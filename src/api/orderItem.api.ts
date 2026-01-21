import axiosClient from './axiosClient';

export interface AddOrderItemDTO {
  id: number;
  order: number;
  dish: number;
  quantity: number;
  price: number;
  status: string;
  note?: string;
}

export const addOrderItem = async (data: AddOrderItemDTO) => {
  const res = await axiosClient.post('/orderitems', data);
  return res.data;
};
