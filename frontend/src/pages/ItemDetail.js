import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        const response = await fetch(`/api/items/${id}`, {
          signal: abortControllerRef.current.signal
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Item not found');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setItem(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchItem();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading item details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>
        <div style={{ marginBottom: '20px' }}>
          <Link to="/" style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '10px'
          }}>
            Back to Items
          </Link>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>Item not found</div>
        <Link to="/" style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}>
          Back to Items
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          ← Back to Items
        </Link>
      </div>
      
      <div style={{
        padding: '30px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          marginBottom: '20px', 
          color: '#333',
          fontSize: '28px'
        }}>
          {item.name}
        </h1>
        
        <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#555' }}>Category:</strong>
            <span style={{ marginLeft: '10px', color: '#333' }}>{item.category}</span>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#555' }}>Price:</strong>
            <span style={{ 
              marginLeft: '10px', 
              color: '#28a745',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              ${item.price.toLocaleString()}
            </span>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#555' }}>Item ID:</strong>
            <span style={{ marginLeft: '10px', color: '#666' }}>{item.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;