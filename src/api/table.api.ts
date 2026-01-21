import axiosClient from './axiosClient';

export interface TableDTO {
  id: number;
  name: string;
  status: string;
  area: number;
}

export const getTables = async (): Promise<TableDTO[]> => {
  const res = await axiosClient.get('/tables');
  return res.data;
};

export const createTable = async (data: { name: string; area: number }) => {
  const res = await axiosClient.post('/tables', data);
  return res.data;
};

export const updateTable = async (
  id: number,
  data: Partial<Omit<TableDTO, 'id'>>,
) => {
  const res = await axiosClient.put(`/tables/${id}`, data);
  return res.data;
};

export const deleteTable = async (id: number) => {
  const res = await axiosClient.delete(`/tables/${id}`);
  return res.data;
};
