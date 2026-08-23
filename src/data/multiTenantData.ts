import { 
  TenantRestaurant, 
  TenantEmployee, 
  RestaurantTable, 
  MenuItem, 
  MenuCategory, 
  Order, 
  TableReservation 
} from '../types';

export const INITIAL_TENANTS: TenantRestaurant[] = [
  {
    id: '1',
    slug: 'camilo',
    name: 'Parrilla & Fuego Camilo',
    city: 'Medellín, Antioquia',
    address: 'Cra. 37 #8A-12, El Poblado',
    phone: '+57 304-347-0984',
    email: 'contacto@parrillacamilo.co',
    createdAt: '2025-01-15',
    tablesCount: 8,
    activeOrdersCount: 4,
    totalMonthlySalesCop: 28450000,
    branding: {
      logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80',
      primaryColor: '#ea580c', // Orange-600 Flame
      accentColor: '#f59e0b', // Amber-500
      themeStyle: 'rustic',
      bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Cortes Madurados a la Brasa & Tradición Paisa',
      currency: 'COP',
      currencySymbol: '$',
      dianResolution: 'Resolución DIAN No. 18764032910 de 2025',
      nit: '901.884.231-9',
      tipSuggestedPercentage: 10
    },
    subscription: {
      plan: 'pro',
      status: 'active',
      mrrCop: 289000,
      renewsAt: '2026-09-01',
      maxTables: 20,
      maxEmployees: 10,
      features: ['POS Meseros', 'KDS Cocina', 'Facturación DIAN', 'Menú QR', 'Control de Mesas', 'Multi-caja']
    }
  },
  {
    id: '2',
    slug: 'milenia-bogota',
    name: 'Milenia Haute Cuisine',
    city: 'Bogotá D.C., Cundinamarca',
    address: 'Zona G - Cl. 69A #5-24',
    phone: '+57 320 890 3344',
    email: 'reservas@mileniarestaurant.co',
    createdAt: '2024-11-10',
    tablesCount: 12,
    activeOrdersCount: 6,
    totalMonthlySalesCop: 45600000,
    branding: {
      logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80',
      primaryColor: '#f59e0b', // Amber Luxury
      accentColor: '#10b981', // Emerald
      themeStyle: 'luxury',
      bannerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Gastronomía de Autor & Cava de Vinos Internacional',
      currency: 'COP',
      currencySymbol: '$',
      dianResolution: 'Resolución DIAN No. 18764019200 de 2024',
      nit: '900.732.190-4',
      tipSuggestedPercentage: 10
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      mrrCop: 499000,
      renewsAt: '2026-09-15',
      maxTables: 50,
      maxEmployees: 25,
      features: ['Múltiples Salones', 'KDS Avanzado', 'Reservas VIP', 'Fidelización Milenia', 'API Integración DIAN', 'Sommelier AI']
    }
  },
  {
    id: '3',
    slug: 'del-valle-cali',
    name: 'Sabor del Valle & Mar',
    city: 'Cali, Valle del Cauca',
    address: 'Barrio Granada, Av. 9N #14-30',
    phone: '+57 315 672 8819',
    email: 'hola@sabordelvalle.co',
    createdAt: '2025-03-01',
    tablesCount: 10,
    activeOrdersCount: 3,
    totalMonthlySalesCop: 21300000,
    branding: {
      logoUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=200&q=80',
      primaryColor: '#0d9488', // Teal
      accentColor: '#f43f5e', // Rose
      themeStyle: 'modern',
      bannerImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Cocina del Pacífico, Mariscos Frescos & Tradición Valluna',
      currency: 'COP',
      currencySymbol: '$',
      dianResolution: 'Resolución DIAN No. 18764098231 de 2025',
      nit: '901.320.449-0',
      tipSuggestedPercentage: 10
    },
    subscription: {
      plan: 'basic',
      status: 'active',
      mrrCop: 149000,
      renewsAt: '2026-08-30',
      maxTables: 12,
      maxEmployees: 5,
      features: ['POS Meseros', 'Menú QR', 'Control de Caja']
    }
  },
  {
    id: '4',
    slug: 'di-napoli',
    name: 'Pizzería & Trattoria Di Napoli',
    city: 'Bucaramanga, Santander',
    address: 'Cabecera del Llano, Cra. 35 #48-19',
    phone: '+57 317 400 8822',
    email: 'contacto@dinapolitrattoria.co',
    createdAt: '2025-02-18',
    tablesCount: 14,
    activeOrdersCount: 5,
    totalMonthlySalesCop: 31200000,
    branding: {
      logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80',
      primaryColor: '#dc2626', // Red
      accentColor: '#16a34a', // Green
      themeStyle: 'rustic',
      bannerImage: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Pizzas Artesanales en Horno de Leña & Pastas Frescas',
      currency: 'COP',
      currencySymbol: '$',
      dianResolution: 'Resolución DIAN No. 18764055102 de 2025',
      nit: '901.782.901-3',
      tipSuggestedPercentage: 10
    },
    subscription: {
      plan: 'pro',
      status: 'active',
      mrrCop: 289000,
      renewsAt: '2026-09-10',
      maxTables: 24,
      maxEmployees: 12,
      features: ['POS Meseros', 'KDS Cocina', 'Facturación DIAN', 'Menú QR', 'Control de Mesas']
    }
  },
  {
    id: '5',
    slug: 'mar-y-fuego-caribe',
    name: 'Mar & Fuego Caribe Gastrobar',
    city: 'Cartagena de Indias, Bolívar',
    address: 'Ciudad Amurallada, Cl. del Cuartel #36-11',
    phone: '+57 305 889 1234',
    email: 'reservas@maryfuegocaribe.co',
    createdAt: '2024-12-05',
    tablesCount: 18,
    activeOrdersCount: 7,
    totalMonthlySalesCop: 58900000,
    branding: {
      logoUrl: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=200&q=80',
      primaryColor: '#0284c7', // Sky Blue Caribbean
      accentColor: '#f59e0b', // Amber Sunset
      themeStyle: 'luxury',
      bannerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Mariscos del Caribe Colombiano, Arroces Melosos & Coctelería de Autor',
      currency: 'COP',
      currencySymbol: '$',
      dianResolution: 'Resolución DIAN No. 18764088901 de 2024',
      nit: '900.892.403-1',
      tipSuggestedPercentage: 10
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      mrrCop: 499000,
      renewsAt: '2026-09-20',
      maxTables: 40,
      maxEmployees: 20,
      features: ['Múltiples Salones', 'KDS Cocina & Barra', 'Reservas VIP en Línea', 'Facturación DIAN', 'Fidelización']
    }
  },
  {
    id: '6',
    slug: 'la-candelaria-bistro',
    name: 'Café & Bistro La Candelaria',
    city: 'Bogotá D.C., Cundinamarca',
    address: 'Centro Histórico, Cra. 4 #11-40',
    phone: '+57 311 234 5678',
    email: 'hola@candelariabistro.co',
    createdAt: '2025-04-10',
    tablesCount: 8,
    activeOrdersCount: 2,
    totalMonthlySalesCop: 16800000,
    branding: {
      logoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&q=80',
      primaryColor: '#78350f', // Warm Coffee Brown
      accentColor: '#d97706', // Amber
      themeStyle: 'rustic',
      bannerImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Café Especial Colombiano de Origen & Brunch de Autor',
      currency: 'COP',
      currencySymbol: '$',
      dianResolution: 'Resolución DIAN No. 18764011234 de 2025',
      nit: '901.445.890-7',
      tipSuggestedPercentage: 10
    },
    subscription: {
      plan: 'basic',
      status: 'active',
      mrrCop: 149000,
      renewsAt: '2026-09-05',
      maxTables: 10,
      maxEmployees: 4,
      features: ['POS Meseros', 'Menú QR', 'Control de Caja']
    }
  }
];

