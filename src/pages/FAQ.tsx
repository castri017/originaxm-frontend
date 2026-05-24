import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '¿Los productos son originales?',
    a: 'Sí, todos nuestros productos son 100% originales. Garantizamos autenticidad en cada compra.',
  },
  {
    q: '¿Cómo sé que no es una réplica?',
    a: 'Compartimos contenido y detalles del producto para que puedas verificar su autenticidad. Además, puedes contactarnos si tienes dudas antes de comprar.',
  },
  {
    q: '¿Cómo puedo hacer un pedido?',
    a: 'Puedes comprar directamente a través de nuestra página web, nuestras redes sociales o contactarnos por WhatsApp para una atención más personalizada.',
  },
  {
    q: '¿Qué métodos de pago manejan?',
    a: 'Aceptamos transferencias, pagos electrónicos y Sistecrédito.',
  },
  {
    q: '¿Hacen envíos a todo Colombia?',
    a: 'Sí, realizamos envíos a nivel nacional.',
  },
  {
    q: '¿Cuánto tarda en llegar mi pedido?',
    a: 'El tiempo de entrega es entre 3 a 10 días hábiles, dependiendo de tu ubicación y el stock del producto.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-extrabold tracking-tight text-black uppercase">
          Preguntas Frecuentes
        </h1>
        <div className="mt-4 h-1 w-16 bg-black mx-auto rounded-full" />
        <p className="mt-4 text-gray-500 text-sm">Todo lo que necesitas saber antes de comprar</p>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-sm overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-bold text-black text-sm pr-4">{faq.q}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-14 text-center bg-gray-50 border border-gray-100 rounded-sm p-8">
        <p className="text-sm text-gray-600 mb-4">¿No encontraste lo que buscabas?</p>
        <a
          href="https://wa.me/56912345678"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-black text-white text-sm font-extrabold uppercase tracking-widest px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
        >
          Contáctanos por WhatsApp
        </a>
      </div>
    </div>
  );
}
