import { forwardRef } from 'react';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  note?: string;
}

interface ProvisionalReceiptProps {
  tableId: number | string;
  items: ReceiptItem[];
  total: number;
  cashier: string;
  orderId?: number | string | null;
}

export const ProvisionalReceipt = forwardRef<HTMLDivElement, ProvisionalReceiptProps>(
  ({ tableId, items, total, cashier, orderId }, ref) => {
    const formatMoney = (amount: number) => amount.toLocaleString('vi-VN') + ' đ';

    return (
      <div ref={ref} className="provisional-receipt" style={{
        padding: '20px',
        width: '300px', // Khổ giấy 80mm khoảng ~300px
        fontFamily: 'monospace, sans-serif',
        color: '#000',
        background: '#fff',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>NHÀ HÀNG ABC</h2>
          <p style={{ margin: '0', fontSize: '12px' }}>123 Đường XYZ, Quận 1, TP.HCM</p>
          <p style={{ margin: '0', fontSize: '12px' }}>ĐT: 0123.456.789</p>
          <h3 style={{ margin: '15px 0 5px 0', fontSize: '18px', borderTop: '1px dashed #000', paddingTop: '10px' }}>
            HÓA ĐƠN TẠM TÍNH
          </h3>
          <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold' }}>Bàn: {tableId}</p>
        </div>

        <div style={{ fontSize: '12px', marginBottom: '10px' }}>
          <p style={{ margin: '2px 0' }}>Mã đơn: #{orderId || 'N/A'}</p>
          <p style={{ margin: '2px 0' }}>Ngày: {new Date().toLocaleString('vi-VN')}</p>
          <p style={{ margin: '2px 0' }}>Thu ngân: {cashier}</p>
        </div>

        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '1px dashed #000' }}>
              <th style={{ textAlign: 'left', paddingBottom: '5px' }}>Món</th>
              <th style={{ textAlign: 'center', paddingBottom: '5px' }}>SL</th>
              <th style={{ textAlign: 'right', paddingBottom: '5px' }}>TT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ paddingTop: '5px', paddingBottom: '5px' }}>
                  {item.name}
                  {item.note && <div style={{ fontSize: '10px', fontStyle: 'italic' }}>({item.note})</div>}
                </td>
                <td style={{ textAlign: 'center', paddingTop: '5px', paddingBottom: '5px' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', paddingTop: '5px', paddingBottom: '5px' }}>
                  {formatMoney(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderTop: '1px dashed #000', paddingTop: '10px', marginTop: '10px', fontSize: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
          <span>TỔNG CỘNG:</span>
          <span>{formatMoney(total)}</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', borderTop: '1px dashed #000', paddingTop: '10px' }}>
          <p style={{ margin: '0' }}>(Hóa đơn tạm tính - Chưa có giá trị thanh toán thuế)</p>
          <p style={{ margin: '5px 0' }}>Xin cảm ơn quý khách!</p>
        </div>
      </div>
    );
  }
);