export const INITIAL_EMPLOYEES: TenantEmployee[] = [
  // Employees for Restaurant "Camilo" (ID: 1)
  {
    id: 'emp-101',
    restaurantId: '1',
    name: 'Juan Camilo Vélez',
    role: 'mesero',
    email: 'juan.velez@parrillacamilo.co',
    phone: '+57 312 400 1122',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    pinCode: '1111',
    shiftStatus: 'active',
    hourlyRateCop: 12000,
    assignedTables: ['M-01', 'M-02', 'M-03', 'M-04'],
    totalOrdersTaken: 142
  },
  {
    id: 'emp-102',
    restaurantId: '1',
    name: 'Chef Martha Restrepo',
    role: 'cocina',
    email: 'martha.cocina@parrillacamilo.co',
    phone: '+57 311 500 3344',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80',
    pinCode: '2222',
    shiftStatus: 'active',
    hourlyRateCop: 18000,
    totalOrdersTaken: 380
  },
  {
    id: 'emp-103',
    restaurantId: '1',
    name: 'Carlos Montoya',
    role: 'cajero',
    email: 'carlos.caja@parrillacamilo.co',
    phone: '+57 314 600 5566',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    pinCode: '3333',
    shiftStatus: 'active',
    hourlyRateCop: 14000,
    totalOrdersTaken: 512
  },
  {
    id: 'emp-104',
    restaurantId: '1',
    name: 'Camilo Echeverry',
    role: 'owner',
    email: 'camilo.owner@parrillacamilo.co',
    phone: '+57 304-347-0984',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    pinCode: '0000',
    shiftStatus: 'active',
    totalOrdersTaken: 1200
  },

  // Employees for Restaurant "Milenia Bogotá" (ID: 2)
  {
    id: 'emp-201',
    restaurantId: '2',
    name: 'Santiago Morales',
    role: 'mesero',
    email: 'santiago.m@mileniarestaurant.co',
    phone: '+57 301 223 4455',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    pinCode: '1234',
    shiftStatus: 'active',
    hourlyRateCop: 15000,
    assignedTables: ['M-01', 'M-02'],
    totalOrdersTaken: 210
  },
  {
    id: 'emp-202',
    restaurantId: '2',
    name: 'Chef Laurent Dubois',
    role: 'cocina',
    email: 'laurent@mileniarestaurant.co',
    phone: '+57 318 901 2233',
    avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80',
    pinCode: '5678',
    shiftStatus: 'active',
    hourlyRateCop: 28000,
    totalOrdersTaken: 620
  },
  {
    id: 'emp-203',
    restaurantId: '2',
    name: 'Valentina Ospina',
    role: 'administrador',
    email: 'valentina.admin@mileniarestaurant.co',
    phone: '+57 320 890 3344',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    pinCode: '9012',
    shiftStatus: 'active',
    totalOrdersTaken: 890
  },

  // Employees for Restaurant "Sabor del Valle" (ID: 3)
  {
    id: 'emp-301',
    restaurantId: '3',
    name: 'Mateo Caicedo',
    role: 'mesero',
    email: 'mateo@sabordelvalle.co',
    phone: '+57 316 778 9900',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    pinCode: '1122',
    shiftStatus: 'active',
    hourlyRateCop: 11000,
    assignedTables: ['M-01', 'M-02'],
    totalOrdersTaken: 95
  },
  {
    id: 'emp-302',
    restaurantId: '3',
    name: 'Chef Aura Lucumí',
    role: 'cocina',
    email: 'aura.cocina@sabordelvalle.co',
    phone: '+57 315 672 8819',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
    pinCode: '3344',
    shiftStatus: 'active',
    hourlyRateCop: 16000,
    totalOrdersTaken: 240
  }
];

