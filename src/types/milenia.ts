export interface MenuItem {
  id: string;
  name: string;
  category: 'Platos Fuertes' | 'Bebidas' | 'Entradas' | 'Postres';
  price: number;
  description: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface TableOrder {
  tableNumber: number;
  status: 'libre' | 'ocupada' | 'cuenta_pedida';
  waiter: string;
  items: OrderItem[];
  openedAt?: string;
  notes?: string;
}

export interface KitchenOrder {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  createdAt: string;
  status: 'pendiente' | 'en_cocina' | 'listo';
  urgency: 'normal' | 'urgente';
}

export interface InvoiceRecord {
  id: string;
  tableNumber: number;
  total: number;
  subtotal: number;
  tax: number; // Impoconsumo 8%
  paymentMethod: 'Efectivo' | 'Nequi / Daviplata' | 'Tarjeta / Datáfono';
  timestamp: string;
}
