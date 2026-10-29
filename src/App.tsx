import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import RootLayout from './components/layout/RootLayout';
import Home from './pages/Home';
import { queryClient } from './lib/queryClient';
import { catalogKeys } from './features/catalog/queries';
import { useCatalogStore } from './store/useCatalogStore';

// Inicio carga con el bundle principal; el resto de páginas se descarga al visitarlas.
// Así quien entra a la tienda no descarga el panel de administración.
const Catalog        = lazy(() => import('./pages/Catalog'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart           = lazy(() => import('./pages/Cart'));
const Checkout       = lazy(() => import('./pages/Checkout'));
const Login          = lazy(() => import('./pages/Login'));
const Profile        = lazy(() => import('./pages/Profile'));
const Admin          = lazy(() => import('./pages/Admin'));
const About          = lazy(() => import('./pages/About'));
const FAQ            = lazy(() => import('./pages/FAQ'));
const Shipping       = lazy(() => import('./pages/Shipping'));
const Contact        = lazy(() => import('./pages/Contact'));
const PaymentResult  = lazy(() => import('./pages/PaymentResult'));

function PageFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse" aria-busy="true" aria-label="Cargando página">
      <div className="h-8 w-56 bg-brand-sand-dark mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-brand-sand-dark" />
        ))}
      </div>
    </div>
  );
}

/** Cuando el admin o una compra cambian el catálogo, se refrescan los datos en caché. */
function CatalogInvalidation() {
  const version = useCatalogStore((s) => s.version);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    void queryClient.invalidateQueries({ queryKey: catalogKeys.all });
  }, [version]);
  return null;
}

const page = (element: React.ReactNode) => <Suspense fallback={<PageFallback />}>{element}</Suspense>;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CatalogInvalidation />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="catalog" element={page(<Catalog />)} />
            <Route path="product/:id" element={page(<ProductDetails />)} />
            <Route path="cart" element={page(<Cart />)} />
            <Route path="checkout" element={page(<Checkout />)} />
            <Route path="login" element={page(<Login />)} />
            <Route path="profile" element={page(<Profile />)} />
            <Route path="admin" element={page(<Admin />)} />
            <Route path="about" element={page(<About />)} />
            <Route path="faq" element={page(<FAQ />)} />
            <Route path="shipping" element={page(<Shipping />)} />
            <Route path="contact" element={page(<Contact />)} />
            <Route path="payment-result" element={page(<PaymentResult />)} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
