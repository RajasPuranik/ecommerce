import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { QRCodeSVG } from 'qrcode.react';
import { Trash2, Plus, Minus, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [userDetails, setUserDetails] = useState({ name: '', phone: '', locationLink: '' });
  const [step, setStep] = useState(1);
  const [locationStatus, setLocationStatus] = useState('');
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to India
  const [markerPosition, setMarkerPosition] = useState(null);
  
  const total = getCartTotal();
  const UPI_ID = "rajastalk2u@oksbi";

  useEffect(() => {
    if (markerPosition) {
      const link = `https://www.google.com/maps?q=${markerPosition.lat},${markerPosition.lng}`;
      setUserDetails(prev => ({ ...prev, locationLink: link }));
    }
  }, [markerPosition]);

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    setStep(2);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }
    
    setLocationStatus('Locating...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos = { lat: position.coords.latitude, lng: position.coords.longitude };
        setMapCenter([newPos.lat, newPos.lng]);
        setMarkerPosition(newPos);
        setLocationStatus('Location pinned successfully! ✅');
      },
      () => {
        setLocationStatus('Permission denied. Please tap on the map to drop a pin 📍');
      }
    );
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    
    if (!userDetails.locationLink) {
      alert("Please provide your delivery location by allowing access or dropping a pin on the map.");
      return;
    }

    if (userDetails.name && userDetails.phone) {
      setStep(3);
    }
  };

  const [utr, setUtr] = useState('');

  const handleConfirmOrder = async () => {
    if (utr.length < 8) {
      alert("Please enter a valid UTR number.");
      return;
    }
    
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userDetails.name,
          phone: userDetails.phone,
          address: 'Location Pinned on Map',
          locationLink: userDetails.locationLink,
          items: cartItems,
          totalAmount: total,
          utr: utr
        })
      });
      
      const data = await res.json();
      if (data.success && data.orderId) {
        clearCart();
        window.location.href = `/payment-status/${data.orderId}?status=PENDING`;
      } else {
        alert(data.message || 'Failed to submit order.');
      }
    } catch (err) {
      console.error(err);
      alert('Server error while submitting order.');
    }
  };

  // UPI Intent URL format
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Royal Sweets&am=${total}&cu=INR&tn=Order Payment from ${userDetails.name}`;

  if (cartItems.length === 0 && step === 1) {
    return (
      <div className="container empty-cart">
        <h2>Your cart is empty!</h2>
        <p>Looks like you haven't added any sweet treats to your cart yet.</p>
        <Link to="/" className="btn">Browse Sweets</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="section-title">
        {step === 1 ? 'Your Shopping Cart' : step === 2 ? 'Checkout Details' : 'Scan & Enter UTR'}
      </h1>
      
      <div className="cart-layout">
        <div className="cart-items">
          {step === 1 && (
            <>
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <div className="cart-item-price">₹{item.price} / {item.unit}</div>
                  </div>
                  <div className="quantity-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                    <span>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                  </div>
                  <div style={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
                    ₹{item.price * item.quantity}
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleProceedToPayment} className="checkout-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={userDetails.name} 
                  onChange={(e) => setUserDetails({...userDetails, name: e.target.value})} 
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label>WhatsApp Number (10 Digits)</label>
                <input 
                  type="tel" 
                  required 
                  pattern="^[6-9]\d{9}$"
                  title="Please enter a valid 10-digit Indian mobile number"
                  value={userDetails.phone} 
                  onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})} 
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Delivery Location
                  <button type="button" onClick={getLocation} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    📍 Locate Me
                  </button>
                </label>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0' }}>
                  Click "Locate Me" or tap anywhere on the map to drop a pin.
                </p>
                {locationStatus && <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 'bold', color: markerPosition ? '#22c55e' : '#ef4444' }}>{locationStatus}</p>}
                
                <div style={{ height: '300px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <MapContainer center={mapCenter} zoom={markerPosition ? 16 : 4} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={markerPosition} setPosition={setMarkerPosition} />
                  </MapContainer>
                </div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>Back to Cart</button>
                <button type="submit" className="btn">Proceed to Payment</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="upi-section">
              <h3>Scan to Pay: ₹{total}</h3>
              <p style={{ color: '#6b7280' }}>Pay directly via any UPI app (GPay, PhonePe, Paytm, etc.)</p>
              
              <div className="qr-container">
                <QRCodeSVG value={upiUrl} size={250} level="H" includeMargin={true} />
              </div>
              
              <div style={{ padding: '1rem', background: '#fefce8', borderRadius: '0.5rem', border: '1px solid #fef08a' }}>
                <strong>UPI ID:</strong> {UPI_ID}
              </div>

              <div style={{ marginTop: '2rem', width: '100%', maxWidth: '400px', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Enter 12-Digit UTR / Transaction ID *</label>
                <input 
                  type="text" 
                  required 
                  value={utr} 
                  onChange={(e) => setUtr(e.target.value)} 
                  placeholder="e.g. 312345678901"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e7e5e4', borderRadius: '0.5rem' }}
                />
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  You must enter the transaction ID from your payment app. Your order will only be processed after we verify this number matches our bank records.
                </p>
              </div>
              
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
                <button type="button" className="btn" style={{ background: '#22c55e', color: 'white' }} onClick={handleConfirmOrder}>
                  <CheckCircle size={18} />
                  Submit Order for Verification
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="checkout-card">
          <h2 style={{ marginBottom: '1.5rem' }}>Order Summary</h2>
          <div className="checkout-summary">
            {cartItems.map(item => (
              <div key={item.id} className="summary-row">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="summary-row">
              <span>Delivery</span>
              <span style={{ color: '#22c55e' }}>Free</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
          {step === 1 && (
            <button className="btn" style={{ width: '100%' }} onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
