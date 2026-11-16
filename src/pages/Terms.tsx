import { Link } from 'react-router-dom';
import LegalLayout from '../components/LegalLayout';
import { SITE, whatsappLink } from '../config/site';

export default function Terms() {
  return (
    <LegalLayout
      title="Términos y condiciones"
      description="Condiciones de uso del sitio y de compra en OriginAXM: pedidos, precios, pagos, envíos, derecho de retracto y garantía."
      path="/terms"
      updated="16 de noviembre de 2026"
      intro={<>Al navegar o comprar en {SITE.url.replace('https://', '')} aceptas estos términos. Léelos con calma: explican cómo funciona tu compra y cuáles son tus derechos como consumidor.</>}
      sections={[
        {
          title: 'Quiénes somos',
          body: (
            <p>
              OriginAXM es una tienda en línea con sede en Armenia, Quindío (Colombia) que comercializa termos, botellas, vasos y accesorios de la marca Stanley. Puedes escribirnos por WhatsApp al{' '}
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="underline">{SITE.whatsapp.display}</a>.
            </p>
          ),
        },
        {
          title: 'Productos y autenticidad',
          body: (
            <>
              <p>Vendemos productos nuevos y 100% originales. La información, fotos y especificaciones del sitio buscan describir el producto con la mayor exactitud posible; pueden existir pequeñas diferencias de tono por la pantalla.</p>
              <p>Puedes consultar la <a href="/guias/stanley-original.pdf" target="_blank" rel="noopener noreferrer" className="underline">guía para identificar un termo Stanley original</a> y escribirnos ante cualquier duda antes de comprar.</p>
            </>
          ),
        },
        {
          title: 'Precios, disponibilidad y pedidos',
          body: (
            <ul>
              <li>Los precios están en pesos colombianos (COP) e incluyen los impuestos que apliquen, salvo que se indique otra cosa.</li>
              <li>El stock es limitado. Un pedido queda confirmado cuando el pago es aprobado o cuando acordamos el pago contra entrega.</li>
              <li>Algunos productos son de pedido internacional y llegan en 10 a 15 días, con seguimiento. Esa condición se indica en la ficha del producto.</li>
              <li>Si un precio o una disponibilidad se publicó por error evidente, te contactaremos para corregirlo o cancelar el pedido con devolución total de lo pagado.</li>
            </ul>
          ),
        },
        {
          title: 'Medios de pago',
          body: (
            <>
              <p>Puedes pagar con los medios disponibles en el checkout (por ejemplo, tarjeta, PSE, Sistecrédito o contra entrega donde aplique). Los pagos en línea se procesan a través de plataformas de pago autorizadas; OriginAXM no almacena los datos completos de tu tarjeta.</p>
              <p>Podemos solicitar verificación adicional de identidad o del pago antes de despachar un pedido.</p>
            </>
          ),
        },
        {
          title: 'Envíos',
          body: (
            <p>
              Enviamos a todo Colombia. Los tiempos, costos y condiciones de envío gratuito están en <Link to="/shipping" className="underline">Envíos y devoluciones</Link>. Los plazos son estimados y pueden variar por la transportadora, la ubicación o el stock.
            </p>
          ),
        },
        {
          title: 'Derecho de retracto, cambios y devoluciones',
          body: (
            <>
              <p>En compras a distancia tienes derecho a retractarte dentro de los cinco (5) días hábiles siguientes a la entrega del producto, conforme al artículo 47 de la Ley 1480 de 2011. El producto debe devolverse sin uso y en su empaque original; el costo del transporte de la devolución corre por cuenta del consumidor, y el dinero se reintegra dentro de los treinta (30) días calendario siguientes al ejercicio del retracto.</p>
              <p>Las condiciones prácticas para solicitar cambios o devoluciones están en <Link to="/shipping" className="underline">Envíos y devoluciones</Link>.</p>
            </>
          ),
        },
        {
          title: 'Garantía',
          body: (
            <p>Los productos tienen la garantía legal frente a defectos de fábrica y calidad. El procedimiento está en la página de <Link to="/warranty" className="underline">Garantía</Link>.</p>
          ),
        },
        {
          title: 'Cuenta de usuario',
          body: (
            <p>Eres responsable de la información que registras y de mantener la confidencialidad de tu cuenta. Podemos suspender cuentas con uso fraudulento o que incumplan estos términos.</p>
          ),
        },
        {
          title: 'Reseñas y contenido de los usuarios',
          body: (
            <p>Solo los clientes con una compra entregada pueden calificar un producto. Las reseñas se revisan antes de publicarse y podemos rechazar las que contengan insultos, datos personales, publicidad o información falsa.</p>
          ),
        },
        {
          title: 'Propiedad intelectual',
          body: (
            <p>El diseño del sitio, el logo y los textos de OriginAXM son de nuestra propiedad. Stanley y otras marcas mencionadas pertenecen a sus respectivos titulares y se usan para identificar los productos que vendemos.</p>
          ),
        },
        {
          title: 'Datos personales',
          body: (
            <p>El tratamiento de tus datos se rige por nuestra <Link to="/privacy" className="underline">Política de privacidad</Link>.</p>
          ),
        },
        {
          title: 'Peticiones, quejas y reclamos',
          body: (
            <p>Escríbenos por WhatsApp o por nuestras redes y responderemos lo antes posible. Si no estás conforme con la respuesta, puedes acudir a la Superintendencia de Industria y Comercio (SIC).</p>
          ),
        },
        {
          title: 'Ley aplicable y cambios',
          body: (
            <p>Estos términos se rigen por las leyes de la República de Colombia. Podemos actualizarlos; la versión vigente es la publicada en esta página, con su fecha de actualización.</p>
          ),
        },
      ]}
    />
  );
}
