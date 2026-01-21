type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export function OrderItemList({ items }: { items: OrderItem[] }) {
  return (
    <div>
      {items.map((i) => (
        <div key={i.id}>
          {i.name} × {i.quantity} = {i.price * i.quantity}
        </div>
      ))}
    </div>
  );
}