export const INITIAL_TABLES: RestaurantTable[] = [
  // Tables for Camilo (ID: 1)
  { id: 'tbl-101', restaurantId: '1', number: 'Mesa 1', zone: 'Terraza Fogata', capacity: 4, status: 'occupied', currentOrderId: 'ord-cam-01', assignedEmployeeId: 'emp-101', dinersCount: 3, occupiedSince: '14:20' },
  { id: 'tbl-102', restaurantId: '1', number: 'Mesa 2', zone: 'Terraza Fogata', capacity: 4, status: 'available' },
  { id: 'tbl-103', restaurantId: '1', number: 'Mesa 3', zone: 'Salón Principal', capacity: 6, status: 'occupied', currentOrderId: 'ord-cam-02', assignedEmployeeId: 'emp-101', dinersCount: 5, occupiedSince: '14:45' },
  { id: 'tbl-104', restaurantId: '1', number: 'Mesa 4', zone: 'Salón Principal', capacity: 2, status: 'billing', currentOrderId: 'ord-cam-03', assignedEmployeeId: 'emp-101', dinersCount: 2, occupiedSince: '13:50' },
  { id: 'tbl-105', restaurantId: '1', number: 'Mesa 5', zone: 'VIP Parrillero', capacity: 8, status: 'reserved', dinersCount: 8 },
  { id: 'tbl-106', restaurantId: '1', number: 'Mesa 6', zone: 'Barra Cervecería', capacity: 2, status: 'available' },

  // Tables for Milenia Bogotá (ID: 2)
  { id: 'tbl-201', restaurantId: '2', number: 'Mesa 1', zone: 'Salón Haute Cuisine', capacity: 2, status: 'occupied', currentOrderId: 'ord-mil-01', assignedEmployeeId: 'emp-201', dinersCount: 2, occupiedSince: '19:30' },
  { id: 'tbl-202', restaurantId: '2', number: 'Mesa 2', zone: 'Salón Haute Cuisine', capacity: 4, status: 'available' },
  { id: 'tbl-203', restaurantId: '2', number: 'Mesa 3', zone: 'Cava Privada Sommelier', capacity: 6, status: 'reserved', dinersCount: 6 },
  { id: 'tbl-204', restaurantId: '2', number: 'Mesa 4', zone: 'Terraza Panorámica', capacity: 4, status: 'occupied', currentOrderId: 'ord-mil-02', assignedEmployeeId: 'emp-201', dinersCount: 4, occupiedSince: '20:10' },

  // Tables for Sabor del Valle (ID: 3)
  { id: 'tbl-301', restaurantId: '3', number: 'Mesa 1', zone: 'Kiosco Pacífico', capacity: 4, status: 'available' },
  { id: 'tbl-302', restaurantId: '3', number: 'Mesa 2', zone: 'Salón Granada', capacity: 6, status: 'occupied', currentOrderId: 'ord-val-01', assignedEmployeeId: 'emp-301', dinersCount: 4, occupiedSince: '13:10' },

  // Tables for Aliado 5 (Cartagena - Mar & Fuego Caribe)
  { id: 'tbl-501', restaurantId: '5', number: 'Mesa 1', zone: 'Terraza Amurallada', capacity: 4, status: 'occupied', currentOrderId: 'ord-car-01', assignedEmployeeId: 'emp-501', dinersCount: 3, occupiedSince: '19:40' },
  { id: 'tbl-502', restaurantId: '5', number: 'Mesa 2', zone: 'Terraza Amurallada', capacity: 2, status: 'available' },
  { id: 'tbl-503', restaurantId: '5', number: 'Mesa 3', zone: 'Salón Colonial VIP', capacity: 6, status: 'occupied', currentOrderId: 'ord-car-02', assignedEmployeeId: 'emp-501', dinersCount: 5, occupiedSince: '20:15' },
  { id: 'tbl-504', restaurantId: '5', number: 'Mesa 4', zone: 'Salón Colonial VIP', capacity: 8, status: 'reserved', dinersCount: 8 },
  { id: 'tbl-505', restaurantId: '5', number: 'Mesa 5', zone: 'Barra Cócteles Caribe', capacity: 2, status: 'billing', currentOrderId: 'ord-car-03', assignedEmployeeId: 'emp-501', dinersCount: 2, occupiedSince: '19:10' }
];

