type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export function OrderList({
  items,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  items: OrderItem[];
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div>
      {items.length === 0 && <div>Chưa có món</div>}

      {items.map((i) => (
        <div
          key={i.id}
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
          <span style={{ flex: 1 }}>{i.name}</span>

          <button onClick={() => onDecrease(i.id)}>-</button>
          <span>{i.quantity}</span>
          <button onClick={() => onIncrease(i.id)}>+</button>

          <span>{i.price * i.quantity}</span>

          <button onClick={() => onRemove(i.id)}>✕</button>
        </div>
      ))}

      <hr />
      <strong>Tổng tiền: {total}</strong>
    </div>
  );
}
