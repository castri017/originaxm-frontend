export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center mb-14">
        <img src="/logo.png" alt="OriginAXM" className="h-24 w-auto object-contain mx-auto mb-8" />
        <h1 className="text-4xl font-extrabold tracking-tight text-black uppercase">
          Sobre Nosotros
        </h1>
        <div className="mt-4 h-1 w-16 bg-black mx-auto rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-8 text-gray-700 text-lg leading-relaxed">
        <p>
          Somos una marca creada por una pareja emprendedora en{' '}
          <span className="font-semibold text-black">Armenia, Quindío</span>. Nacimos al ver la
          necesidad de un lugar confiable donde encontrar productos{' '}
          <span className="font-semibold text-black">100% originales</span>, en un mercado saturado
          de imitaciones.
        </p>

        <p>
          Más que vender productos, buscamos brindarte{' '}
          <span className="font-semibold text-black">confianza, calidad y estilo</span> en cada
          compra. Seleccionamos cuidadosamente cada producto para asegurarnos de que recibas lo
          mejor.
        </p>

        <p>
          Creemos en lo <span className="font-semibold text-black">auténtico</span>, en lo{' '}
          <span className="font-semibold text-black">duradero</span> y en las marcas que acompañan
          tu día a día.
        </p>

        {/* Highlight quote */}
        <div className="border-l-4 border-black pl-6 py-2 my-10">
          <p className="text-2xl font-extrabold text-black leading-snug">
            OriginAXM no es solo una tienda,<br />
            es una forma de vivir lo original.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-14 text-center">
        <a
          href="/catalog"
          className="inline-block bg-black text-white text-sm font-extrabold uppercase tracking-widest px-10 py-4 rounded-full hover:bg-gray-800 transition-colors"
        >
          Ver el Catálogo
        </a>
      </div>
    </div>
  );
}
