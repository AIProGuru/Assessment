import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        const response = await fetch('/api/stats', {
          signal: abortControllerRef.current.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setStats(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>
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
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>No statistics available</div>
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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
      
      <h2 style={{ marginBottom: '30px', color: '#333' }}>📊 Items Statistics</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Total Items */}
        <div style={{
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff', marginBottom: '10px' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '16px', color: '#666' }}>Total Items</div>
        </div>

        {/* Average Price */}
        <div style={{
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745', marginBottom: '10px' }}>
            ${stats.averagePrice.toFixed(2)}
          </div>
          <div style={{ fontSize: '16px', color: '#666' }}>Average Price</div>
        </div>

        {/* Price Range */}
        <div style={{
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107', marginBottom: '10px' }}>
            ${stats.priceRange.min} - ${stats.priceRange.max}
          </div>
          <div style={{ fontSize: '16px', color: '#666' }}>Price Range</div>
        </div>
      </div>

      {/* Categories Breakdown */}
      {stats.categories && Object.keys(stats.categories).length > 0 && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>📂 Categories Breakdown</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {Object.entries(stats.categories).map(([category, count]) => (
              <div key={category} style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                  {category}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {count} item{count !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Stats;