// Employees for Aliado 5
export const ALIADO_5_EMPLOYEES: TenantEmployee[] = [
  {
    id: 'emp-501',
    restaurantId: '5',
    name: 'Andrés Martínez',
    role: 'mesero',
    email: 'andres@maryfuegocaribe.co',
    phone: '+57 305 889 1234',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    pinCode: '5555',
    shiftStatus: 'active',
    hourlyRateCop: 14000,
    assignedTables: ['Mesa 1', 'Mesa 3', 'Mesa 5'],
    totalOrdersTaken: 184
  },
  {
    id: 'emp-502',
    restaurantId: '5',
    name: 'Chef Nayibe Paternina',
    role: 'cocina',
    email: 'chef.nayibe@maryfuegocaribe.co',
    phone: '+57 300 234 5678',
    avatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=200&q=80',
    pinCode: '5556',
    shiftStatus: 'active',
    hourlyRateCop: 22000,
    totalOrdersTaken: 490
  },
  {
    id: 'emp-503',
    restaurantId: '5',
    name: 'Esteban Cuadrado',
    role: 'cajero',
    email: 'caja@maryfuegocaribe.co',
    phone: '+57 301 998 8776',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    pinCode: '5557',
    shiftStatus: 'active',
    hourlyRateCop: 15000,
    totalOrdersTaken: 620
  }
];

export const CARIBE_CATEGORIES: MenuCategory[] = [
  { id: 'all', restaurantId: '5', name: 'Toda la Carta Caribe', nameEn: 'All Caribbean Menu', icon: 'Utensils' },
  { id: 'mariscos', restaurantId: '5', name: 'Cazuelas & Frutos del Mar', nameEn: 'Seafood & Stews', icon: 'Fish', description: 'Pesca fresca del día traída de Islas del Rosario' },
  { id: 'arroces', restaurantId: '5', name: 'Arroces & Platos Fuertes', nameEn: 'Rice & Main Courses', icon: 'Soup', description: 'Cocinados en fondo de coco y especias cartageneras' },
  { id: 'ceviches', restaurantId: '5', name: 'Ceviches & Entradas Frías', nameEn: 'Ceviches & Starters', icon: 'Salad', description: 'Con leche de tigre de maracuyá y suero costeño' },
  { id: 'cocteles', restaurantId: '5', name: 'Coctelería de Autor', nameEn: 'Craft Cocktails', icon: 'GlassWater', description: 'Ron Dictador, ginebra caribeña y frutas exóticas' }
];

export const CARIBE_MENU_ITEMS: MenuItem[] = [
  {
    id: 'car-01',
    restaurantId: '5',
    name: 'Cazuela de Mariscos al Fuego Caribe',
    nameEn: 'Caribbean Flame Seafood Stew',
    description: 'Camarones tigre, calamares tiernos, pulpo baby, mejillones y filete de corvina en crema sedosa de coco natural, flambeada con ron añejo de Cartagena, acompañada de arroz de coco titoté y patacones crocantes.',
    price: 56000,
    originalPrice: 62000,
    categoryId: 'mariscos',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 20,
    calories: 780,
    dietary: ['chef_special', 'popular'],
    inStock: true,
    isMainCourse: true
  },
  {
    id: 'car-02',
    restaurantId: '5',
    name: 'Pargo Rojo Platero Frito a la Cartagenera',
    nameEn: 'Crispy Whole Red Snapper Cartagenera',
    description: 'Pargo rojo fresco de 600g sazonado en ajo criollo y limón mandarina, frito a la perfección crocante por fuera y jugoso por dentro, con ensalada de aguacate, arroz con coco y tostones.',
    price: 52000,
    categoryId: 'mariscos',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 25,
    calories: 690,
    dietary: ['popular'],
    inStock: true,
    isMainCourse: true
  },
  {
    id: 'car-03',
    restaurantId: '5',
    name: 'Arroz Meloso de Mariscos & Chicharrón',
    nameEn: 'Creamy Seafood & Crispy Pork Rice',
    description: 'Arroz caldoso en reducción de bisque de langostinos, trocitos de chicharrón carnudo tostado, pulpo asado, pimentón ahumado y alioli de ajo asado.',
    price: 49000,
    categoryId: 'arroces',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 22,
    calories: 840,
    dietary: ['chef_special'],
    inStock: true,
    isMainCourse: true
  },
  {
    id: 'car-04',
    restaurantId: '5',
    name: 'Ceviche Mixto en Leche de Tigre de Maracuyá',
    nameEn: 'Mixed Ceviche with Passion Fruit Tiger Milk',
    description: 'Camarones marinados, pulpo y pesca blanca en zumo de maracuyá y lima, cebolla morada en plumas, maíz chulpe crocante, aguacate y chips de plátano verde.',
    price: 38000,
    categoryId: 'ceviches',
    image: 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 12,
    calories: 360,
    dietary: ['gluten_free', 'popular'],
    inStock: true
  },
  {
    id: 'car-05',
    restaurantId: '5',
    name: 'Cóctel Pasión de la Muralla (Ron & Maracuyá)',
    nameEn: 'Wall Passion Signature Cocktail',
    description: 'Ron Dictador 12 Años, infusión de albahaca fresca, pulpa de maracuyá agridulce, licor de naranja y escarchado de sal marina con pimienta rosa.',
    price: 28000,
    categoryId: 'cocteles',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 5,
    calories: 220,
    dietary: ['chef_special'],
    inStock: true
  }
];

