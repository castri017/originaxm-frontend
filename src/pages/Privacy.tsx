import { Link } from 'react-router-dom';
import LegalLayout from '../components/LegalLayout';
import { SITE, whatsappLink } from '../config/site';

export default function Privacy() {
  return (
    <LegalLayout
      title="Política de privacidad"
      description="Cómo OriginAXM recolecta, usa y protege tus datos personales, y cómo ejercer tus derechos de acceso, actualización y supresión (Ley 1581 de 2012)."
      path="/privacy"
      updated="16 de noviembre de 2026"
      intro="Esta política explica qué datos personales tratamos, para qué los usamos y cómo puedes ejercer tus derechos, de acuerdo con la Ley 1581 de 2012 y sus decretos reglamentarios (Habeas Data)."
      sections={[
        {
          title: 'Responsable del tratamiento',
          body: (
            <p>
              OriginAXM, con sede en Armenia, Quindío (Colombia). Canal para consultas y reclamos sobre datos personales: WhatsApp{' '}
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="underline">{SITE.whatsapp.display}</a>.
            </p>
          ),
        },
        {
          title: 'Datos que recolectamos',
          body: (
            <ul>
              <li>Datos de identificación y contacto: nombre, correo electrónico, teléfono.</li>
              <li>Datos de entrega y facturación: dirección, ciudad, departamento, documento cuando se requiera para el envío o el pago.</li>
              <li>Datos de la cuenta: si ingresas con Google, recibimos tu nombre y correo.</li>
              <li>Datos de compra: productos, valores, estado del pedido y reseñas.</li>
              <li>Datos de navegación: dirección IP, dispositivo, páginas visitadas y cookies.</li>
            </ul>
          ),
        },
        {
          title: 'Para qué usamos tus datos',
          body: (
            <ul>
              <li>Procesar, cobrar, despachar y hacer seguimiento a tus pedidos.</li>
              <li>Atender solicitudes, cambios, devoluciones y garantías.</li>
              <li>Crear y administrar tu cuenta y publicar tus reseñas (mostramos tu nombre con la inicial del apellido).</li>
              <li>Enviarte información de tu pedido y, si lo autorizas, novedades y promociones.</li>
              <li>Medir y mejorar el sitio, y gestionar publicidad en plataformas como Google, Meta y TikTok.</li>
              <li>Cumplir obligaciones legales, contables y de prevención de fraude.</li>
            </ul>
          ),
        },
        {
          title: 'Con quién compartimos tus datos',
          body: (
            <>
              <p>Solo con quienes son necesarios para prestar el servicio: plataformas de pago (por ejemplo, Sistecrédito), transportadoras, proveedores de alojamiento y analítica, y autoridades cuando la ley lo exija. No vendemos tus datos.</p>
              <p>Algunos de estos proveedores pueden estar fuera de Colombia; en ese caso exigimos medidas de seguridad adecuadas.</p>
            </>
          ),
        },
        {
          title: 'Tus derechos',
          body: (
            <>
              <ul>
                <li>Conocer, actualizar y rectificar tus datos.</li>
                <li>Solicitar prueba de la autorización que nos diste.</li>
                <li>Ser informado sobre el uso que damos a tus datos.</li>
                <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
                <li>Revocar la autorización y solicitar la supresión de tus datos, salvo que debamos conservarlos por una obligación legal o contractual.</li>
                <li>Acceder gratuitamente a tus datos.</li>
              </ul>
              <p>Para ejercerlos escríbenos por WhatsApp indicando tu nombre y el dato que quieres consultar o cambiar. Respondemos las consultas en máximo diez (10) días hábiles y los reclamos en máximo quince (15) días hábiles.</p>
            </>
          ),
        },
        {
          title: 'Cookies y tecnologías similares',
          body: (
            <p>Usamos cookies y almacenamiento local para mantener tu sesión y el carrito, recordar preferencias y medir el uso del sitio. Con herramientas de analítica y publicidad podemos medir visitas y conversiones. Puedes bloquearlas o borrarlas desde la configuración de tu navegador; algunas funciones podrían dejar de funcionar.</p>
          ),
        },
        {
          title: 'Seguridad y conservación',
          body: (
            <p>Aplicamos medidas técnicas y organizativas para proteger tus datos. Los conservamos mientras sea necesario para las finalidades descritas y para cumplir obligaciones legales.</p>
          ),
        },
        {
          title: 'Menores de edad',
          body: (
            <p>El sitio no está dirigido a menores de 18 años. Si crees que un menor nos entregó datos, escríbenos y los eliminaremos.</p>
          ),
        },
        {
          title: 'Cambios en esta política',
          body: (
            <p>
              Podemos actualizarla. La versión vigente es la publicada aquí. Consulta también los <Link to="/terms" className="underline">Términos y condiciones</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
