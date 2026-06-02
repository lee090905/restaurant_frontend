import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getTables } from '../../api/table.api';
import { getOrders } from '../../api/order.api';
import { getCurrentShift } from '../../api/shift.api';
import { getRevenueByRange, getDishStatistics, getRevenueChart, } from '../../api/dashboard';
export default function Dashboard() {
    const [openTables, setOpenTables] = useState(0);
    const [freeTables, setFreeTables] = useState(0);
    const [openOrders, setOpenOrders] = useState(0);
    const [shiftStatus, setShiftStatus] = useState('-');
    const [shiftRevenue, setShiftRevenue] = useState(0);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [topDishes, setTopDishes] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const formatVND = (amount) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
    const categoryMap = {
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
                const [tables, orders, shifts, revenueRes, statsRes, chartRes] = await Promise.all([
                    getTables(),
                    getOrders(),
                    getCurrentShift(),
                    getRevenueByRange(today, today).catch(() => ({ totalRevenue: 0 })),
                    getDishStatistics().catch(() => []),
                    getRevenueChart().catch(() => []),
                ]);
                const currentShift = shifts.find((s) => s.status === 'open');
                setShiftStatus(currentShift ? 'Đang mở' : 'Đã đóng');
                setShiftRevenue(currentShift?.totalhours || 0);
                setOpenTables(tables.filter((t) => t.status === 'open').length);
                setFreeTables(tables.filter((t) => t.status === 'close').length);
                setOpenOrders(orders.length);
                const revenueData = revenueRes.data || revenueRes;
                setTodayRevenue(Number(revenueData.totalRevenue || 0));
                const stats = Array.isArray(statsRes)
                    ? statsRes
                    : statsRes.data || [];
                setTopDishes(stats.slice(0, 5));
                const rawChart = Array.isArray(chartRes)
                    ? chartRes
                    : chartRes.data || [];
                setChartData(rawChart);
            }
            catch (err) {
                console.error('Lỗi tải dashboard:', err);
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    const maxRevenue = Math.max(...chartData.map((d) => Number(d.totalRevenue)), 1);
    return (_jsxs("div", { className: "dashboard-container", children: [_jsx("style", { children: `
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
      ` }), _jsxs("div", { className: "header", children: [_jsx("h1", { children: "Dashboard" }), _jsx("p", { style: { marginTop: 4, color: '#637381' }, children: "T\u1ED5ng quan t\u00ECnh h\u00ECnh kinh doanh" })] }), _jsxs("div", { className: "grid", children: [_jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-info", children: [_jsx("p", { children: "Doanh thu h\u00F4m nay" }), _jsx("h3", { children: formatVND(todayRevenue) })] }), _jsx("div", { className: "icon-box green", children: "\uD83D\uDCB0" })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-info", children: [_jsx("p", { children: "B\u00E0n \u0111ang m\u1EDF" }), _jsxs("h3", { children: [openTables, ' ', _jsxs("span", { style: { fontSize: 14, color: '#999', fontWeight: 400 }, children: ["/ ", openTables + freeTables] })] })] }), _jsx("div", { className: "icon-box blue", children: "\uD83E\uDE91" })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-info", children: [_jsx("p", { children: "\u0110\u01A1n ch\u1EDD x\u1EED l\u00FD" }), _jsx("h3", { children: openOrders })] }), _jsx("div", { className: "icon-box orange", children: "\uD83D\uDCDD" })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-info", children: [_jsx("p", { children: "Ca l\u00E0m vi\u1EC7c" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [_jsxs("h3", { children: [shiftRevenue, "h"] }), _jsx("span", { className: `badge ${shiftStatus === 'Đang mở' ? 'open' : ''}`, children: shiftStatus })] })] }), _jsx("div", { className: "icon-box red", children: "\u23F1\uFE0F" })] })] }), _jsxs("div", { className: "chart-section", children: [_jsx("div", { className: "chart-title", children: "\uD83D\uDCC8 Xu h\u01B0\u1EDBng doanh thu (30 ng\u00E0y g\u1EA7n nh\u1EA5t)" }), _jsx("div", { className: "chart-container", children: chartData.length > 0 ? (chartData.map((d, index) => {
                            const heightPercent = maxRevenue > 0
                                ? (Number(d.totalRevenue) / maxRevenue) * 100
                                : 0;
                            return (_jsx("div", { className: "chart-bar", style: { height: `${heightPercent}%` }, "data-tooltip": `${d.reportDate}: ${formatVND(Number(d.totalRevenue))}` }, index));
                        })) : (_jsx("div", { style: {
                                width: '100%',
                                textAlign: 'center',
                                color: '#999',
                                alignSelf: 'center',
                            }, children: "Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u bi\u1EC3u \u0111\u1ED3" })) }), _jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: 8,
                            fontSize: 12,
                            color: '#999',
                        }, children: [_jsx("span", { children: chartData[0]?.reportDate || 'N/A' }), _jsx("span", { children: "H\u00F4m nay" })] })] }), _jsx("h3", { style: { fontSize: 18, marginBottom: 16, color: '#212b36' }, children: "\uD83D\uDD25 Top m\u00F3n b\u00E1n ch\u1EA1y" }), _jsx("div", { className: "table-card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "M\u00F3n \u0103n" }), _jsx("th", { children: "Danh m\u1EE5c" }), _jsx("th", { children: "S\u1ED1 l\u01B0\u1EE3ng b\u00E1n" }), _jsx("th", { children: "Doanh thu" })] }) }), _jsxs("tbody", { children: [topDishes.map((dish, i) => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("span", { className: `rank top-${i}`, children: i + 1 }), _jsx("b", { children: dish.dishName || dish.name || 'Unknown' })] }), _jsx("td", { children: categoryMap[dish.category] || '-' }), _jsx("td", { children: dish.totalQuantity || dish.quantity }), _jsx("td", { style: { color: '#212b36', fontWeight: 600 }, children: formatVND(Number(dish.totalRevenue || dish.revenue)) })] }, i))), topDishes.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, style: { textAlign: 'center', color: '#999', padding: 20 }, children: "Ch\u01B0a c\u00F3 d\u1EEF li\u1EC7u" }) }))] })] }) })] }));
}
