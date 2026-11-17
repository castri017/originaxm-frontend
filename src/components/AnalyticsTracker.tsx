import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '../lib/analytics';

/** Carga GA4 una vez y reporta un page_view en cada cambio de ruta de la SPA. */
export default function AnalyticsTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => { initAnalytics(); }, []);

  useEffect(() => {
    // El panel de administración no se mide: son visitas internas, no clientes.
    if (pathname.startsWith('/admin')) return;
    trackPageView(pathname + search);
  }, [pathname, search]);

  return null;
}
