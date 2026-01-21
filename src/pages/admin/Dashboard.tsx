import { useEffect, useState } from 'react';
import { getTables } from '../../api/table.api';
import { getOrders } from '../../api/order.api';
import { getCurrentShift } from '../../api/shift.api';
import {
  getRevenueByRange,
  getDishStatistics,
  getRevenueChart,
} from '../../api/dashboard';

export default function Dashboard() {
  const [openTables, setOpenTables] = useState(0);
  const [freeTables, setFreeTables] = useState(0);
  const [openOrders, setOpenOrders] = useState(0);
  const [shiftStatus, setShiftStatus] = useState('-');
  const [shiftRevenue, setShiftRevenue] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [topDishes, setTopDishes] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const categoryMap: Record<string, string> = {
    appetizer: 'Khai vị',
    Salad: 'Salad',
    Grilled: 'Món nướng',
    Fried: 'Món chiên',
    'Stir-fried': 'Món xào',
    'Steamed/Boiled': 'Hấp / Luộc',
    Hotpot: 'Lẩu',
    Seafood: 'Hải sản',
    Specials: 'Món đặc biệt',
    Drinks: 'Đồ uống',
    inactive: 'Ngừng bán',
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);

        // Gọi song song các API
        const [tables, orders, shifts, revenueRes, statsRes, chartRes] =
          await Promise.all([
            getTables(),
            getOrders(),
            getCurrentShift(),
            getRevenueByRange(today, today).catch(() => ({ totalRevenue: 0 })),
            getDishStatistics().catch(() => []),
            getRevenueChart().catch(() => []),
          ]);

        const currentShift = shifts.find((s: any) => s.status === 'open');
        setShiftStatus(currentShift ? 'Đang mở' : 'Đã đóng');
        setShiftRevenue(currentShift?.totalhours || 0);

        setOpenTables(tables.filter((t: any) => t.status === 'open').length);
        setFreeTables(tables.filter((t: any) => t.status === 'close').length);

        setOpenOrders(orders.length);

        const revenueData = (revenueRes as any).data || revenueRes;
        setTodayRevenue(Number(revenueData.totalRevenue || 0));

        const stats = Array.isArray(statsRes)
          ? statsRes
          : (statsRes as any).data || [];
        setTopDishes(stats.slice(0, 5));

        const rawChart = Array.isArray(chartRes)
          ? chartRes
          : (chartRes as any).data || [];
        setChartData(rawChart);
      } catch (err) {
        console.error('Lỗi tải dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const maxRevenue = Math.max(
    ...chartData.map((d) => Number(d.totalRevenue)),
    1,
  );

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container { padding: 24px; background: #f4f6f8; min-height: 100vh; font-family: sans-serif; }
        .header { margin-bottom: 24px; }
        .header h1 { margin: 0; font-size: 24px; color: #212b36; }
        
        /* Grid Cards */
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 24px; }
        .card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #dfe3e8; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .card-info p { margin: 0; font-size: 13px; color: #919eab; font-weight: 700; text-transform: uppercase; }
        .card-info h3 { margin: 5px 0 0; font-size: 24px; color: #212b36; font-weight: 700; }
        .icon-box { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .green { background: #f6ffed; color: #52c41a; }
        .blue { background: #e6f7ff; color: #1890ff; }
        .orange { background: #fffbe6; color: #faad14; }
        .red { background: #fff1f0; color: #f5222d; }
        .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #f0f0f0; color: #666; margin-left: 8px; vertical-align: middle; }
        .badge.open { background: #e6f7ff; color: #1890ff; }
        
        /* Chart Section */
        .chart-section { background: white; padding: 24px; border-radius: 12px; border: 1px solid #dfe3e8; margin-bottom: 24px; }
        .chart-title { font-size: 16px; font-weight: 700; color: #212b36; margin-bottom: 20px; }
        .chart-container { display: flex; align-items: flex-end; height: 200px; gap: 6px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .chart-bar { flex: 1; background-color: #bae7ff; border-radius: 4px 4px 0 0; position: relative; transition: all 0.3s; min-width: 8px; cursor: pointer; }
        .chart-bar:hover { background-color: #1890ff; }
        /* Tooltip CSS thuần */
        .chart-bar:hover::after {
          content: attr(data-tooltip);
          position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
          background: #212b36; color: white; padding: 6px 10px; border-radius: 6px;
          font-size: 12px; white-space: nowrap; z-index: 10; margin-bottom: 6px; pointer-events: none;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        /* Table Section */
        .table-card { background: white; border-radius: 12px; border: 1px solid #dfe3e8; overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 16px; text-align: left; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        th { background: #fafafa; font-weight: 600; color: #637381; }
        .rank { display: inline-flex; width: 24px; height: 24px; border-radius: 50%; background: #f0f0f0; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 10px; }
        .top-0 { background: #ffec3d; color: #876800; } /* Vàng cho top 1 */
        .top-1 { background: #e6e6e6; color: #595959; } /* Bạc cho top 2 */
        .top-2 { background: #e8d098; color: #8c6a2e; } /* Đồng cho top 3 */
      `}</style>

      <div className="header">
        <h1>Dashboard</h1>
        <p style={{ marginTop: 4, color: '#637381' }}>
          Tổng quan tình hình kinh doanh
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <div className="card-info">
            <p>Doanh thu hôm nay</p>
            <h3>{formatVND(todayRevenue)}</h3>
          </div>
          <div className="icon-box green">💰</div>
        </div>
        <div className="card">
          <div className="card-info">
            <p>Bàn đang mở</p>
            <h3>
              {openTables}{' '}
              <span style={{ fontSize: 14, color: '#999', fontWeight: 400 }}>
                / {openTables + freeTables}
              </span>
            </h3>
          </div>
          <div className="icon-box blue">🪑</div>
        </div>
        <div className="card">
          <div className="card-info">
            <p>Đơn chờ xử lý</p>
            <h3>{openOrders}</h3>
          </div>
          <div className="icon-box orange">📝</div>
        </div>
        <div className="card">
          <div className="card-info">
            <p>Ca làm việc</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h3>{shiftRevenue}h</h3>
              <span
                className={`badge ${shiftStatus === 'Đang mở' ? 'open' : ''}`}
              >
                {shiftStatus}
              </span>
            </div>
          </div>
          <div className="icon-box red">⏱️</div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-title">
          📈 Xu hướng doanh thu (30 ngày gần nhất)
        </div>
        <div className="chart-container">
          {chartData.length > 0 ? (
            chartData.map((d, index) => {
              const heightPercent =
                maxRevenue > 0
                  ? (Number(d.totalRevenue) / maxRevenue) * 100
                  : 0;
              return (
                <div
                  key={index}
                  className="chart-bar"
                  style={{ height: `${heightPercent}%` }}
                  data-tooltip={`${d.reportDate}: ${formatVND(
                    Number(d.totalRevenue),
                  )}`}
                />
              );
            })
          ) : (
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                color: '#999',
                alignSelf: 'center',
              }}
            >
              Chưa có dữ liệu biểu đồ
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
            fontSize: 12,
            color: '#999',
          }}
        >
          <span>{chartData[0]?.reportDate || 'N/A'}</span>
          <span>Hôm nay</span>
        </div>
      </div>

      <h3 style={{ fontSize: 18, marginBottom: 16, color: '#212b36' }}>
        🔥 Top món bán chạy
      </h3>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Món ăn</th>
              <th>Danh mục</th>
              <th>Số lượng bán</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {topDishes.map((dish, i) => (
              <tr key={i}>
                <td>
                  <span className={`rank top-${i}`}>{i + 1}</span>
                  <b>{dish.dishName || dish.name || 'Unknown'}</b>
                </td>
                <td>{categoryMap[dish.category] || '-'}</td>
                <td>{dish.totalQuantity || dish.quantity}</td>
                <td style={{ color: '#212b36', fontWeight: 600 }}>
                  {formatVND(Number(dish.totalRevenue || dish.revenue))}
                </td>
              </tr>
            ))}
            {topDishes.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: 'center', color: '#999', padding: 20 }}
                >
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
