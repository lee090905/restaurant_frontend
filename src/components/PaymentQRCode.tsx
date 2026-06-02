import { QRCodeSVG } from 'qrcode.react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

interface PaymentQRCodeProps {
  amount: number;
  orderId: string | number;
}

export function PaymentQRCode({ amount, orderId }: PaymentQRCodeProps) {
  // Lấy QR từ Backend
  const { data, isLoading, error } = useQuery({
    queryKey: ['payment-qr', orderId, amount],
    queryFn: async () => {
      const res = await axiosClient.post('/payments/generate-qr', { orderId, amount });
      return res.data; // Giả định trả về { qrUrl, bankInfo: { name, accountNo, accountName } }
    },
    enabled: !!orderId && amount > 0,
  });

  if (isLoading) return <div style={{ textAlign: 'center', padding: '20px' }}>Đang tạo mã QR...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Lỗi khi tạo mã QR</div>;

  const qrUrl = data?.qrUrl || '';
  const bankInfo = data?.bankInfo || { name: 'VietinBank', accountNo: '113366668888', accountName: 'NHA HANG ABC' };

  return (
    <div style={{ textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '8px' }}>
      <h4 style={{ marginBottom: '16px', color: '#333' }}>Quét mã để thanh toán</h4>
      <div style={{ padding: '16px', background: '#f8f9fa', display: 'inline-block', borderRadius: '12px' }}>
        <QRCodeSVG 
          value={qrUrl} 
          size={200}
          level={"H"}
          includeMargin={true}
        />
      </div>
      <div style={{ marginTop: '16px', fontSize: '14px', color: '#555' }}>
        <p style={{ margin: '4px 0' }}>Ngân hàng: <strong>{bankInfo.name}</strong></p>
        <p style={{ margin: '4px 0' }}>STK: <strong>{bankInfo.accountNo}</strong></p>
        <p style={{ margin: '4px 0' }}>Chủ TK: <strong>{bankInfo.accountName}</strong></p>
        <p style={{ margin: '4px 0', fontSize: '18px', color: '#d32f2f', fontWeight: 'bold' }}>
          Số tiền: {amount.toLocaleString('vi-VN')} VND
        </p>
        <p style={{ margin: '4px 0' }}>Nội dung: <strong>Thanh toán đơn {orderId}</strong></p>
      </div>
    </div>
  );
}
