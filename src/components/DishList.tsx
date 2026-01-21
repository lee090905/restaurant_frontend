import { useEffect, useState } from 'react';
import { getActiveDishes } from '../index';

export function DishList({ onAdd }: { onAdd: (dish: any) => void }) {
  const [dishes, setDishes] = useState<any[]>([]);

  useEffect(() => {
    getActiveDishes().then(setDishes);
  }, []);

  return (
    <div>
      {dishes.map((d) => (
        <div
          key={d.id}
          onClick={() => onAdd(d)}
          style={{
            padding: '12px 16px',
            marginBottom: 8,
            background: '#f1f3f5',
            borderRadius: 8,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <b>{d.name}</b> – {d.price}
        </div>
      ))}
    </div>
  );
}
