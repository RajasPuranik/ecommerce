import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useParams, useSearchParams, Link } from 'react-router-dom';

const PaymentStatus = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  return (
    <div className="container section" style={{ textAlign: 'center', padding: '100px 20px' }}>
      {status === 'PENDING' ? (
        <>
          <CheckCircle size={80} color="#f59e0b" style={{ margin: '0 auto 20px' }} />
          <h1 style={{ color: '#f59e0b', marginBottom: '10px' }}>Order Submitted for Verification</h1>
          <p style={{ fontSize: '1.2rem', color: '#4b5563' }}>Your order <strong>{orderId}</strong> has been received.</p>
          <p style={{ color: '#6b7280', marginTop: '20px' }}>We are verifying your UTR number with our bank. You will receive an update once the payment is confirmed.</p>
        </>
      ) : (
        <>
          <XCircle size={80} color="#ef4444" style={{ margin: '0 auto 20px' }} />
          <h1 style={{ color: '#ef4444', marginBottom: '10px' }}>Payment Failed</h1>
          <p style={{ fontSize: '1.2rem', color: '#4b5563' }}>Something went wrong with your payment for order <strong>{orderId}</strong>.</p>
        </>
      )}
      
      <Link to="/" className="btn" style={{ marginTop: '30px' }}>Return to Home</Link>
    </div>
  );
};

export default PaymentStatus;
