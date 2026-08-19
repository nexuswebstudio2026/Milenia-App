import { MenuItem, MenuCategory, RestaurantLocation, RestaurantReview, RestaurantConfig, Order, TableReservation } from '../types';

export const INITIAL_CATEGORIES: MenuCategory[] = [
  { id: 'all', name: 'Todos los Platos', nameEn: 'All Dishes', icon: 'Utensils' },
  { id: 'pizzas', name: 'Pizzas Artesanales', nameEn: 'Artisan Pizzas', icon: 'Pizza', description: 'Masa madre fermentada 48h en horno de piedra' },
  { id: 'burgers', name: 'Hamburguesas Gourmet', nameEn: 'Gourmet Burgers', icon: 'Beef', description: 'Carne 100% Black Angus y pan brioche horneado a diario' },
  { id: 'mains', name: 'Pastas & Platos Fuertes', nameEn: 'Pastas & Mains', icon: 'Soup', description: 'Recetas de autor elaboradas con ingredientes frescos' },
  { id: 'starters', name: 'Entrantes & Tapas', nameEn: 'Starters & Tapas', icon: 'Salad', description: 'Para compartir y abrir el apetito' },
  { id: 'desserts', name: 'Postres Caseros', nameEn: 'Artisan Desserts', icon: 'Cake', description: 'Dulces tentaciones preparadas por nuestro maestro pastelero' },
  { id: 'drinks', name: 'Bebidas & Cócteles', nameEn: 'Drinks & Cocktails', icon: 'GlassWater', description: 'Cervezas artesanales, vinos selectos y sodas naturales' },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'pz-01',
    name: 'Pizza Margherita Di Bufala DOP',
    nameEn: 'Margherita Di Bufala DOP Pizza',
    description: 'Salsa de tomate San Marzano, mozzarella di bufala campana DOP, albahaca fresca y aceite de oliva virgen extra.',
    descriptionEn: 'San Marzano tomato sauce, fresh DOP buffalo mozzarella, fresh basil, and extra virgin olive oil.',
    price: 14.50,
    categoryId: 'pizzas',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 15,
    calories: 820,
    dietary: ['vegetarian', 'chef_special', 'popular'],
    inStock: true,
    optionGroups: [
      {
        id: 'size',
        title: 'Tamaño de Pizza',
        titleEn: 'Pizza Size',
        required: true,
        choices: [
          { id: 'sz-med', name: 'Mediana (30 cm - 8 porciones)', nameEn: 'Medium (12" - 8 slices)', price: 0 },
          { id: 'sz-fam', name: 'Familiar (38 cm - 12 porciones)', nameEn: 'Large (15" - 12 slices)', price: 5.00 },
        ]
      },
      {
        id: 'crust',
        title: 'Tipo de Masa',
        titleEn: 'Crust Type',
        required: false,
        choices: [
          { id: 'cr-trad', name: 'Masa Tradicional Napolitana', nameEn: 'Traditional Neapolitan', price: 0 },
          { id: 'cr-cheese', name: 'Borde Relleno de Queso Ricotta', nameEn: 'Ricotta Cheese Stuffed Crust', price: 2.50 },
          { id: 'cr-glutenfree', name: 'Base Sin Gluten', nameEn: 'Gluten-Free Base', price: 3.00 },
        ]
      },
      {
        id: 'extras',
        title: 'Ingredientes Extra',
        titleEn: 'Extra Toppings',
        required: false,
        maxSelect: 3,
        choices: [
          { id: 'ex-prosciutto', name: 'Prosciutto di Parma (+€2.50)', nameEn: 'Prosciutto di Parma', price: 2.50 },
          { id: 'ex-mushrooms', name: 'Champiñones Trufados (+€1.50)', nameEn: 'Truffled Mushrooms', price: 1.50 },
          { id: 'ex-spicy-oil', name: 'Aceite de Guindilla Picante (+€0.50)', nameEn: 'Spicy Chili Oil', price: 0.50 },
        ]
      }
    ]
  },
  {
    id: 'pz-02',
    name: 'Pizza Trufata con Boletus y Jamón',
    nameEn: 'Truffled Porcini & Iberian Ham Pizza',
    description: 'Crema de trufa negra, mozzarella fior di latte, boletus salteados, lascas de jamón ibérico y rúcula fresca.',
    descriptionEn: 'Black truffle cream, fior di latte mozzarella, sautéed porcini mushrooms, Iberian ham shavings, and baby arugula.',
    price: 18.00,
    categoryId: 'pizzas',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 18,
    calories: 950,
    dietary: ['chef_special', 'popular'],
    inStock: true,
    optionGroups: [
      {
        id: 'size',
        title: 'Tamaño de Pizza',
        titleEn: 'Pizza Size',
        required: true,
        choices: [
          { id: 'sz-med', name: 'Mediana (30 cm)', nameEn: 'Medium (12")', price: 0 },
          { id: 'sz-fam', name: 'Familiar (38 cm)', nameEn: 'Large (15")', price: 5.50 },
        ]
      }
    ]
  },
  {
    id: 'pz-03',
    name: 'Pizza Diavola Piccante',
    nameEn: 'Spicy Diavola Pizza',
    description: 'Tomate San Marzano, mozzarella, salame picante calabrese, jalapeños encurtidos y toque de miel picante Hot Honey.',
    descriptionEn: 'San Marzano tomatoes, mozzarella, spicy Calabrian salami, pickled jalapeños, and hot honey drizzle.',
    price: 15.50,
    originalPrice: 17.00,
    categoryId: 'pizzas',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 15,
    calories: 890,
    dietary: ['spicy', 'popular'],
    inStock: true,
  },
  {
    id: 'bg-01',
    name: 'MILENIA Monster Smash Burger',
    nameEn: 'MILENIA Monster Smash Burger',
    description: 'Doble disco de 100g Black Angus smash crujiente, queso cheddar americano fundido, bacon caramelizado, pepinillos y salsa secreta MILENIA.',
    descriptionEn: 'Double 100g Black Angus smashed patties, melted American cheddar, crispy caramelized bacon, pickles, and signature MILENIA sauce.',
    price: 13.90,
    originalPrice: 15.50,
    categoryId: 'burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 14,
    calories: 1050,
    dietary: ['chef_special', 'popular'],
    inStock: true,
    optionGroups: [
      {
        id: 'doneness',
        title: 'Punto de la Carne',
        titleEn: 'Meat Doneness',
        required: true,
        choices: [
          { id: 'dn-med', name: 'Al Punto Jugoso', nameEn: 'Medium Juicy', price: 0 },
          { id: 'dn-well', name: 'Bien Hecha', nameEn: 'Well Done', price: 0 },
        ]
      },
      {
        id: 'fries',
        title: 'Guarnición Incluida',
        titleEn: 'Included Side',
        required: true,
        choices: [
          { id: 'fr-french', name: 'Patatas Fritas Rústicas', nameEn: 'Rustic French Fries', price: 0 },
          { id: 'fr-sweet', name: 'Boniato / Sweet Potato Fries (+€1.50)', nameEn: 'Sweet Potato Fries', price: 1.50 },
          { id: 'fr-salad', name: 'Ensalada Mixta Ligera', nameEn: 'Side Green Salad', price: 0 },
        ]
      },
      {
        id: 'extra-burger',
        title: 'Extras para la Hamburguesa',
        titleEn: 'Burger Add-ons',
        required: false,
        choices: [
          { id: 'ex-patty', name: 'Carne Extra Smash (+€3.00)', nameEn: 'Extra Smash Patty', price: 3.00 },
          { id: 'ex-egg', name: 'Huevo Frito de Corral (+€1.20)', nameEn: 'Fried Farm Egg', price: 1.20 },
          { id: 'ex-cheese-dip', name: 'Jeringa / Dip de Queso Cheddar Caliente (+€2.00)', nameEn: 'Hot Cheddar Cheese Dip', price: 2.00 },
        ]
      }
    ]
  },
  {
    id: 'bg-02',
    name: 'Truffle & Brie Gourmet Burger',
    nameEn: 'Truffle & Brie Gourmet Burger',
    description: 'Medallón de buey madurado 180g, queso brie francés gratinado, cebolla pochada al Pedro Ximénez y mayonesa de trufa blanca.',
    descriptionEn: '180g dry-aged beef patty, melted French brie, caramelized onions with Pedro Ximénez, and white truffle mayo.',
    price: 16.50,
    categoryId: 'burgers',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 16,
    calories: 980,
    dietary: ['chef_special'],
    inStock: true,
  },
  {
    id: 'bg-03',
    name: 'Vegan Beyond Guacamole Burger',
    nameEn: 'Vegan Beyond Guacamole Burger',
    description: 'Burguer Beyond Meat 100% vegetal, guacamole fresco con pico de gallo, lechuga roble, tomate raf y queso vegano en pan brioche vegano.',
    descriptionEn: '100% plant-based Beyond Meat patty, fresh chunky guacamole, pico de gallo, crisp lettuce, and vegan melted cheese.',
    price: 14.00,
    categoryId: 'burgers',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 12,
    calories: 680,
    dietary: ['vegan', 'vegetarian'],
    inStock: true,
  },
  {
    id: 'mn-00-wagyu',
    name: 'Solomillo de Wagyu A5 con Reducción de Oporto',
    nameEn: 'A5 Wagyu Tenderloin with Vintage Port Reduction',
    description: 'Solomillo de Wagyu japonés A5 Kagoshima marcado al sarmiento, flor de sal Maldon, chalotas glaseadas y jugo concentrado de trufa negra.',
    descriptionEn: 'Japanese A5 Kagoshima Wagyu tenderloin seared over grapevine charcoal, Maldon salt flakes, glazed shallots, and concentrated black truffle jus.',
    price: 34.00,
    categoryId: 'mains',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 20,
    calories: 720,
    dietary: ['chef_special', 'keto', 'gluten_free'],
    inStock: true,
    isMainCourse: true,
    winePairing: {
      id: 'wine-ribera-reserva',
      name: 'Maridaje Sommelier: Ribera del Duero Reserva 2019',
      nameEn: 'Sommelier Pairing: Ribera del Duero Reserva 2019',
      vintage: '2019',
      grapeVariety: '100% Tempranillo Tinta del País',
      region: 'Ribera del Duero, España',
      description: 'Crianza de 24 meses en roble francés. Notas a frutos negros maduros, cacao fino, cuero y taninos sedosos que potencian el Wagyu.',
      descriptionEn: 'Aged 24 months in French oak. Notes of ripe dark berries, fine cocoa, leather, and silky tannins that elevate Wagyu.',
      price: 8.50,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
      type: 'red'
    },
    suggestedSide: {
      id: 'side-pure-robuchon',
      name: 'Puré Cremoso Robuchon con Trufa Negra Melanosporum',
      nameEn: 'Robuchon Velvety Truffle Potato Puree',
      description: 'Puré sedoso con mantequilla normanda artesanal y láminas de trufa negra fresca rallada al momento.',
      descriptionEn: 'Silky whipped potato purée with cultured Normandy butter and freshly shaved black winter truffle.',
      price: 5.50,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    id: 'mn-01',
    name: 'Fettuccine Cremoso con Gambones y Trufa',
    nameEn: 'Creamy Fettuccine with King Prawns & Truffle',
    description: 'Pasta fresca al huevo salteada con gambones salvajes al ajillo, salsa aterciopelada de parmesano Reggiano 24 meses y lascas de trufa.',
    descriptionEn: 'Fresh egg pasta tossed with wild garlic king prawns, velvety 24-month Parmigiano Reggiano sauce, and shaved summer truffles.',
    price: 16.90,
    categoryId: 'mains',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 18,
    calories: 780,
    dietary: ['chef_special'],
    inStock: true,
    isMainCourse: true,
    winePairing: {
      id: 'wine-chablis-premier',
      name: 'Maridaje Sommelier: Chablis Premier Cru Domaine 2021',
      nameEn: 'Sommelier Pairing: Chablis Premier Cru 2021',
      vintage: '2021',
      grapeVariety: '100% Chardonnay',
      region: 'Borgoña, Francia',
      description: 'Elegancia mineral con recuerdos a cítricos frescos, manzana verde y mantequilla fina, ideal para la cremosidad de la pasta.',
      descriptionEn: 'Mineral elegance with fresh citrus, green apple, and fine butter notes, perfect for creamy pasta.',
      price: 7.90,
      image: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=600&q=80',
      type: 'white'
    },
    suggestedSide: {
      id: 'side-esparragos-brasa',
      name: 'Espárragos Trigueros a la Brasa con Parmesano Crujiente',
      nameEn: 'Charcoal Grilled Asparagus with Crispy Parmesan',
      description: 'Espárragos verdes asados al carbón con aceite de oliva virgen extra, sal en escamas y crujiente de queso curado.',
      descriptionEn: 'Charcoal grilled green asparagus with extra virgin olive oil, sea salt flakes, and aged parmesan crisp.',
      price: 4.80,
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    id: 'mn-02',
    name: 'Costillar BBQ Ahumado St. Louis',
    nameEn: 'St. Louis Smoked BBQ Baby Back Ribs',
    description: 'Costillar tierno glaseado con nuestra salsa barbacoa de bourbon y miel, acompañado de mazorca de maíz a la brasa y patatas asadas.',
    descriptionEn: 'Fall-off-the-bone pork ribs glazed with signature honey bourbon BBQ sauce, grilled sweet corn on the cob, and roasted potatoes.',
    price: 19.50,
    categoryId: 'mains',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 20,
    calories: 1120,
    dietary: ['gluten_free', 'popular'],
    inStock: true,
    isMainCourse: true,
    winePairing: {
      id: 'wine-priorat-crianza',
      name: 'Maridaje Sommelier: Priorat Tinto Finca Dofí 2020',
      nameEn: 'Sommelier Pairing: Priorat Tinto Finca Dofí 2020',
      vintage: '2020',
      grapeVariety: 'Garnacha & Cariñena',
      region: 'Priorat, Cataluña',
      description: 'Gran potencia aromática de fruta madura, hierbas mediterráneas y fondo de pizarra licorella que acompaña el ahumado.',
      descriptionEn: 'Aromatic intensity of ripe berry fruit, Mediterranean herbs, and slate mineral notes complementing smoked meat.',
      price: 9.00,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
      type: 'red'
    }
  },
  {
    id: 'mn-03-salmon-keto',
    name: 'Lomo de Salmón Noruego Salvaje & Aguacate Braseado',
    nameEn: 'Wild Norwegian Salmon & Charred Avocado (Keto)',
    description: 'Suprema de salmón salvaje al punto sobre crema de aguacate Hass al limón verde, espárragos trigueros y sésamo tostado.',
    descriptionEn: 'Wild Norwegian salmon supreme over smooth Hass avocado lime crema, grilled green asparagus, and toasted sesame.',
    price: 21.50,
    categoryId: 'mains',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 16,
    calories: 590,
    dietary: ['keto', 'gluten_free', 'chef_special'],
    inStock: true,
    isMainCourse: true,
    winePairing: {
      id: 'wine-albarino-rias',
      name: 'Maridaje Sommelier: Albariño Rías Baixas Selección 2022',
      nameEn: 'Sommelier Pairing: Albariño Rías Baixas 2022',
      vintage: '2022',
      grapeVariety: '100% Albariño',
      region: 'Rías Baixas, Galicia',
      description: 'Fresco, salino y vibrante con matices de flor blanca y melocotón de viña, ideal para el salmón graso y el aguacate.',
      descriptionEn: 'Crisp, saline, and vibrant with white peach and floral notes, pairing harmoniously with wild salmon.',
      price: 6.80,
      image: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=600&q=80',
      type: 'white'
    }
  },
  {
    id: 'mn-04-risotto-vegano',
    name: 'Risotto Cremoso de Boletus Edulis & Espinacas Baby',
    nameEn: 'Vegan Creamy Porcini & Baby Spinach Risotto',
    description: 'Arroz Carnaroli mantecado con leche de almendra tostada casera, boletus silvestres, aceite de trufa blanca y piñones tostados.',
    descriptionEn: 'Carnaroli rice folded with house toasted almond cream, wild porcini mushrooms, white truffle oil, and roasted pine nuts.',
    price: 17.50,
    categoryId: 'mains',
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 18,
    calories: 540,
    dietary: ['vegan', 'vegetarian', 'gluten_free', 'chef_special'],
    inStock: true,
    isMainCourse: true
  },
  {
    id: 'ds-01',
    name: 'Tarta de Queso Fluida al Horno Donostiarra',
    nameEn: 'Basque Creamy Baked Cheesecake',
    description: 'Receta tradicional vasca con corazón cremoso fundente y superficie tostada caramelizada. Acompañada de coulis de frutos rojos silvestres.',
    descriptionEn: 'Traditional Basque-style creamy baked cheesecake with caramelized top and warm wild berry coulis.',
    price: 6.50,
    categoryId: 'desserts',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 5,
    calories: 450,
    dietary: ['vegetarian', 'chef_special', 'popular'],
    inStock: true,
  },
  {
    id: 'ds-02',
    name: 'Coulant de Chocolate Valrhona con Helado de Vainilla',
    nameEn: 'Valrhona Chocolate Lava Cake with Vanilla Ice Cream',
    description: 'Bizcocho tibio de chocolate negro 70% con corazón de lava caliente, servido con bola de helado artesano de vainilla de Madagascar.',
    descriptionEn: 'Warm 70% dark molten chocolate cake oozing rich chocolate ganache, served with artisan Madagascar vanilla bean gelato.',
    price: 7.00,
    categoryId: 'desserts',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 8,
    calories: 580,
    dietary: ['vegetarian'],
    inStock: true,
  },
  {
    id: 'dr-01',
    name: 'Limonada de Frambuesa & Menta Fresca (500ml)',
    nameEn: 'Fresh Raspberry & Mint Lemonade (500ml)',
    description: 'Elaborada al momento con zumo de limones exprimidos, puré natural de frambuesas silvestres, hojas de menta y agua con gas.',
    descriptionEn: 'Freshly squeezed lemon juice, wild raspberry purée, garden mint, and sparkling mineral water.',
    price: 4.20,
    categoryId: 'drinks',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 5,
    calories: 120,
    dietary: ['vegan', 'gluten_free'],
    inStock: true,
  },
  {
    id: 'dr-02',
    name: 'Cerveza Artesana IPA Igniter Brewing (33cl)',
    nameEn: 'Igniter Craft IPA Beer (33cl)',
    description: 'Cerveza artesanal rubia con notas cítricas, lúpulo aromático Mosaic y un amargor balanceado y refrescante.',
    descriptionEn: 'House artisan craft IPA with aromatic citrus notes, Mosaic hops, and crisp refreshing finish. 5.8% ABV.',
    price: 4.80,
    categoryId: 'drinks',
    image: 'https://images.unsplash.com/photo-1608270193106-96b6e4e5e493?auto=format&fit=crop&w=800&q=80',
    prepTimeMinutes: 2,
    calories: 160,
    dietary: ['vegan'],
    inStock: true,
  }
];

export const INITIAL_LOCATIONS: RestaurantLocation[] = [
  {
    id: 'loc-center',
    name: 'MILENIA Central Bistro & Cava',
    address: 'Av. Principal del Gourmet 42, Centro',
    city: 'Madrid / Capital',
    phone: '+34 912 345 678',
    email: 'central@milenia-restaurant.com',
    rating: 4.9,
    reviewCount: 428,
    isOpen: true,
    openingHours: [
      { days: 'Lunes a Jueves', daysEn: 'Mon to Thu', hours: '12:30 - 23:30' },
      { days: 'Viernes y Sábados', daysEn: 'Fri to Sat', hours: '12:30 - 00:30' },
      { days: 'Domingos', daysEn: 'Sundays', hours: '13:00 - 23:00' },
    ],
    deliveryTimeEstimate: '25 - 35 min',
    pickupTimeEstimate: '15 - 20 min',
    minDeliveryOrder: 15.00,
    deliveryFee: 2.50,
    deliveryRadiusKm: 6.5,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    coordinates: { lat: 40.4168, lng: -3.7038 }
  },
  {
    id: 'loc-north',
    name: 'MILENIA North Patio & Grill',
    address: 'Paseo de la Terraza 118, Zona Norte',
    city: 'Madrid Norte',
    phone: '+34 915 889 900',
    email: 'norte@milenia-restaurant.com',
    rating: 4.8,
    reviewCount: 290,
    isOpen: true,
    openingHours: [
      { days: 'Martes a Domingo', daysEn: 'Tue to Sun', hours: '13:00 - 23:30' },
      { days: 'Lunes', daysEn: 'Mondays', hours: 'Cerrado por descanso' },
    ],
    deliveryTimeEstimate: '30 - 40 min',
    pickupTimeEstimate: '15 - 20 min',
    minDeliveryOrder: 18.00,
    deliveryFee: 2.90,
    deliveryRadiusKm: 8.0,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    coordinates: { lat: 40.4680, lng: -3.6890 }
  }
];

export const INITIAL_REVIEWS: RestaurantReview[] = [
  {
    id: 'rev-01',
    author: 'Elena Gómez M.',
    rating: 5,
    date: 'Hace 2 días',
    comment: '¡La mejor pizza Margherita que he probado en años! La masa es suave y el sabor de la albahaca con la mozzarella de búfala es de otro nivel. El pedido a domicilio llegó caliente en 25 minutos.',
    foodRating: 5,
    serviceRating: 5,
    speedRating: 5,
    verifiedOrder: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'rev-02',
    author: 'Marcos Benítez',
    rating: 5,
    date: 'Hace 4 días',
    comment: 'La Smash Burger con salsa Igniter es insuperable. Las patatas rústicas crujientes y la tarta de queso de postre fue el broche de oro. La plataforma de pedidos es comodísima.',
    foodRating: 5,
    serviceRating: 5,
    speedRating: 4,
    verifiedOrder: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'rev-03',
    author: 'Sofía Valenzuela',
    rating: 4.8,
    date: 'Hace 1 semana',
    comment: 'Reservamos mesa en la terraza para un cumpleaños y la atención del personal fue maravillosa. Nos asignaron una mesa espaciosa y los entrantes salieron súper rápido.',
    foodRating: 5,
    serviceRating: 5,
    speedRating: 4.5,
    verifiedOrder: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-8491',
    orderNumber: 'TI-8491',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    orderType: 'delivery',
    status: 'preparing',
    items: [
      {
        cartId: 'c-1',
        menuItem: INITIAL_MENU_ITEMS[0],
        quantity: 2,
        selectedOptions: [
          { groupId: 'size', groupTitle: 'Tamaño', choiceId: 'sz-med', choiceName: 'Mediana (30 cm)', price: 0 }
        ],
        totalPrice: 29.00
      },
      {
        cartId: 'c-2',
        menuItem: INITIAL_MENU_ITEMS[3],
        quantity: 1,
        selectedOptions: [
          { groupId: 'doneness', groupTitle: 'Punto', choiceId: 'dn-med', choiceName: 'Al Punto', price: 0 },
          { groupId: 'fries', groupTitle: 'Guarnición', choiceId: 'fr-french', choiceName: 'Patatas Fritas Rústicas', price: 0 }
        ],
        totalPrice: 13.90
      },
      {
        cartId: 'c-3',
        menuItem: INITIAL_MENU_ITEMS[10],
        quantity: 2,
        selectedOptions: [],
        totalPrice: 8.40
      }
    ],
    customer: {
      name: 'Alejandro Morales',
      email: 'alejandro.m@example.com',
      phone: '+34 622 998 114',
      deliveryAddress: {
        street: 'Calle de Alcalá 140, 3º Izq',
        city: 'Madrid',
        zip: '28009',
        notes: 'Timbre Morales, puerta blanca'
      }
    },
    subtotal: 51.30,
    deliveryFee: 0,
    serviceFee: 1.50,
    tip: 3.00,
    discount: 5.13,
    discountCode: 'MILENIA10',
    total: 50.67,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    estimatedDeliveryTime: '25 min',
    driver: {
      name: 'Carlos Mendoza',
      phone: '+34 699 112 334',
      vehicle: 'Moto Honda SH125 (Matrícula 4920-KLT)',
      rating: 4.95
    },
    statusHistory: [
      { status: 'received', timestamp: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Pedido recibido en el sistema' },
      { status: 'confirmed', timestamp: new Date(Date.now() - 12 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Confirmado por cocina' },
      { status: 'preparing', timestamp: new Date(Date.now() - 8 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Elaborándose en horno de leña' },
    ]
  }
];

export const INITIAL_RESERVATIONS: TableReservation[] = [
  {
    id: 'res-7391',
    reservationCode: 'RES-7391',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    guestName: 'Laura Fernández',
    guestEmail: 'laura.f@example.com',
    guestPhone: '+34 611 445 566',
    guestsCount: 4,
    date: new Date().toISOString().split('T')[0],
    time: '21:00',
    seatingArea: 'patio',
    occasion: 'Cena de Aniversario',
    specialRequests: 'Mesa tranquila cerca de las plantas si es posible',
    status: 'confirmed',
    tableAssigned: 'Mesa Terraza T-04'
  },
  {
    id: 'res-7392',
    reservationCode: 'RES-7392',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    guestName: 'Rodrigo Santoro',
    guestEmail: 'rodrigo.s@example.com',
    guestPhone: '+34 688 223 344',
    guestsCount: 2,
    date: new Date().toISOString().split('T')[0],
    time: '21:30',
    seatingArea: 'indoor',
    occasion: 'Cita Romántica',
    status: 'confirmed',
    tableAssigned: 'Mesa Salón S-08'
  }
];

export const DEFAULT_CONFIG: RestaurantConfig = {
  name: "MILENIA",
  tagline: "Alta Cocina, Pedidos & Reservas de Autor",
  currency: 'EUR',
  currencySymbol: '€',
  taxRate: 0.10, // 10% IVA
  serviceFeeRate: 0.03, // 3%
  freeDeliveryThreshold: 35.00,
  acceptingOrders: true,
  acceptingReservations: true,
};

export const INITIAL_REWARDS_PROFILE = {
  userName: 'Alejandro Morales',
  membershipNumber: 'MIL-8829-VIP',
  currentPoints: 850,
  lifetimePoints: 1350,
  tier: 'Gold' as const,
  nextTier: 'Platinum' as const,
  pointsToNextTier: 650,
  tierProgressPercentage: 56,
  benefits: [
    {
      id: 'ben-champagne',
      title: 'Copa de Champagne Francés de Bienvenida',
      titleEn: 'Complimentary Glass of French Champagne',
      description: 'Disfruta de una copa de cortesía en cualquiera de nuestras sucursales al reservar mesa.',
      descriptionEn: 'Enjoy a complimentary glass at any of our branches upon reservation.',
      tierRequired: 'Silver' as const,
      pointsRequired: 300,
      icon: 'Wine',
      unlocked: true,
      code: 'CHAMPAGNE-GOLD'
    },
    {
      id: 'ben-tasting',
      title: 'Degustación de Quesos de Autor',
      titleEn: 'Signature Artisan Cheese Board Tasting',
      description: 'Tabla de quesos artesanos de pequeños productores con maridaje de mermeladas de higo.',
      descriptionEn: 'Artisan cheese board pairing with fresh fig jam.',
      tierRequired: 'Gold' as const,
      pointsRequired: 800,
      icon: 'Sparkles',
      unlocked: true,
      code: 'CHEESE-PAIRING'
    },
    {
      id: 'ben-discount-15',
      title: '15% Descuento en Reserva de Aniversario',
      titleEn: '15% Off on Anniversary Dining',
      description: 'Descuento especial aplicable a tu cuenta total para celebraciones especiales.',
      descriptionEn: 'Special discount on your total bill for special celebrations.',
      tierRequired: 'Platinum' as const,
      pointsRequired: 1500,
      icon: 'Award',
      unlocked: false,
      discountAmount: 15
    },
    {
      id: 'ben-cava-priority',
      title: 'Mesa Preferente en Cava Privada & Valet Parking',
      titleEn: 'VIP Private Wine Cava Seating & Valet Parking',
      description: 'Acceso exclusivo a nuestra Cava Privada con sommelier dedicado sin consumo mínimo previo.',
      descriptionEn: 'Exclusive access to our Private Wine Cava with dedicated sommelier.',
      tierRequired: 'Black Diamond' as const,
      pointsRequired: 3000,
      icon: 'Crown',
      unlocked: false
    }
  ],
  recentActivity: [
    {
      id: 'act-1',
      title: 'Pedido Solomillo Wagyu A5 & Maridaje',
      titleEn: 'Order Wagyu A5 & Wine Pairing',
      date: 'Hoy, 14:30',
      points: 120,
      type: 'earned' as const
    },
    {
      id: 'act-2',
      title: 'Reserva confirmada en Terraza Central',
      titleEn: 'Reservation confirmed at Central Terrace',
      date: 'Ayer',
      points: 80,
      type: 'earned' as const
    },
    {
      id: 'act-3',
      title: 'Opinión verificada 5 estrellas',
      titleEn: 'Verified 5-star Review',
      date: 'Hace 3 días',
      points: 50,
      type: 'earned' as const
    },
    {
      id: 'act-4',
      title: 'Canje de Cupón Degustación',
      titleEn: 'Redeemed Tasting Coupon',
      date: 'Hace 1 semana',
      points: -250,
      type: 'redeemed' as const
    }
  ]
};