export const CAMILO_CATEGORIES: MenuCategory[] = [
  { id: 'all', restaurantId: '1', name: 'Toda la Carta', nameEn: 'Full Menu', icon: 'Utensils' },
  { id: 'parrilla', restaurantId: '1', name: 'Cortes a la Brasa & Asados', nameEn: 'Grilled Steaks & BBQ', icon: 'Beef', description: 'Madurados 21 días al carbón de leña de guayabo' },
  { id: 'tipicos', restaurantId: '1', name: 'Especialidades Paisas', nameEn: 'Traditional Colombian', icon: 'Soup', description: 'Auténticas recetas de la abuela con sazón andina' },
  { id: 'entradas', restaurantId: '1', name: 'Entradas & Picadas', nameEn: 'Appetizers & Platters', icon: 'Salad', description: 'Para compartir entre amigos' },
  { id: 'bebidas', restaurantId: '1', name: 'Bebidas & Coctelería', nameEn: 'Drinks & Cocktails', icon: 'GlassWater', description: 'Jugos naturales en leche o agua, cervezas y refajos' }
];

export const CAMILO_MENU_ITEMS: MenuItem[] = [
  {
    id: 'cam-01',
    restaurantId: '1',
    name: 'Churrasco Angus 400g a la Brasa',
    nameEn: '400g Angus Grilled Churrasco',
    description: 'Corte grueso de bife de chorizo madurado, asado al término deseado con chimichurri casero de finas hierbas, arepa de choclo con quesito y papa salada.',
    descriptionEn: 'Thick cut Angus sirloin steak, grilled to your preference with homemade chimichurri, sweet corn arepa with fresh cheese and salted baby potatoes.',
    price: 48000,
    originalPrice: 52000,
    categoryId: 'parrilla',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 20,
    calories: 890,
    dietary: ['chef_special', 'popular'],
    inStock: true,
    isMainCourse: true,
    optionGroups: [
      {
        id: 'ter-cam',
        title: 'Término de la Carne',
        titleEn: 'Meat Doneness',
        required: true,
        choices: [
          { id: 't-medio', name: 'Término Medio (3/4 Jugoso)', price: 0 },
          { id: 't-tres', name: 'Tres Cuartos (3/4)', price: 0 },
          { id: 't-bien', name: 'Bien Asado', price: 0 }
        ]
      },
      {
        id: 'acom-cam',
        title: 'Acompañamiento Principal',
        titleEn: 'Main Side',
        required: false,
        choices: [
          { id: 'ac-yuca', name: 'Yuca al Vapor con Hogao Criollo', price: 0 },
          { id: 'ac-papas', name: 'Papas a la Francesa Rústicas', price: 0 },
          { id: 'ac-patacon', name: 'Patacón Gigante con Guacamole (+ $4.000)', price: 4000 }
        ]
      }
    ]
  },
  {
    id: 'cam-02',
    restaurantId: '1',
    name: 'Bandeja Paisa Montañera Especial',
    nameEn: 'Special Mountain Bandeja Paisa',
    description: 'Frijoles cargamanto en leña, arroz blanco, chicharrón crocante 100% carnudo de 6 cortes, carne molida en hogao, huevo frito de campo, chorizo artesanal, morcilla, tajada de plátano maduro, arepa y aguacate.',
    descriptionEn: 'Slow-cooked red beans, white rice, extra crispy 6-cut pork belly chicharrón, ground beef, farm fried egg, artisan chorizo, blood sausage, sweet plantain, arepa, and avocado.',
    price: 39500,
    categoryId: 'tipicos',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 15,
    calories: 1250,
    dietary: ['popular', 'chef_special'],
    inStock: true,
    isMainCourse: true
  },
  {
    id: 'cam-03',
    restaurantId: '1',
    name: 'Costillitas BBQ de Guayaba & Ron Medellín',
    nameEn: 'Guava & Medellin Rum Glazed Ribs',
    description: 'Costillar de cerdo San Luis tierno y jugoso de 500g, glaseado con reducción de dulce de guayaba agria y Ron Medellín 8 Años, acompañado de papas casco y ensalada fresca.',
    descriptionEn: 'Tender 500g pork ribs glazed with sweet guava and 8-year Medellin Rum reduction, served with potato wedges and coleslaw.',
    price: 44000,
    categoryId: 'parrilla',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 22,
    calories: 980,
    dietary: ['chef_special'],
    inStock: true,
    isMainCourse: true
  },
  {
    id: 'cam-04',
    restaurantId: '1',
    name: 'Picada Mixta de Fuego (Para 3-4 personas)',
    nameEn: 'Fire Master Mixed Platter (Serves 3-4)',
    description: 'Generosa combinación de lomo de res a la brasa, chicharrón crocante, costilla BBQ, chorizo antioqueño, morcilla artesanal, patacones, papas criollas doradas y arepitas con salsa tártara y ají de la casa.',
    descriptionEn: 'Generous platter with grilled beef tenderloin, crispy pork belly, BBQ ribs, artisan chorizo, Colombian blood sausage, tostones, golden baby potatoes, mini arepas, and dipping sauces.',
    price: 78000,
    originalPrice: 85000,
    categoryId: 'entradas',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 25,
    calories: 1800,
    dietary: ['popular'],
    inStock: true
  },
  {
    id: 'cam-05',
    restaurantId: '1',
    name: 'Cazuelita de Empanadas Vallunas (6 unidades)',
    nameEn: 'Basket of Mini Colombian Beef Empanadas (6 pcs)',
    description: 'Empanadas doraditas de maíz crocante rellenas de carne desmechada sazonada con papa criolla, servidas con ají casero de cilantro y limón.',
    descriptionEn: 'Golden crispy corn dough filled with seasoned shredded beef and potato, served with fresh cilantro lime spicy sauce.',
    price: 18500,
    categoryId: 'entradas',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 10,
    calories: 420,
    dietary: ['popular'],
    inStock: true
  },
  {
    id: 'cam-06',
    restaurantId: '1',
    name: 'Limonada de Coco Cremosa del Caribe',
    nameEn: 'Creamy Caribbean Coconut Limeade',
    description: 'Preparada al momento con leche de coco natural espesa, zumo de limones frescos recién exprimidos y un toque de hierbabuena.',
    descriptionEn: 'Freshly blended with rich natural coconut cream, freshly squeezed lime juice, and a hint of garden mint.',
    price: 12000,
    categoryId: 'bebidas',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 5,
    calories: 210,
    dietary: ['vegetarian'],
    inStock: true
  }
];

