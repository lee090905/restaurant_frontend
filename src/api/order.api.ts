import axiosClient from './axiosClient';

export interface OrderDTO {
  id: number;
  table: number;
  workshift?: number;
  openedAt: Date;
  closedAt?: Date;
  status: string;
  note?: string;
}

export interface PlaceOrderItemDTO {
  dish_id: number;
  quantity: number;
  note?: string;
}

export interface PlaceOrderLocalDTO {
  userId: number;
  table_id: number;
  items: PlaceOrderItemDTO[];
}

export interface PlaceOrderResult {
  id: number;
}

export const placeOrderLocal = async (
  data: PlaceOrderLocalDTO,
): Promise<PlaceOrderResult> => {
  const res = await axiosClient.post('/placeorderlocal', data);
  return res.data.data;
};
export const getOrders = async (): Promise<OrderDTO[]> => {
  const res = await axiosClient.get('/orders');
  return res.data;
};

export const deleteTable = async (id: number) => {
  const res = await axiosClient.delete(`/orders/${id}`);
  return res.data;
};
