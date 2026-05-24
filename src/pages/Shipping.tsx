import { Package, RefreshCw, Clock, CheckCircle, XCircle, Truck, AlertTriangle } from 'lucide-react';

export default function Shipping() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-extrabold tracking-tight text-black uppercase">
          Envíos y Devoluciones
        </h1>
        <div className="mt-4 h-1 w-16 bg-black mx-auto rounded-full" />
        <p className="mt-4 text-gray-500 text-sm">Tu satisfacción es muy importante para nosotros</p>
      </div>

      {/* Envíos */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-black uppercase tracking-tight">Envíos</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-sm px-5 py-4">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">Realizamos envíos a <span className="font-semibold text-black">todo Colombia</span>.</p>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-sm px-5 py-4">
            <Clock className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">Tiempo de entrega: <span className="font-semibold text-black">3 a 10 días hábiles</span>, dependiendo de tu ubicación y el stock del producto.</p>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-sm px-5 py-4">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">Envío <span className="font-semibold text-black">gratis</span> en compras superiores a <span className="font-semibold text-black">$300.000</span> o en Armenia, Quindío.</p>
          </div>
        </div>
      </section>

      {/* Devoluciones */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-black uppercase tracking-tight">Devoluciones y Cambios</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-sm px-5 py-4">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">Tienes hasta <span className="font-semibold text-black">3 días calendario</span> después de recibir el producto para solicitar un cambio o devolución.</p>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-sm px-5 py-4">
            <Package className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">El producto debe estar <span className="font-semibold text-black">sin uso, en perfecto estado</span> y con su empaque original.</p>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-sm px-5 py-4">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700"><span className="font-semibold text-black">No aplican devoluciones</span> por mal uso del producto.</p>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-sm px-5 py-4">
            <Truck className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">Los costos de envío por cambios o devoluciones pueden ser <span className="font-semibold text-black">asumidos por el cliente</span>, salvo defectos de fábrica.</p>
          </div>
        </div>
      </section>

      {/* Defecto de fábrica */}
      <div className="mt-8 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-sm px-5 py-4">
        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-gray-700">
          En caso de recibir un producto con defecto, <span className="font-semibold text-black">contáctanos inmediatamente</span> para darte una solución.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-14 text-center bg-gray-50 border border-gray-100 rounded-sm p-8">
        <p className="text-sm text-gray-600 mb-4">¿Necesitas iniciar una devolución o tienes alguna duda?</p>
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
