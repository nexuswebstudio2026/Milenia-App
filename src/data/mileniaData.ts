import { MenuItem, TableOrder, KitchenOrder, InvoiceRecord } from '../types/milenia';

export const DEFAULT_MENU: MenuItem[] = [
  { id: '1', name: 'Bandeja Paisa Tradicional', category: 'Platos Fuertes', price: 38000, description: 'Chicharrón carnudo, fríjoles, carne en polvo, arroz, tajadas, huevo y arepa' },
  { id: '2', name: 'Punta de Anca Angus (400g)', category: 'Platos Fuertes', price: 49000, description: 'Corte madurado al carbón con papas rústicas y ensalada' },
  { id: '3', name: 'Costillas BBQ Ahumadas', category: 'Platos Fuertes', price: 42000, description: 'Costillas tiernas glaseadas con salsa de la casa y yuca al vapor' },
  { id: '4', name: 'Ajiaco Santafereño', category: 'Platos Fuertes', price: 32000, description: 'Pollo desmechado, alcaparras, crema de leche y mazorca con aguacate' },
  { id: '5', name: 'Picada Criolla Mixta (Para 2)', category: 'Entradas', price: 45000, description: 'Chicharrón, morcilla, papa criolla, plátano maduro y arepitas' },
  { id: '6', name: 'Empanaditas de Carne (6 und)', category: 'Entradas', price: 18000, description: 'Masa crocante rellena de carne con ají casero y limón' },
  { id: '7', name: 'Limonada de Coco Cremosita', category: 'Bebidas', price: 14000, description: 'Leche de coco natural, hielo frappé y zumo de limón' },
  { id: '8', name: 'Jugo de Lulo en Agua / Leche', category: 'Bebidas', price: 10000, description: 'Pulpa de fruta fresca colombiana' },
  { id: '9', name: 'Cerveza Club Colombia Dorada', category: 'Bebidas', price: 9000, description: '330ml botella helada' },
  { id: '10', name: 'Postre de Natas Artesanal', category: 'Postres', price: 15000, description: 'Receta típica con pasas al ron y leche condensada' }
];

export const INITIAL_TABLES: TableOrder[] = [
  {
    tableNumber: 1,
    status: 'ocupada',
    waiter: 'Carlos Pérez',
    openedAt: '12:45 PM',
    items: [
      { id: '1', name: 'Bandeja Paisa Tradicional', price: 38000, quantity: 2 },
      { id: '7', name: 'Limonada de Coco Cremosita', price: 14000, quantity: 2 }
    ]
  },
  {
    tableNumber: 2,
    status: 'libre',
    waiter: 'Sin asignar',
    items: []
  },
  {
    tableNumber: 3,
    status: 'cuenta_pedida',
    waiter: 'Laura Gómez',
    openedAt: '12:15 PM',
    items: [
      { id: '2', name: 'Punta de Anca Angus (400g)', price: 49000, quantity: 1 },
      { id: '3', name: 'Costillas BBQ Ahumadas', price: 42000, quantity: 1 },
      { id: '9', name: 'Cerveza Club Colombia Dorada', price: 9000, quantity: 2 }
    ]
  },
  {
    tableNumber: 4,
    status: 'libre',
    waiter: 'Sin asignar',
    items: []
  },
  {
    tableNumber: 5,
    status: 'ocupada',
    waiter: 'Carlos Pérez',
    openedAt: '01:10 PM',
    items: [
      { id: '5', name: 'Picada Criolla Mixta (Para 2)', price: 45000, quantity: 1 },
      { id: '8', name: 'Jugo de Lulo en Agua / Leche', price: 10000, quantity: 2 }
    ]
  },
  {
    tableNumber: 6,
    status: 'libre',
    waiter: 'Sin asignar',
    items: []
  }
];

export const INITIAL_KITCHEN_ORDERS: KitchenOrder[] = [
  {
    id: 'K-101',
    tableNumber: 1,
    items: [
      { id: '1', name: 'Bandeja Paisa Tradicional', price: 38000, quantity: 2 }
    ],
    createdAt: '12:46 PM',
    status: 'en_cocina',
    urgency: 'normal'
  },
  {
    id: 'K-102',
    tableNumber: 5,
    items: [
      { id: '5', name: 'Picada Criolla Mixta (Para 2)', price: 45000, quantity: 1 }
    ],
    createdAt: '01:12 PM',
    status: 'pendiente',
    urgency: 'urgente'
  }
];

export const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'FAC-0841',
    tableNumber: 7,
    total: 126000,
    subtotal: 116667,
    tax: 9333,
    paymentMethod: 'Nequi / Daviplata',
    timestamp: '12:20 PM'
  },
  {
    id: 'FAC-0842',
    tableNumber: 8,
    total: 87000,
    subtotal: 80556,
    tax: 6444,
    paymentMethod: 'Efectivo',
    timestamp: '12:40 PM'
  }
];
