export interface ColombiaCity {
  ciudad: string;
  departamento: string;
}

export const DEPARTAMENTOS_COLOMBIA: string[] = [
  'Antioquia',
  'Atlántico',
  'Bogotá D.C.',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Cauca',
  'Cesar',
  'Córdoba',
  'Cundinamarca',
  'Chocó',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Quindío',
  'Risaralda',
  'Santander',
  'Sucre',
  'Tolima',
  'Valle del Cauca',
  'Arauca',
  'Casanare',
  'Putumayo',
  'San Andrés y Providencia',
  'Amazonas',
  'Guainía',
  'Guaviare',
  'Vaupés',
  'Vichada'
].sort((a, b) => a.localeCompare('es'));

export const CIUDADES_COLOMBIA: ColombiaCity[] = [
  // Bogotá D.C.
  { ciudad: 'Bogotá D.C.', departamento: 'Bogotá D.C.' },

  // Antioquia
  { ciudad: 'Medellín', departamento: 'Antioquia' },
  { ciudad: 'Envigado', departamento: 'Antioquia' },
  { ciudad: 'Itagüí', departamento: 'Antioquia' },
  { ciudad: 'Sabaneta', departamento: 'Antioquia' },
  { ciudad: 'Bello', departamento: 'Antioquia' },
  { ciudad: 'Rionegro', departamento: 'Antioquia' },
  { ciudad: 'Apartadó', departamento: 'Antioquia' },
  { ciudad: 'Caucasia', departamento: 'Antioquia' },
  { ciudad: 'La Ceja', departamento: 'Antioquia' },
  { ciudad: 'Marinilla', departamento: 'Antioquia' },
  { ciudad: 'Guarne', departamento: 'Antioquia' },
  { ciudad: 'Caldas', departamento: 'Antioquia' },
  { ciudad: 'Copacabana', departamento: 'Antioquia' },
  { ciudad: 'Girardota', departamento: 'Antioquia' },
  { ciudad: 'Santa Fe de Antioquia', departamento: 'Antioquia' },

  // Valle del Cauca
  { ciudad: 'Cali', departamento: 'Valle del Cauca' },
  { ciudad: 'Palmira', departamento: 'Valle del Cauca' },
  { ciudad: 'Buenaventura', departamento: 'Valle del Cauca' },
  { ciudad: 'Tuluá', departamento: 'Valle del Cauca' },
  { ciudad: 'Buga (Guadalajara de Buga)', departamento: 'Valle del Cauca' },
  { ciudad: 'Cartago', departamento: 'Valle del Cauca' },
  { ciudad: 'Jamundí', departamento: 'Valle del Cauca' },
  { ciudad: 'Yumbo', departamento: 'Valle del Cauca' },
  { ciudad: 'Candelaria', departamento: 'Valle del Cauca' },
  { ciudad: 'Roldanillo', departamento: 'Valle del Cauca' },
  { ciudad: 'Sevilla', departamento: 'Valle del Cauca' },

  // Atlántico
  { ciudad: 'Barranquilla', departamento: 'Atlántico' },
  { ciudad: 'Soledad', departamento: 'Atlántico' },
  { ciudad: 'Malambo', departamento: 'Atlántico' },
  { ciudad: 'Sabanalarga', departamento: 'Atlántico' },
  { ciudad: 'Puerto Colombia', departamento: 'Atlántico' },
  { ciudad: 'Baranoa', departamento: 'Atlántico' },
  { ciudad: 'Galapa', departamento: 'Atlántico' },

  // Santander
  { ciudad: 'Bucaramanga', departamento: 'Santander' },
  { ciudad: 'Floridablanca', departamento: 'Santander' },
  { ciudad: 'Girón', departamento: 'Santander' },
  { ciudad: 'Piedecuesta', departamento: 'Santander' },
  { ciudad: 'Barrancabermeja', departamento: 'Santander' },
  { ciudad: 'San Gil', departamento: 'Santander' },
  { ciudad: 'Socorro', departamento: 'Santander' },
  { ciudad: 'Barichara', departamento: 'Santander' },
  { ciudad: 'Málaga', departamento: 'Santander' },

  // Bolívar
  { ciudad: 'Cartagena de Indias', departamento: 'Bolívar' },
  { ciudad: 'Magangué', departamento: 'Bolívar' },
  { ciudad: 'Turbaco', departamento: 'Bolívar' },
  { ciudad: 'Arjona', departamento: 'Bolívar' },
  { ciudad: 'El Carmen de Bolívar', departamento: 'Bolívar' },
  { ciudad: 'Mompox', departamento: 'Bolívar' },

  // Cundinamarca
  { ciudad: 'Chía', departamento: 'Cundinamarca' },
  { ciudad: 'Zipaquirá', departamento: 'Cundinamarca' },
  { ciudad: 'Soacha', departamento: 'Cundinamarca' },
  { ciudad: 'Facatativá', departamento: 'Cundinamarca' },
  { ciudad: 'Fusagasugá', departamento: 'Cundinamarca' },
  { ciudad: 'Madrid', departamento: 'Cundinamarca' },
  { ciudad: 'Funza', departamento: 'Cundinamarca' },
  { ciudad: 'Mosquera', departamento: 'Cundinamarca' },
  { ciudad: 'Cajicá', departamento: 'Cundinamarca' },
  { ciudad: 'Girardot', departamento: 'Cundinamarca' },
  { ciudad: 'Cota', departamento: 'Cundinamarca' },
  { ciudad: 'Sopó', departamento: 'Cundinamarca' },
  { ciudad: 'Tabio', departamento: 'Cundinamarca' },
  { ciudad: 'Tenjo', departamento: 'Cundinamarca' },
  { ciudad: 'La Calera', departamento: 'Cundinamarca' },
  { ciudad: 'Ubaté', departamento: 'Cundinamarca' },
  { ciudad: 'Villeta', departamento: 'Cundinamarca' },

  // Risaralda
  { ciudad: 'Pereira', departamento: 'Risaralda' },
  { ciudad: 'Dosquebradas', departamento: 'Risaralda' },
  { ciudad: 'Santa Rosa de Cabal', departamento: 'Risaralda' },
  { ciudad: 'La Virginia', departamento: 'Risaralda' },

  // Caldas
  { ciudad: 'Manizales', departamento: 'Caldas' },
  { ciudad: 'La Dorada', departamento: 'Caldas' },
  { ciudad: 'Chinchiná', departamento: 'Caldas' },
  { ciudad: 'Villamaría', departamento: 'Caldas' },
  { ciudad: 'Anserma', departamento: 'Caldas' },
  { ciudad: 'Riosucio', departamento: 'Caldas' },

  // Quindío
  { ciudad: 'Armenia', departamento: 'Quindío' },
  { ciudad: 'Calarcá', departamento: 'Quindío' },
  { ciudad: 'Montenegro', departamento: 'Quindío' },
  { ciudad: 'Quimbaya', departamento: 'Quindío' },
  { ciudad: 'La Tebaida', departamento: 'Quindío' },
  { ciudad: 'Circasia', departamento: 'Quindío' },
  { ciudad: 'Salento', departamento: 'Quindío' },

  // Tolima
  { ciudad: 'Ibagué', departamento: 'Tolima' },
  { ciudad: 'Espinal', departamento: 'Tolima' },
  { ciudad: 'Melgar', departamento: 'Tolima' },
  { ciudad: 'Honda', departamento: 'Tolima' },
  { ciudad: 'Mariquita', departamento: 'Tolima' },
  { ciudad: 'Chaparral', departamento: 'Tolima' },
  { ciudad: 'Líbano', departamento: 'Tolima' },

  // Magdalena
  { ciudad: 'Santa Marta', departamento: 'Magdalena' },
  { ciudad: 'Ciénaga', departamento: 'Magdalena' },
  { ciudad: 'Fundación', departamento: 'Magdalena' },
  { ciudad: 'El Banco', departamento: 'Magdalena' },
  { ciudad: 'Plato', departamento: 'Magdalena' },

  // Norte de Santander
  { ciudad: 'Cúcuta', departamento: 'Norte de Santander' },
  { ciudad: 'Ocaña', departamento: 'Norte de Santander' },
  { ciudad: 'Pamplona', departamento: 'Norte de Santander' },
  { ciudad: 'Villa del Rosario', departamento: 'Norte de Santander' },
  { ciudad: 'Los Patios', departamento: 'Norte de Santander' },
  { ciudad: 'Tibú', departamento: 'Norte de Santander' },

  // Meta
  { ciudad: 'Villavicencio', departamento: 'Meta' },
  { ciudad: 'Acacías', departamento: 'Meta' },
  { ciudad: 'Granada', departamento: 'Meta' },
  { ciudad: 'Puerto López', departamento: 'Meta' },
  { ciudad: 'Cumaral', departamento: 'Meta' },

  // Nariño
  { ciudad: 'Pasto', departamento: 'Nariño' },
  { ciudad: 'Ipiales', departamento: 'Nariño' },
  { ciudad: 'Tumaco', departamento: 'Nariño' },
  { ciudad: 'Túquerres', departamento: 'Nariño' },
  { ciudad: 'La Unión', departamento: 'Nariño' },

  // Córdoba
  { ciudad: 'Montería', departamento: 'Córdoba' },
  { ciudad: 'Cereté', departamento: 'Córdoba' },
  { ciudad: 'Sahagún', departamento: 'Córdoba' },
  { ciudad: 'Lorica', departamento: 'Córdoba' },
  { ciudad: 'Montelíbano', departamento: 'Córdoba' },
  { ciudad: 'Planeta Rica', departamento: 'Córdoba' },

  // Cesar
  { ciudad: 'Valledupar', departamento: 'Cesar' },
  { ciudad: 'Aguachica', departamento: 'Cesar' },
  { ciudad: 'Agustín Codazzi', departamento: 'Cesar' },
  { ciudad: 'Bosconia', departamento: 'Cesar' },
  { ciudad: 'Curumaní', departamento: 'Cesar' },

  // Huila
  { ciudad: 'Neiva', departamento: 'Huila' },
  { ciudad: 'Pitalito', departamento: 'Huila' },
  { ciudad: 'Garzón', departamento: 'Huila' },
  { ciudad: 'La Plata', departamento: 'Huila' },
  { ciudad: 'Campoalegre', departamento: 'Huila' },

  // Cauca
  { ciudad: 'Popayán', departamento: 'Cauca' },
  { ciudad: 'Santander de Quilichao', departamento: 'Cauca' },
  { ciudad: 'Puerto Tejada', departamento: 'Cauca' },
  { ciudad: 'Patía (El Bordo)', departamento: 'Cauca' },

  // Sucre
  { ciudad: 'Sincelejo', departamento: 'Sucre' },
  { ciudad: 'Corozal', departamento: 'Sucre' },
  { ciudad: 'San Marcos', departamento: 'Sucre' },
  { ciudad: 'Sampués', departamento: 'Sucre' },
  { ciudad: 'Tolú', departamento: 'Sucre' },

  // Boyacá
  { ciudad: 'Tunja', departamento: 'Boyacá' },
  { ciudad: 'Duitama', departamento: 'Boyacá' },
  { ciudad: 'Sogamoso', departamento: 'Boyacá' },
  { ciudad: 'Chiquinquirá', departamento: 'Boyacá' },
  { ciudad: 'Paipa', departamento: 'Boyacá' },
  { ciudad: 'Villa de Leyva', departamento: 'Boyacá' },
  { ciudad: 'Puerto Boyacá', departamento: 'Boyacá' },
  { ciudad: 'Moniquirá', departamento: 'Boyacá' },

  // La Guajira
  { ciudad: 'Riohacha', departamento: 'La Guajira' },
  { ciudad: 'Maicao', departamento: 'La Guajira' },
  { ciudad: 'Uribia', departamento: 'La Guajira' },
  { ciudad: 'San Juan del Cesar', departamento: 'La Guajira' },
  { ciudad: 'Fonseca', departamento: 'La Guajira' },

  // Casanare
  { ciudad: 'Yopal', departamento: 'Casanare' },
  { ciudad: 'Aguazul', departamento: 'Casanare' },
  { ciudad: 'Villanueva', departamento: 'Casanare' },
  { ciudad: 'Tauramena', departamento: 'Casanare' },

  // Caquetá
  { ciudad: 'Florencia', departamento: 'Caquetá' },
  { ciudad: 'San Vicente del Caguán', departamento: 'Caquetá' },

  // Chocó
  { ciudad: 'Quibdó', departamento: 'Chocó' },
  { ciudad: 'Istmina', departamento: 'Chocó' },

  // Putumayo
  { ciudad: 'Mocoa', departamento: 'Putumayo' },
  { ciudad: 'Puerto Asís', departamento: 'Putumayo' },
  { ciudad: 'Orito', departamento: 'Putumayo' },

  // Arauca
  { ciudad: 'Arauca', departamento: 'Arauca' },
  { ciudad: 'Tame', departamento: 'Arauca' },
  { ciudad: 'Saravena', departamento: 'Arauca' },

  // San Andrés y Providencia
  { ciudad: 'San Andrés', departamento: 'San Andrés y Providencia' },
  { ciudad: 'Providencia', departamento: 'San Andrés y Providencia' },

  // Guaviare
  { ciudad: 'San José del Guaviare', departamento: 'Guaviare' },

  // Amazonas
  { ciudad: 'Leticia', departamento: 'Amazonas' },
  { ciudad: 'Puerto Nariño', departamento: 'Amazonas' },

  // Guainía
  { ciudad: 'Inírida', departamento: 'Guainía' },

  // Vaupés
  { ciudad: 'Mitú', departamento: 'Vaupés' },

  // Vichada
  { ciudad: 'Puerto Carreño', departamento: 'Vichada' }
];

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function searchCitiesAndDepartments(query: string): ColombiaCity[] {
  if (!query || query.trim().length === 0) {
    return CIUDADES_COLOMBIA.slice(0, 15);
  }
  const clean = normalizeText(query);
  return CIUDADES_COLOMBIA.filter(item => {
    const matchCity = normalizeText(item.ciudad).includes(clean);
    const matchDept = normalizeText(item.departamento).includes(clean);
    return matchCity || matchDept;
  });
}

export function getCitiesByDepartment(department: string): ColombiaCity[] {
  if (!department) return CIUDADES_COLOMBIA;
  return CIUDADES_COLOMBIA.filter(item => item.departamento === department);
}
