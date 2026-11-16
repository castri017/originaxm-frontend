import { Link } from 'react-router-dom';
import LegalLayout from '../components/LegalLayout';
import { SITE, whatsappLink } from '../config/site';

export default function Warranty() {
  return (
    <LegalLayout
      title="Garantía"
      description="Garantía de los productos Stanley de OriginAXM: cobertura por defectos de fábrica, qué no cubre y cómo reportar un problema."
      path="/warranty"
      updated="16 de noviembre de 2026"
      intro="Todos nuestros productos son nuevos y originales. Si llega con un defecto de fábrica, te ayudamos a resolverlo."
      sections={[
        {
          title: 'Qué cubre',
          body: (
            <ul>
              <li>Defectos de fabricación o de calidad presentes desde la entrega.</li>
              <li>Productos que llegan dañados, incompletos o distintos a lo que compraste.</li>
            </ul>
          ),
        },
        {
          title: 'Qué no cubre',
          body: (
            <ul>
              <li>Golpes, caídas, abolladuras o rayones por uso normal o accidental.</li>
              <li>Mal uso o uso distinto al indicado para el producto.</li>
              <li>Desgaste natural de empaques, tapas y acabados.</li>
              <li>Productos modificados o reparados por terceros.</li>
            </ul>
          ),
        },
        {
          title: 'Cómo reportar un problema',
          body: (
            <>
              <p>
                Escríbenos por{' '}
                <a href={whatsappLink('Hola, quiero reportar un problema con mi pedido.')} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp ({SITE.whatsapp.display})</a>{' '}
                con tu nombre, el número de pedido, fotos o un video corto del defecto y una descripción de lo ocurrido.
              </p>
              <p>Revisamos tu caso y te indicamos si procede cambio, reparación o devolución del dinero, según la ley.</p>
            </>
          ),
        },
        {
          title: 'Tiempos',
          body: (
            <p>Reporta el problema lo antes posible tras recibir el producto. Mientras más pronto lo hagas, más fácil es verificarlo. Cambios y devoluciones por otras razones se rigen por <Link to="/shipping" className="underline">Envíos y devoluciones</Link> y por el derecho de retracto de los <Link to="/terms" className="underline">Términos y condiciones</Link>.</p>
          ),
        },
      ]}
    />
  );
}
