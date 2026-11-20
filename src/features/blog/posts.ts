/** Contenido del blog. Cada entrada es una lista de bloques que `BlogPost` sabe pintar. */
export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'img'; src: string; alt: string; caption?: string }
  | { type: 'callout'; title: string; text: string }
  | { type: 'cta'; label: string; to?: string; href?: string; external?: boolean };

export interface BlogPost {
  slug: string;
  title: string;
  /** Resumen de la tarjeta y descripción SEO (máx. ~160 caracteres). */
  excerpt: string;
  /** Fecha de publicación (ISO). */
  date: string;
  readMinutes: number;
  cover?: { src: string; alt: string };
  blocks: BlogBlock[];
}

const GUIA_PDF = '/guias/stanley-original.pdf';

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'como-saber-si-tu-stanley-es-original',
    title: '5 claves para reconocer un Stanley 100% original',
    excerpt:
      'Aprende a detectar una réplica en menos de 5 minutos: base grabada, logo, soldadura interior, tapa spinner y tornillos del asa.',
    date: '2026-11-16',
    readMinutes: 4,
    cover: { src: '/blog/portada-5-claves.webp', alt: 'Guía de OriginAXM: ¿Tu termo Stanley es original?' },
    blocks: [
      {
        type: 'p',
        text: 'Al buscar tu termo ideal, el mayor miedo no es invertir, sino equivocarte. El mercado está lleno de imitaciones que prometen la misma calidad, pero fallan en lo más importante: la durabilidad, el aislamiento térmico y la seguridad de los materiales.',
      },
      {
        type: 'p',
        text: 'Por eso preparamos esta guía rápida. Con estas cinco revisiones puedes identificar un producto genuino con seguridad, sin importar dónde lo hayas comprado.',
      },
      { type: 'h2', text: '1. El grabado de la base (nunca es impreso)' },
      {
        type: 'img',
        src: '/blog/clave-1-grabado-base.webp',
        alt: 'Base de un termo Stanley original frente a la de una réplica',
        caption: 'Izquierda, original. Derecha, réplica.',
      },
      {
        type: 'p',
        text: 'Voltea el termo. En un Stanley original, la información de la base (capacidad, advertencias y el sello "BPA free") está grabada directamente en el acero. En las réplicas suele ser texto impreso con láser superficial o pintura que se desgasta rápido.',
      },
      { type: 'h2', text: '2. La alineación y textura del logo' },
      {
        type: 'img',
        src: '/blog/clave-2-logo.webp',
        alt: 'Logo del oso Stanley original frente al de una réplica',
        caption: 'Izquierda, original. Derecha, réplica.',
      },
      {
        type: 'p',
        text: 'El oso característico de Stanley tiene detalles muy finos en sus alas y corona. En un producto original los bordes son nítidos y el logo tiene una ligera textura al tacto. Las versiones imitadas suelen tener el logo borroso, un oso más grueso de lo normal y carecen del símbolo de marca registrada (®) o está mal posicionado.',
      },
      { type: 'h2', text: '3. El interior y la línea de soldadura' },
      {
        type: 'img',
        src: '/blog/clave-3-interior-soldadura.webp',
        alt: 'Interior de un termo Stanley original frente al de una réplica',
        caption: 'Izquierda, original. Derecha, réplica.',
      },
      {
        type: 'p',
        text: 'Un verdadero termo de acero inoxidable 18/8 tiene un acabado interno pulido. Si miras hacia el fondo, verás una línea de soldadura recta y limpia. Las imitaciones suelen tener soldaduras irregulares, manchas oscuras o un interior excesivamente brillante que delata el uso de metales de baja calidad.',
      },
      { type: 'h2', text: '4. Los detalles de la tapa (el spinner)' },
      {
        type: 'img',
        src: '/blog/clave-4-tapa-spinner.webp',
        alt: 'Tapa de un termo Stanley original frente a la de una réplica',
        caption: 'Izquierda, original. Derecha, réplica.',
      },
      {
        type: 'p',
        text: 'La tapa original de la línea Quencher tiene un mecanismo giratorio (spinner) que ajusta con firmeza. El plástico de la tapa original es grueso, opaco y resistente. Las réplicas usan plásticos translúcidos y delgados, y el mecanismo giratorio suele ser suelto o encajarse con dificultad.',
      },
      { type: 'h2', text: '5. El ensamblaje del asa (los tornillos)' },
      {
        type: 'img',
        src: '/blog/clave-5-asa-tornillos.webp',
        alt: 'Asa y tornillos de un termo Stanley original frente a una réplica',
        caption: 'Izquierda, original. Derecha, réplica.',
      },
      {
        type: 'p',
        text: 'Revisa el interior del asa. Los Stanley originales utilizan tornillos hexagonales (tipo Allen) robustos y encajados a ras del plástico para asegurar el agarre. Las imitaciones frecuentemente usan tornillos de estría común (Phillips) o están mal ensambladas, dejando bordes filosos o huecos.',
      },
      {
        type: 'callout',
        title: '¿Quieres ir a la fija?',
        text: 'Si prefieres saltarte la revisión y tener la garantía desde el primer segundo, en OriginAXM seleccionamos e importamos cada pieza asegurando su tecnología de acero inoxidable 18/8 y su total autenticidad.',
      },
      { type: 'cta', label: 'Descargar la guía en PDF', href: GUIA_PDF, external: true },
      { type: 'cta', label: 'Ver el catálogo', to: '/catalog' },
    ],
  },
  {
    slug: 'como-elegir-tu-stanley-tamano-tapa-y-uso',
    title: 'Cómo elegir tu Stanley: tamaño, tapa y para qué lo vas a usar',
    excerpt:
      'Vaso con pajilla, botella, shaker, vaso de vino o taza de camping: compara capacidades y horas de frío y calor para escoger el tuyo.',
    date: '2026-11-16',
    readMinutes: 5,
    cover: {
      src: 'https://pub-0473a1c6a1504725828832267c5a52d3.r2.dev/products/3c8e2bfa-1be8-4996-afa6-261184e8281a.webp',
      alt: 'Botella Stanley Vitalize Tempo de 24 oz',
    },
    blocks: [
      {
        type: 'p',
        text: 'Elegir un Stanley no se trata solo del color. El tamaño, el tipo de tapa y el rendimiento térmico cambian por completo cómo lo vas a usar en el día a día. Esta guía compara los modelos que manejamos en OriginAXM para que escojas con criterio.',
      },
      {
        type: 'callout',
        title: 'Sobre las cifras',
        text: 'Las capacidades y horas de frío o calor que aparecen aquí salen de la ficha de cada producto en nuestro catálogo. Pueden variar según el modelo y las condiciones de uso; en cada producto mostramos sus datos exactos.',
      },
      { type: 'h2', text: 'Vaso con pajilla de 30 oz (887 ml): para todo el día' },
      {
        type: 'p',
        text: 'Modelos como el IceFlow 2.0 y el Quencher ProTour Flipstraw tienen pajilla abatible, asa y tapa resistente a fugas. Son ideales si tomas agua o bebidas frías durante la jornada de trabajo o estudio y quieres un vaso que quepa en el portavasos del carro.',
      },
      { type: 'h2', text: 'Botella de 24 oz (710 ml): para moverte' },
      {
        type: 'p',
        text: 'La Vitalize Tempo combina una tapa con seguro a prueba de fugas, boquilla cubierta, asa de acero y una funda de silicona extraíble que protege la base de golpes. Según su ficha mantiene la bebida fría hasta por 12 horas o helada hasta por 30. Es buena opción para el gimnasio, la oficina o el bolso.',
      },
      { type: 'h2', text: 'Botella agitadora de 20 oz (591 ml): para batidos y proteína' },
      {
        type: 'p',
        text: 'La Vitalize agitadora tiene boquilla de flujo rápido, colador extraíble y un compartimento en la base de 3 oz para llevar suplementos. Su ficha indica hasta 8 horas de frío o 30 con hielo. Si preparas batidos o mezclas en polvo, es la más práctica.',
      },
      { type: 'h2', text: 'Vaso de vino de 11 oz (325 ml): para casa y viajes cortos' },
      {
        type: 'p',
        text: 'El vaso Reserve tiene tapa deslizante, base de silicona antideslizante y diseño apilable. Sirve igual para un vino frío al final del día que para un café caliente en la mañana, sin salpicar.',
      },
      { type: 'h2', text: 'Taza Everyday Camp de 12 oz (355 ml): para café y té' },
      {
        type: 'p',
        text: 'Una taza de acero inoxidable 18/8 con boca ancha y tapa para beber. Según su ficha mantiene el calor hasta 1,5 horas, el frío hasta 3 horas y el hielo hasta 15. Es perfecta para el escritorio o para un fin de semana al aire libre.',
      },
      { type: 'h2', text: 'Cómo decidir en tres preguntas' },
      {
        type: 'ol',
        items: [
          '¿Qué vas a tomar? Frío o con hielo, pide más capacidad y pajilla; caliente, una taza o botella con tapa cerrada.',
          '¿Dónde lo vas a llevar? Para el carro, un vaso con asa; para el bolso, una botella con tapa con seguro.',
          '¿Cuántas horas necesitas? Revisa las horas en frío, calor y con hielo que mostramos en la ficha de cada producto.',
        ],
      },
      {
        type: 'p',
        text: 'Y antes de comprar en cualquier lugar, recuerda revisar que sea original: aquí te explicamos cómo hacerlo.',
      },
      { type: 'cta', label: 'Ver el catálogo', to: '/catalog' },
      { type: 'cta', label: 'Cómo reconocer un Stanley original', to: '/blog/como-saber-si-tu-stanley-es-original' },
    ],
  },
  {
    slug: 'como-funciona-tu-pedido-en-originaxm',
    title: 'Cómo funciona tu pedido en OriginAXM, de la compra a tu puerta',
    excerpt:
      'Paso a paso: cómo comprar, qué medios de pago usamos, cuánto tardan los pedidos internacionales y cómo hacerles seguimiento.',
    date: '2026-11-16',
    readMinutes: 4,
    blocks: [
      {
        type: 'p',
        text: 'En OriginAXM traemos productos Stanley originales y los enviamos a todo Colombia. Si es tu primera compra, aquí te contamos cómo funciona el proceso completo para que sepas qué esperar en cada paso.',
      },
      { type: 'h2', text: 'Paso a paso' },
      {
        type: 'ol',
        items: [
          'Elige tu producto. En cada ficha verás capacidad, color, horas térmicas y si es de pedido internacional. El stock es limitado: cuando quedan pocas unidades te lo avisamos en la ficha.',
          'Agrégalo al carrito y ve al checkout. Ingresas tus datos de contacto y la dirección de entrega.',
          'Paga con el medio que prefieras. Los pagos en línea se procesan en plataformas autorizadas, así que no guardamos los datos completos de tu tarjeta.',
          'Preparamos e importamos tu pedido. Los productos de pedido internacional llegan en 10 a 15 días hábiles y les hacemos seguimiento.',
          'Recibe en tu casa. Enviamos a todo Colombia, y el envío es gratis en compras superiores a $300.000 o dentro de Armenia, Quindío.',
        ],
      },
      { type: 'h2', text: '¿Por qué algunos pedidos tardan más?' },
      {
        type: 'p',
        text: 'Porque traemos cada pieza directamente desde el exterior para asegurar que sea original. Esa importación toma unos días, pero a cambio recibes un producto auténtico, con la tecnología de acero inoxidable 18/8 que esperas.',
      },
      { type: 'h2', text: 'Cuando llegue tu pedido' },
      {
        type: 'ul',
        items: [
          'Revisa que el producto y su empaque estén en buen estado.',
          'Si algo llegó con un defecto de fábrica, escríbenos por WhatsApp con fotos y tu número de pedido.',
          'Conoce las condiciones de cambios y devoluciones en nuestra página de Envíos y devoluciones, y el procedimiento en Garantía.',
          'Cuéntanos qué tal fue: quienes reciben su pedido pueden dejar una reseña con estrellas y comentario.',
        ],
      },
      { type: 'h2', text: 'Preguntas rápidas' },
      {
        type: 'ul',
        items: [
          '¿Los productos son originales? Sí, todos. Aquí explicamos cómo comprobarlo tú misma o tú mismo.',
          '¿Puedo pedir asesoría antes de comprar? Claro, escríbenos por WhatsApp y te ayudamos a elegir.',
        ],
      },
      { type: 'cta', label: 'Envíos y devoluciones', to: '/shipping' },
      { type: 'cta', label: 'Ver el catálogo', to: '/catalog' },
    ],
  },
];

export const getPost = (slug: string | undefined) => BLOG_POSTS.find(p => p.slug === slug);

export const formatPostDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