export const CAMILO_ORDERS: Order[] = [
  {
    id: 'ord-cam-01',
    restaurantId: '1',
    employeeId: 'emp-101',
    tableNumber: 'Mesa 1',
    orderNumber: 'CAM-8012',
    createdAt: '2026-08-19T14:20:00.000Z',
    orderType: 'dinein',
    status: 'preparing',
    subtotal: 96000,
    deliveryFee: 0,
    serviceFee: 9600,
    tip: 9600,
    discount: 0,
    total: 115200,
    paymentMethod: 'card',
    paymentStatus: 'pending',
    estimatedDeliveryTime: '15 min',
    customer: {
      name: 'Dr. Alejandro Restrepo',
      email: 'alejandro.restrepo@epm.com.co',
      phone: '+57 312 890 1234',
      tableNumber: 'Mesa 1'
    },
    items: [
      {
        cartId: 'item-1',
        menuItem: CAMILO_MENU_ITEMS[0],
        quantity: 2,
        selectedOptions: [
          { groupId: 'ter-cam', groupTitle: 'Término', choiceId: 't-medio', choiceName: 'Término Medio', price: 0 }
        ],
        totalPrice: 96000
      }
    ],
    statusHistory: [
      { status: 'received', timestamp: '14:20' },
      { status: 'preparing', timestamp: '14:23', note: 'En brasa de carbón' }
    ]
  },
  {
    id: 'ord-cam-02',
    restaurantId: '1',
    employeeId: 'emp-101',
    tableNumber: 'Mesa 3',
    orderNumber: 'CAM-8013',
    createdAt: '2026-08-19T14:45:00.000Z',
    orderType: 'dinein',
    status: 'ready',
    subtotal: 117500,
    deliveryFee: 0,
    serviceFee: 11750,
    tip: 10000,
    discount: 0,
    total: 139250,
    paymentMethod: 'nequi',
    paymentStatus: 'paid',
    estimatedDeliveryTime: 'Listo para servir',
    customer: {
      name: 'Familia Gómez Londoño',
      email: 'mariana.gomez@gmail.com',
      phone: '+57 300 456 7890',
      tableNumber: 'Mesa 3'
    },
    items: [
      {
        cartId: 'item-2',
        menuItem: CAMILO_MENU_ITEMS[1],
        quantity: 2,
        selectedOptions: [],
        totalPrice: 79000
      },
      {
        cartId: 'item-3',
        menuItem: CAMILO_MENU_ITEMS[4],
        quantity: 1,
        selectedOptions: [],
        totalPrice: 18500
      },
      {
        cartId: 'item-4',
        menuItem: CAMILO_MENU_ITEMS[5],
        quantity: 2,
        selectedOptions: [],
        totalPrice: 24000
      }
    ],
    statusHistory: [
      { status: 'received', timestamp: '14:45' },
      { status: 'preparing', timestamp: '14:47' },
      { status: 'ready', timestamp: '15:02', note: 'Listo en pase de cocina' }
    ]
  },
  {
    id: 'ord-cam-03',
    restaurantId: '1',
    employeeId: 'emp-101',
    tableNumber: 'Mesa 4',
    orderNumber: 'CAM-8014',
    createdAt: '2026-08-19T13:50:00.000Z',
    orderType: 'dinein',
    status: 'delivered',
    subtotal: 62500,
    deliveryFee: 0,
    serviceFee: 6250,
    tip: 6250,
    discount: 0,
    total: 75000,
    paymentMethod: 'daviplata',
    paymentStatus: 'pending',
    estimatedDeliveryTime: 'En cuenta / Facturación',
    customer: {
      name: 'Simón Bolívar Uribe',
      email: 'simon.uribe@bancolombia.com.co',
      phone: '+57 318 234 5678',
      tableNumber: 'Mesa 4'
    },
    items: [
      {
        cartId: 'item-5',
        menuItem: CAMILO_MENU_ITEMS[2],
        quantity: 1,
        selectedOptions: [],
        totalPrice: 44000
      },
      {
        cartId: 'item-6',
        menuItem: CAMILO_MENU_ITEMS[4],
        quantity: 1,
        selectedOptions: [],
        totalPrice: 18500
      }
    ],
    statusHistory: [
      { status: 'received', timestamp: '13:50' },
      { status: 'preparing', timestamp: '13:53' },
      { status: 'ready', timestamp: '14:10' },
      { status: 'delivered', timestamp: '14:12' }
    ]
  }
];

