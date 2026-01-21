import axiosClient from './axiosClient';

export interface CreateReservationDTO {
  customer_name: string;
  phone: string;
  table_id: number;
  time_from: string;
  guest_count: number;
  note?: string;
}

export const createReservation = (data: CreateReservationDTO) =>
  axiosClient.post('/reservations', data);
