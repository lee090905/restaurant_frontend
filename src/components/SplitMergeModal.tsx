import { useState } from 'react';

interface SplitMergeModalProps {
  mode: 'split' | 'merge';
  currentTableId: number;
  availableTables: any[];
  currentItems: any[];
  onClose: () => void;
  onConfirmMerge: (targetTableId: number) => void;
  onConfirmSplit: (targetTableId: number, itemsToMove: { id: number; quantity: number }[]) => void;
}

export function SplitMergeModal({
  mode,
  currentTableId,
  availableTables,
  currentItems,
  onClose,
  onConfirmMerge,
  onConfirmSplit
}: SplitMergeModalProps) {
  const [selectedTargetTable, setSelectedTargetTable] = useState<number | null>(null);
  const [itemsToMove, setItemsToMove] = useState<Record<number, number>>({});

  const formatMoney = (amount: number) => amount.toLocaleString('vi-VN');

  const handleIncreaseMove = (itemId: number, maxQty: number) => {
    setItemsToMove(prev => {
      const current = prev[itemId] || 0;
      if (current >= maxQty) return prev;
      return { ...prev, [itemId]: current + 1 };
    });
  };

  const handleDecreaseMove = (itemId: number) => {
    setItemsToMove(prev => {
      const current = prev[itemId] || 0;
      if (current <= 0) return prev;
      return { ...prev, [itemId]: current - 1 };
    });
  };

  const handleConfirm = () => {
    if (!selectedTargetTable) {
      alert('Vui lòng chọn bàn đích!');
      return;
    }

    if (mode === 'merge') {
      if (window.confirm(`Xác nhận gộp toàn bộ bàn ${currentTableId} sang bàn ${selectedTargetTable}?`)) {
        onConfirmMerge(selectedTargetTable);
      }
    } else {
      const payload = Object.entries(itemsToMove)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => ({ id: Number(id), quantity: qty }));

      if (payload.length === 0) {
        alert('Vui lòng chọn ít nhất 1 món để chuyển!');
        return;
      }

      if (window.confirm(`Xác nhận tách ${payload.length} món sang bàn ${selectedTargetTable}?`)) {
        onConfirmSplit(selectedTargetTable, payload);
      }
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ background: '#fff', width: 600, borderRadius: 8, padding: 20, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>
          {mode === 'merge' ? 'Gộp Bàn' : 'Tách Bàn / Chuyển Món'}
        </h3>
        <p>Bàn hiện tại: <strong>Bàn {currentTableId}</strong></p>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 8 }}>Chọn bàn đích:</label>
          <select 
            className="form-select" 
            style={{ width: '100%', padding: 8 }}
            value={selectedTargetTable || ''}
            onChange={(e) => setSelectedTargetTable(Number(e.target.value))}
          >
            <option value="">-- Chọn bàn --</option>
            {availableTables.filter(t => t.id !== currentTableId).map(t => (
              <option key={t.id} value={t.id}>Bàn {t.id} ({t.name}) - Trạng thái: {t.status}</option>
            ))}
          </select>
        </div>

        {mode === 'split' && (
          <div className="split-items-section" style={{ border: '1px solid #ddd', borderRadius: 6, padding: 10, marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Chọn món cần chuyển:</h4>
            {currentItems.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>Không có món nào để chuyển.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ textAlign: 'left', padding: 8 }}>Món</th>
                    <th style={{ textAlign: 'center', padding: 8 }}>Đã gọi</th>
                    <th style={{ textAlign: 'center', padding: 8 }}>Chuyển đi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(item => (
                    <tr key={item.dish_id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 8 }}>{item.name}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '2px 8px' }}
                            onClick={() => handleDecreaseMove(item.dish_id)}
                          >-</button>
                          <span>{itemsToMove[item.dish_id] || 0}</span>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '2px 8px' }}
                            onClick={() => handleIncreaseMove(item.dish_id, item.quantity)}
                          >+</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {mode === 'merge' && (
          <div style={{ padding: 15, background: '#e3f2fd', color: '#0d47a1', borderRadius: 6, marginBottom: 20 }}>
            <p style={{ margin: 0 }}>Toàn bộ <strong>{currentItems.length} món</strong> của bàn này sẽ được chuyển sang bàn đích. Bàn hiện tại sẽ được đánh dấu là Trống.</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleConfirm}>Xác nhận</button>
        </div>
      </div>
    </div>
  );
}
