export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  featured?: boolean;
}

export const CATEGORIES = [
  { id: 'termos-clasicos', name: 'Clásicos', image: 'https://images.unsplash.com/photo-1606821430987-a25e640ad0f6?auto=format&fit=crop&q=80&w=800' },
  { id: 'termos-aventura', name: 'Aventura', image: 'https://images.unsplash.com/photo-1542279185-1d4ba2d2dc0f?auto=format&fit=crop&q=80&w=800' },
  { id: 'vasos-termicos', name: 'Vasos Térmicos', image: 'https://images.unsplash.com/photo-1544974950-896c21e64627?auto=format&fit=crop&q=80&w=800' },
  { id: 'repuestos', name: 'Accesorios', image: 'https://images.unsplash.com/photo-1622352824707-88f5a2e9aeec?auto=format&fit=crop&q=80&w=800' }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 's-1',
    name: 'Termo Stanley Classic 1.4L',
    description: 'El legendario termo Stanley Clásico. Mantiene el calor y el frío durante 40 horas. Acero inoxidable 18/8, a prueba de fugas.',
    price: 64900,
    category: 'termos-clasicos',
    image: 'https://images.unsplash.com/photo-1616790933924-f72be04ff359?auto=format&fit=crop&q=80&w=800',
    stock: 25,
    featured: true
  },
  {
    id: 's-2',
    name: 'Termo Stanley Adventure 1L',
    description: 'Diseño robusto y compacto para la aventura. Mantiene bebidas calientes o frías hasta por 24 horas. Color Verde Hammertone.',
    price: 52900,
    category: 'termos-aventura',
    image: 'https://images.unsplash.com/photo-1600325055057-e95ff1bafbd7?auto=format&fit=crop&q=80&w=800',
    stock: 15,
    featured: true
  },
  {
    id: 's-3',
    name: 'Vaso Quencher H2.0 1.18L',
    description: 'El vaso viral. Gran capacidad, mango ergonómico y base estrecha para portavasos de auto. Mantiene el hielo por 48hrs.',
    price: 48900,
    category: 'vasos-termicos',
    image: 'https://images.unsplash.com/photo-1681284562506-cbeff269ebf4?auto=format&fit=crop&q=80&w=800',
    stock: 40,
    featured: true
  },
  {
    id: 's-4',
    name: 'Termo Stanley Classic 1L - Matte Black',
    description: 'El termo clásico en una elegante edición color negro mate. Mantiene la temperatura hasta por 24 horas. Indispensable.',
    price: 59900,
    category: 'termos-clasicos',
    image: 'https://images.unsplash.com/photo-1574704771420-53bc32ffbfac?auto=format&fit=crop&q=80&w=800',
    stock: 10,
    featured: true
  },
  {
    id: 's-5',
    name: 'Mate Stanley Clásico 236ml',
    description: 'El compañero perfecto para tu termo. Mantiene la temperatura del agua por mucho más tiempo. No se transfiere el calor.',
    price: 35900,
    category: 'vasos-termicos',
    image: 'https://images.unsplash.com/photo-1594918737295-8ecef586b627?auto=format&fit=crop&q=80&w=800',
    stock: 30
  },
  {
    id: 's-6',
    name: 'Tapón Cebador Stanley Original',
    description: 'Tapón de repuesto original para termos clásicos. Permite cebar fácilmente con flujo controlado.',
    price: 12900,
    category: 'repuestos',
    image: 'https://images.unsplash.com/photo-1622352824707-88f5a2e9aeec?auto=format&fit=crop&q=80&w=800',
    stock: 50
  },
  {
    id: 's-7',
    name: 'Termo Stanley Trigger-Action 0.47L',
    description: 'Botella de viaje con botón disparador. Permite beber con una mano. Mantiene el calor por 7 horas.',
    price: 39900,
    category: 'vasos-termicos',
    image: 'https://images.unsplash.com/photo-1594918737295-8ecef586b627?auto=format&fit=crop&q=80&w=800',
    stock: 20,
    featured: true
  },
  {
    id: 's-8',
    name: 'Prensa Francesa Stanley Adventure',
    description: 'Prepara café en cualquier lugar. Acero inoxidable de doble pared. 1.48L de capacidad.',
    price: 69900,
    category: 'repuestos',
    image: 'https://images.unsplash.com/photo-1606821430987-a25e640ad0f6?auto=format&fit=crop&q=80&w=800',
    stock: 12,
    featured: true
  },
  {
    id: 's-9',
    name: 'Vaso Stanley Beer Stein 0.7L',
    description: 'El Chopp definitivo. Mantiene la cerveza fría por 5 horas. Mango robusto y gran capacidad.',
    price: 29900,
    category: 'vasos-termicos',
    image: 'https://images.unsplash.com/photo-1681284562506-cbeff269ebf4?auto=format&fit=crop&q=80&w=800',
    stock: 25,
    featured: true
  },
  {
    id: 's-10',
    name: 'Lonchera Stanley Clásica 9.4L',
    description: 'Diseño retro e indestructible. Espacio para tu termo y comida. Metal de alta resistencia.',
    price: 89900,
    category: 'repuestos',
    image: 'https://images.unsplash.com/photo-1542279185-1d4ba2d2dc0f?auto=format&fit=crop&q=80&w=800',
    stock: 8,
    featured: true
  }
];

export const getFeaturedProducts = () => MOCK_PRODUCTS.filter(p => p.featured);
export const getProductById = (id: string) => MOCK_PRODUCTS.find(p => p.id === id);
export const getProductsByCategory = (category: string) => MOCK_PRODUCTS.filter(p => p.category === category);