export function getTenantCategories(tenantId: string): MenuCategory[] {
  if (tenantId === '1') return CAMILO_CATEGORIES;
  if (tenantId === '5') return CARIBE_CATEGORIES;
  return [
    { id: 'all', restaurantId: tenantId, name: 'Toda la Carta', nameEn: 'All Menu', icon: 'Utensils' },
    { id: 'principales', restaurantId: tenantId, name: 'Platos Fuertes & Especialidades', nameEn: 'Main Courses', icon: 'UtensilsCrossed' },
    { id: 'entradas', restaurantId: tenantId, name: 'Entradas & Tapas', nameEn: 'Starters', icon: 'Salad' },
    { id: 'bebidas', restaurantId: tenantId, name: 'Bebidas & Coctelería', nameEn: 'Drinks', icon: 'GlassWater' },
    { id: 'postres', restaurantId: tenantId, name: 'Postres Artesanales', nameEn: 'Desserts', icon: 'Sparkles' }
  ];
}

export function getTenantMenuItems(tenantId: string): MenuItem[] {
  if (tenantId === '1') return CAMILO_MENU_ITEMS;
  if (tenantId === '5') return CARIBE_MENU_ITEMS;
  
  // Fallback enriched menu
  return [
    {
      id: `${tenantId}-01`,
      restaurantId: tenantId,
      name: 'Especialidad de la Casa al Horno de Leña',
      nameEn: 'House Wood-Fired Special',
      description: 'Receta insignia del chef con ingredientes locales frescos, reducción de hierbas aromáticas y guarnición de la casa.',
      price: 45000,
      categoryId: 'principales',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      prepTimeMinutes: 20,
      calories: 750,
      dietary: ['chef_special', 'popular'],
      inStock: true,
      isMainCourse: true
    },
    {
      id: `${tenantId}-02`,
      restaurantId: tenantId,
      name: 'Entrada Fusión para Compartir',
      nameEn: 'Fusion Starter Platter',
      description: 'Selección de bocados crocantes acompañados de dips artesanales y especias seleccionadas.',
      price: 24000,
      categoryId: 'entradas',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      prepTimeMinutes: 12,
      calories: 420,
      dietary: ['popular'],
      inStock: true
    },
    {
      id: `${tenantId}-03`,
      restaurantId: tenantId,
      name: 'Bebida Refrescante Artesanal de la Casa',
      nameEn: 'Artisan Signature Refresher',
      description: 'Infusión fresca de frutas colombianas con hierbas de huerta y hielo frappé.',
      price: 12500,
      categoryId: 'bebidas',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
      prepTimeMinutes: 5,
      calories: 180,
      dietary: ['vegetarian'],
      inStock: true
    }
  ];
}

