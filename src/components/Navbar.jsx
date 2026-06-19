import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CakeSlice } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cartItems } = useCart();
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          <CakeSlice size={28} />
          Royal Sweets
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/cart" className="cart-icon-container">
            <ShoppingBag size={24} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
