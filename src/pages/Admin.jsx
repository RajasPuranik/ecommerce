import React, { useState, useEffect } from 'react';
import { Lock, LogOut } from 'lucide-react';

const Admin = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token);
        setError('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server error");
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="container section" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="checkout-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <Lock size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
          <h2>Admin Login</h2>
          <p style={{ marginBottom: '2rem', color: '#6b7280' }}>Secure portal for order management</p>
          
          <form onSubmit={handleLogin} className="checkout-form">
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ marginBottom: 0 }}>Admin Dashboard</h1>
        <button className="btn btn-outline" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead style={{ background: '#fefce8' }}>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '2px solid #e7e5e4' }}>Order ID</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #e7e5e4' }}>Customer</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #e7e5e4' }}>Amount</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #e7e5e4' }}>UTR Number</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #e7e5e4' }}>Status</th>
              <th style={{ padding: '1rem', borderBottom: '2px solid #e7e5e4' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No orders yet.</td>
              </tr>
            ) : orders.map(order => (
              <tr key={order.id}>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e7e5e4', fontWeight: 'bold' }}>
                  {order.id}<br/>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'normal' }}>
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e7e5e4' }}>
                  <div style={{ fontWeight: 'bold' }}>{order.customer_name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{order.customer_phone}</div>
                  <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>{order.customer_address}</div>
                  {order.location_link && (
                    <a href={order.location_link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', textDecoration: 'none', fontWeight: 'bold' }}>
                      📍 View on Maps
                    </a>
                  )}
                </td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e7e5e4', fontWeight: 'bold' }}>
                  ₹{order.total_amount}
                </td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e7e5e4', fontFamily: 'monospace', fontWeight: 'bold', color: '#1d4ed8' }}>
                  {order.utr_number}
                </td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e7e5e4' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    background: order.status === 'PAID' ? '#dcfce7' : order.status === 'REJECTED' ? '#fee2e2' : '#fef08a',
                    color: order.status === 'PAID' ? '#166534' : order.status === 'REJECTED' ? '#991b1b' : '#854d0e',
                    whiteSpace: 'nowrap'
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', borderBottom: '1px solid #e7e5e4' }}>
                  {order.status === 'PENDING VERIFICATION' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => updateOrderStatus(order.id, 'PAID')} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Approve</button>
                      <button onClick={() => updateOrderStatus(order.id, 'REJECTED')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
