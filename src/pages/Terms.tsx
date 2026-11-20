import { Link } from 'react-router-dom';
import LegalLayout from '../components/LegalLayout';
import { SITE, DELIVERY, whatsappLink } from '../config/site';
import { TERMS_UPDATED } from '../config/legal';

const Mail = () => (
  <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a>
);

export default function Terms() {
  return (
    <LegalLayout
      title="Términos y condiciones"
      description="Términos y condiciones de uso y compra en Origin AXM: productos originales Stanley, precios y pagos, cambios y devoluciones, garantía, derecho de retracto, reversión del pago, datos personales y cookies."
      path="/terms"
      updated={TERMS_UPDATED}
      intro={<>Bienvenido a originaxm.com. Al acceder y utilizar este sitio web, aceptas los siguientes Términos y Condiciones. Te recomendamos leerlos detalladamente antes de realizar cualquier transacción.</>}
      sections={[
        {
          title: 'Información de la empresa',
          body: (
            <p>
              El sitio web originaxm.com es operado por Origin AXM, con domicilio principal en la ciudad de Armenia, Quindío, Colombia. Para cualquier solicitud, queja o reclamo, los usuarios pueden comunicarse al correo electrónico <Mail /> o al teléfono{' '}
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="underline">{SITE.whatsapp.display}</a>.
            </p>
          ),
        },
        {
          title: 'Naturaleza de los productos y propiedad intelectual',
          body: (
            <>
              <p>Origin AXM se dedica a la comercialización al por menor de termos y accesorios de la marca Stanley.</p>
              <ul>
                <li><strong>Autenticidad:</strong> garantizamos que todos los productos comercializados en esta plataforma son 100% originales. Puedes consultar la <a href="/guias/stanley-original.pdf" target="_blank" rel="noopener noreferrer" className="underline">guía para identificar un termo Stanley original</a>.</li>
                <li><strong>Marcas de terceros:</strong> Origin AXM actúa como comercializador independiente. La marca "Stanley", sus logotipos y diseños son propiedad exclusiva de Pacific Market International (PMI). El uso de estas marcas en originaxm.com tiene fines estrictamente descriptivos y comerciales para la venta de los productos.</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Precios y pasarelas de pago',
          body: (
            <>
              <p>Todos los precios publicados en el sitio web están en pesos colombianos (COP) e incluyen los impuestos aplicables conforme a la ley colombiana, salvo que se indique lo contrario. Los costos de envío se calcularán y detallarán en la pantalla de pago antes de finalizar la compra.</p>
              <p>Las transacciones se procesan de manera segura a través de pasarelas de pago aliadas, incluyendo Wompi y Sistecrédito. Origin AXM no almacena datos de tarjetas de crédito o débito; dicha información es manejada exclusivamente por las pasarelas de pago bajo sus propios estándares de seguridad y encriptación.</p>
            </>
          ),
        },
        {
          title: 'Cambios y devoluciones',
          body: (
            <>
              <p>Toda solicitud será sometida a una evaluación técnica cuando corresponda. El proceso de revisión podrá tomar hasta quince (15) días hábiles contados desde la recepción del producto.</p>
              <p>Cuando proceda el reembolso, este se realizará mediante el mismo medio de pago utilizado por el consumidor o por otro previamente acordado, dentro de los términos establecidos por la legislación vigente.</p>
            </>
          ),
        },
        {
          title: 'Cambio de dirección',
          body: (
            <p>El cambio de dirección será posible siempre que el pedido no haya sido despachado. Si el pedido ya fue entregado a la transportadora, Origin AXM gestionará el cambio con el operador logístico.</p>
          ),
        },
        {
          title: 'Garantías legales',
          body: (
            <>
              <p>Conforme al Estatuto del Consumidor (Ley 1480 de 2011), todos nuestros productos Stanley cuentan con garantía por defectos de fábrica. El término de la garantía es de treinta (30) días contados a partir de la entrega del producto.</p>
              <p>La garantía no cubre daños causados por mal uso, golpes, caídas, uso de productos químicos abrasivos o el desgaste natural por el uso continuo. Para solicitar una garantía, el cliente debe enviar un correo a <Mail /> con evidencia fotográfica del defecto y el comprobante de compra. Más información en la página de <Link to="/warranty" className="underline">Garantía</Link>.</p>
            </>
          ),
        },
        {
          title: 'Derecho de retracto (exclusivo para compras online)',
          body: (
            <>
              <p>De acuerdo con el artículo 47 de la Ley 1480 de 2011, al ser una venta a distancia, el consumidor tiene derecho a retractarse de la compra dentro de los cinco (5) días hábiles siguientes a la entrega del producto. El producto debe devolverse en las mismas condiciones en que fue recibido: nuevo, sin uso, con sus etiquetas, empaques originales y manuales.</p>
              <p>Los costos de transporte y demás que conlleve la devolución del producto serán asumidos por el cliente. Una vez recibido y verificado el producto, Origin AXM, acogiéndose a la Ley 2439 de 2024, realizará la devolución del dinero en un plazo máximo de quince (15) días calendario.</p>
            </>
          ),
        },
        {
          title: 'Exclusiones',
          body: (
            <>
              <p>No procederán cambios, devoluciones o la garantía comercial cuando:</p>
              <ul>
                <li>El producto presente señales de manipulación indebida.</li>
                <li>Existan daños ocasionados por golpes, caídas o accidentes.</li>
                <li>Se evidencie un uso diferente al previsto para el producto.</li>
                <li>El producto haya sido adquirido a través de distribuidores no autorizados.</li>
                <li>El producto haya sido adquirido fuera de Colombia.</li>
                <li>Se trate de productos personalizados, salvo cuando corresponda la aplicación de la garantía legal o de la garantía comercial por eficiencia térmica del cuerpo principal.</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Disponibilidad de inventario',
          body: (
            <>
              <p>Si excepcionalmente un producto adquirido no se encuentra disponible, Origin AXM ofrecerá al consumidor:</p>
              <ul>
                <li>Un producto equivalente.</li>
                <li>El reembolso total del dinero.</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Política de envíos y entregas',
          body: (
            <>
              <p>Los envíos se realizan desde Armenia, Quindío, a todo el territorio nacional colombiano donde exista cobertura por parte de nuestras transportadoras aliadas.</p>
              <p>Los tiempos de entrega estimados son de {DELIVERY.main} para ciudades principales y de {DELIVERY.special} para trayectos especiales o extendidos, contados a partir de la confirmación del pago.</p>
              <p>Origin AXM no se hace responsable por retrasos derivados de causas de fuerza mayor, alteraciones de orden público o desastres naturales. Consulta también <Link to="/shipping" className="underline">Envíos y devoluciones</Link>.</p>
            </>
          ),
        },
        {
          title: 'Reversión del pago',
          body: (
            <>
              <p>De acuerdo con el artículo 51 de la Ley 1480 de 2011 y el Decreto 587 de 2016, en compras pagadas mediante tarjeta de crédito, débito, Sistecrédito o cualquier otro instrumento de pago electrónico en originaxm.com, el consumidor podrá solicitar la reversión del pago en los siguientes casos: cuando sea objeto de fraude, cuando corresponda a una operación no solicitada, cuando el producto no haya sido recibido, cuando no corresponda a lo solicitado o cuando resulte defectuoso.</p>
              <p>Para ejercer este derecho, el consumidor cuenta con un plazo máximo de cinco (5) días hábiles contados desde la fecha en que tuvo noticia del fraude o la operación no solicitada, o desde que debió recibir el producto o lo recibió defectuoso o incorrecto. Dentro de este mismo plazo deberá:</p>
              <ul>
                <li>Enviar la reclamación al correo <Mail /> indicando la causal, el valor a revertir, el comprobante de compra y la identificación de la cuenta o tarjeta cargada.</li>
                <li>Informar que el producto está a disposición de Origin AXM para su recolección en las mismas condiciones en que fue entregado (cuando aplique).</li>
                <li>Notificar la reclamación al banco o emisor del medio de pago utilizado, adjuntando la constancia del reclamo presentado ante Origin AXM.</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Tratamiento de datos personales (Habeas Data)',
          body: (
            <>
              <p>En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, Origin AXM recolecta, almacena y procesa los datos personales (nombre, dirección, teléfono, correo electrónico) proporcionados por el titular de la información en el proceso de compra, exclusivamente para fines de facturación, despacho de pedidos, soporte al cliente y, si el usuario lo consiente, envío de información comercial.</p>
              <p>El usuario tiene derecho a conocer, actualizar, rectificar y solicitar la eliminación de sus datos personales en cualquier momento escribiendo a <Mail />. Consulta nuestra <Link to="/privacy" className="underline">Política de privacidad</Link>.</p>
            </>
          ),
        },
        {
          title: 'Política de cookies',
          body: (
            <>
              <p>Con el objetivo de brindar una mejor experiencia de navegación, optimizar el rendimiento de originaxm.com y ofrecer un servicio personalizado, utilizamos cookies y tecnologías de rastreo similares.</p>
              <p><strong>¿Qué son las cookies?</strong> Son pequeños archivos de texto o fragmentos de información que se descargan y almacenan en el navegador o dispositivo del usuario (computadora, smartphone, tablet) al acceder a nuestra página web.</p>
              <p><strong>Tipos de cookies que utilizamos en Origin AXM:</strong></p>
              <ul>
                <li><strong>Cookies técnicas y estrictamente necesarias:</strong> son indispensables para el correcto funcionamiento de la plataforma. Permiten la navegación fluida, mantener los artículos seleccionados en el carrito de compras a lo largo de la sesión y garantizar un entorno seguro durante la transición hacia nuestras pasarelas de pago (Wompi y Sistecrédito). Sin estas cookies, la compra online no se podría concretar.</li>
                <li><strong>Cookies de rendimiento y análisis:</strong> nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, recopilando información anónima sobre las páginas más visitadas, el tiempo de permanencia y los posibles errores de carga. Esto nos permite mejorar continuamente la estructura y el contenido de la tienda.</li>
                <li><strong>Cookies de marketing o publicidad corporativa:</strong> se utilizan para rastrear a los visitantes en las páginas web con el fin de mostrar anuncios que sean relevantes y atractivos para el usuario individual, basándose en sus intereses y hábitos de búsqueda de nuestros productos.</li>
              </ul>
              <p><strong>Aceptación y gestión de las cookies:</strong> al ingresar y navegar en originaxm.com, el usuario es informado sobre el uso de cookies mediante un aviso (banner) en el sitio y acepta su implementación. Sin embargo, el usuario tiene total libertad para configurar su navegador de internet (Chrome, Safari, Edge, Firefox, etc.) en cualquier momento para bloquear, restringir o eliminar las cookies instaladas.</p>
              <p><strong>Nota importante:</strong> si el usuario decide deshabilitar las cookies técnicas o necesarias, es posible que algunas funcionalidades de la tienda, como el proceso de checkout (pago) o el almacenamiento de productos en el carrito, presenten fallos o no funcionen correctamente.</p>
            </>
          ),
        },
        {
          title: 'Canal de peticiones, quejas y reclamos',
          body: (
            <>
              <p>Para presentar peticiones, quejas o reclamos relacionados con compras, entregas o servicios, el consumidor podrá escribir al correo electrónico <Mail />, indicando sus datos de contacto, el número de pedido y una descripción clara del caso.</p>
              <p>Una vez recibida la solicitud, Origin AXM asignará y enviará un número de radicado conforme al orden de llegada para facilitar su seguimiento, y dará respuesta en un plazo máximo de quince (15) días hábiles, de acuerdo con la legislación colombiana vigente.</p>
            </>
          ),
        },
        {
          title: 'Modificaciones',
          body: (
            <p>Origin AXM se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las actualizaciones serán publicadas en el sitio web y entrarán en vigencia desde el momento de su publicación.</p>
          ),
        },
      ]}
    />
  );
}
