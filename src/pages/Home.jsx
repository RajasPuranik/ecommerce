import React from 'react';
import { products } from '../data';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Award, Heart, Star } from 'lucide-react';

const Home = () => {
  const { addToCart } = useCart();

  return (
    <div>
      <section className="container">
        <div className="hero">
          <img src="/images/hero.png" alt="Delicious Indian Sweets" className="hero-img" />
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>Experience the Taste of Tradition</h1>
            <p>Premium, handcrafted Indian sweets made with pure desi ghee and love. Delivered fresh to your doorstep.</p>
            <a href="#products" className="btn">Shop Now</a>
          </div>
        </div>
      </section>

      <section className="container achievements">
        <h2 className="section-title">Our Achievements</h2>
        <div className="achievements-grid">
          <div className="achievement-item">
            <Award size={48} className="achievement-icon" />
            <span className="achievement-number">25+</span>
            <span className="achievement-text">Years of Excellence</span>
          </div>
          <div className="achievement-item">
            <Heart size={48} className="achievement-icon" />
            <span className="achievement-number">50k+</span>
            <span className="achievement-text">Happy Customers</span>
          </div>
          <div className="achievement-item">
            <Star size={48} className="achievement-icon" />
            <span className="achievement-number">100%</span>
            <span className="achievement-text">Pure Ingredients</span>
          </div>
        </div>
      </section>

      <section id="products" className="container section">
        <h2 className="section-title">Our Premium Sweets</h2>
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-img-wrapper">
                <img src={product.image} alt={product.name} className="product-img" />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div className="product-price-row">
                  <span className="product-price">₹{product.price}</span>
                  <span className="product-unit">{product.unit}</span>
                </div>
                <button className="btn" onClick={() => addToCart(product)}>
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
