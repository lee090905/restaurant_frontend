import axiosClient from './axiosClient';

export interface ShiftDTO {
  id: number;
  user: number;
  starttime: Date;
  endtime?: Date;
  note?: string;
  status: 'open' | 'close';
  totalhours?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HandleShiftResponse {
  action: 'open' | 'close';
  shift: any;
}

export const handleShift = async (username: string) => {
  const res = await axiosClient.post<HandleShiftResponse>('/shift', {
    username,
  });
  return res.data;
};
export const getCurrentShift = async (): Promise<ShiftDTO[]> => {
  const res = await axiosClient.get('/workshifts');
  return res.data;
};