import { InventoryItem } from '../types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  // Camilo (Tenant 1)
  {
    id: 'inv-101',
    restaurantId: '1',
    name: 'Bife de Chorizo Angus Prime (Corte 400g)',
    sku: 'CARN-ANG-01',
    category: 'carnes',
    currentStock: 48,
    minStockAlert: 15,
    unit: 'porcion',
    costPerUnitCop: 22000,
    lastRestockedAt: '2026-08-18',
    linkedMenuItemId: 'cam-01',
    deductionPerPortion: 1
  },
  {
    id: 'inv-102',
    restaurantId: '1',
    name: 'Punta de Anca Madurada al Vacío (350g)',
    sku: 'CARN-PNT-02',
    category: 'carnes',
    currentStock: 34,
    minStockAlert: 12,
    unit: 'porcion',
    costPerUnitCop: 19500,
    lastRestockedAt: '2026-08-19',
    linkedMenuItemId: 'cam-02',
    deductionPerPortion: 1
  },
  {
    id: 'inv-103',
    restaurantId: '1',
    name: 'Costillas BBQ en Reducción de Panela',
    sku: 'CARN-RIB-03',
    category: 'carnes',
    currentStock: 25,
    minStockAlert: 10,
    unit: 'porcion',
    costPerUnitCop: 18000,
    lastRestockedAt: '2026-08-17',
    linkedMenuItemId: 'cam-03',
    deductionPerPortion: 1
  },
  {
    id: 'inv-104',
    restaurantId: '1',
    name: 'Vino Tinto Malbec Reserva Argentino (750ml)',
    sku: 'VIN-MALB-01',
    category: 'vinos',
    currentStock: 18,
    minStockAlert: 6,
    unit: 'botella',
    costPerUnitCop: 45000,
    lastRestockedAt: '2026-08-15'
  },
  {
    id: 'inv-105',
    restaurantId: '1',
    name: 'Queso Provolone Ahumado Parrillero',
    sku: 'LAC-PROV-01',
    category: 'lacteos',
    currentStock: 8,
    minStockAlert: 10, // Critically low alert
    unit: 'kg',
    costPerUnitCop: 38000,
    lastRestockedAt: '2026-08-10',
    linkedMenuItemId: 'cam-04',
    deductionPerPortion: 0.2
  },

  // Milenia Bogotá (Tenant 2)
  {
    id: 'inv-201',
    restaurantId: '2',
    name: 'Lomo Fino Angus en Costra de Trufa Negra',
    sku: 'MIL-LOM-01',
    category: 'carnes',
    currentStock: 42,
    minStockAlert: 15,
    unit: 'porcion',
    costPerUnitCop: 35000,
    lastRestockedAt: '2026-08-19',
    linkedMenuItemId: '2-01',
    deductionPerPortion: 1
  },
  {
    id: 'inv-202',
    restaurantId: '2',
    name: 'Cava Champagne Grand Cru (750ml)',
    sku: 'MIL-CHAMP-01',
    category: 'vinos',
    currentStock: 22,
    minStockAlert: 8,
    unit: 'botella',
    costPerUnitCop: 120000,
    lastRestockedAt: '2026-08-16'
  },
  {
    id: 'inv-203',
    restaurantId: '2',
    name: 'Aceite de Oliva Extra Virgen con Trufa Blanca',
    sku: 'MIL-OIL-TRUF',
    category: 'abarrotes',
    currentStock: 12,
    minStockAlert: 4,
    unit: 'litro',
    costPerUnitCop: 85000,
    lastRestockedAt: '2026-08-14'
  },

  // Mar & Fuego Caribe Cartagena (Tenant 5)
  {
    id: 'inv-501',
    restaurantId: '5',
    name: 'Camarón Tigre Fresco del Pacífico (Pelado y Desvenado)',
    sku: 'CAR-CAM-01',
    category: 'carnes',
    currentStock: 35,
    minStockAlert: 10,
    unit: 'kg',
    costPerUnitCop: 42000,
    lastRestockedAt: '2026-08-19',
    linkedMenuItemId: 'car-01',
    deductionPerPortion: 0.25
  },
  {
    id: 'inv-502',
    restaurantId: '5',
    name: 'Pargo Rojo Fresco Platero (500g c/u)',
    sku: 'CAR-PARG-02',
    category: 'carnes',
    currentStock: 28,
    minStockAlert: 12,
    unit: 'unidad',
    costPerUnitCop: 21000,
    lastRestockedAt: '2026-08-19',
    linkedMenuItemId: 'car-02',
    deductionPerPortion: 1
  },
  {
    id: 'inv-503',
    restaurantId: '5',
    name: 'Ron Dictador 12 Años Reserva Cartagena',
    sku: 'CAR-RON-12',
    category: 'licores',
    currentStock: 16,
    minStockAlert: 5,
    unit: 'botella',
    costPerUnitCop: 78000,
    lastRestockedAt: '2026-08-12'
  }
];

export function getTenantInventory(tenantId: string): InventoryItem[] {
  const filtered = INITIAL_INVENTORY.filter(i => i.restaurantId === tenantId);
  if (filtered.length > 0) return filtered;
  return [
    {
      id: `inv-${tenantId}-01`,
      restaurantId: tenantId,
      name: 'Insumo Base Principal de Cocina',
      sku: 'GEN-INS-01',
      category: 'abarrotes',
      currentStock: 50,
      minStockAlert: 15,
      unit: 'kg',
      costPerUnitCop: 15000,
      lastRestockedAt: '2026-08-18'
    },
    {
      id: `inv-${tenantId}-02`,
      restaurantId: tenantId,
      name: 'Bebidas & Licores de la Casa',
      sku: 'GEN-LIC-02',
      category: 'licores',
      currentStock: 24,
      minStockAlert: 8,
      unit: 'botella',
      costPerUnitCop: 35000,
      lastRestockedAt: '2026-08-18'
    }
  ];
}

export function getTenantMenu(tenantId: string): MenuItem[] {
  return getTenantMenuItems(tenantId);
}

export function getTenantOrders(tenantId: string): Order[] {
  if (tenantId === '1') return CAMILO_ORDERS;
  return CAMILO_ORDERS.map(o => ({
    ...o,
    id: `${o.id}-${tenantId}`,
    restaurantId: tenantId
  }));
}

export function getTenantReservations(tenantId: string): TableReservation[] {
  return [
    {
      id: `res-${tenantId}-01`,
      restaurantId: tenantId,
      guestName: 'Dr. Alejandro Restrepo',
      guestEmail: 'alejandro.restrepo@epm.com.co',
      guestPhone: '+57 312 890 1234',
      date: '2026-08-20',
      time: '20:00',
      guestsCount: 4,
      seatingArea: 'terrace',
      status: 'confirmed',
      tableAssigned: 'Mesa 5',
      reservationCode: 'RES-8821',
      createdAt: '2026-08-19'
    }
  ];
}




