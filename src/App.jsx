import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import PaymentStatus from './pages/PaymentStatus';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/payment-status/:orderId" element={<PaymentStatus />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
