import axiosClient from './axiosClient';

export interface RevenueChartData {
  reportDate: string;
  totalRevenue: string | number;
}

export interface DishStat {
  dishId: number;
  dishName?: string;
  category?: string;
  totalQuantity: string | number;
  totalRevenue: string | number;
}

export interface RevenueResponse {
  totalOrders: number;
  totalRevenue: number;
}

export const getRevenueByRange = (from: string, to: string) => {
  return axiosClient.get<RevenueResponse>('/reports/revenue/range', {
    params: { from, to },
  });
};

export const getDishStatistics = () => {
  return axiosClient.get<DishStat[]>('/reports/menu');
};

export const getRevenueChart = () => {
  return axiosClient.get<RevenueChartData[]>('/reports/revenue/chart');
};

export const getActiveDishes = async () => {
  const res = await axiosClient.get('/dishes');
  return res.data;
};
