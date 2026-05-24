import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Shipping from './pages/Shipping';
import Contact from './pages/Contact';
import PaymentResult from './pages/PaymentResult';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<Admin />} />
          <Route path="about" element={<About />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="contact" element={<Contact />} />
          <Route path="payment-result" element={<PaymentResult />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
