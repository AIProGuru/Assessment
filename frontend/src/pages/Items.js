import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useData } from '../state/DataContext';
import VirtualizedList from '../components/VirtualizedList';
import { Link } from 'react-router-dom';

function Items() {
  const { items, pagination, loading, error, fetchItems, searchItems, changePage, currentSearchTerm } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [useVirtualization, setUseVirtualization] = useState(false);
  const abortControllerRef = useRef(null);

  // Sync local search term with context when it changes
  useEffect(() => {
    setSearchTerm(currentSearchTerm);
  }, [currentSearchTerm]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Determine if we should use virtualization (when we have many items)
  useEffect(() => {
    setUseVirtualization(items.length > 50);
  }, [items.length]);

  // Fetch items on mount and when search term changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        if (debouncedSearchTerm) {
          await searchItems(debouncedSearchTerm, abortControllerRef.current.signal);
        } else {
          await fetchItems(abortControllerRef.current.signal);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          console.error('Error fetching items:', err);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSearchTerm, fetchItems, searchItems]);

  const handlePageChange = useCallback(async (page) => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      await changePage(page, abortControllerRef.current.signal);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error changing page:', err);
      }
    }
  }, [changePage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    // This will trigger the useEffect to fetch all items
  };

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
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

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Items</h2>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search items by name or category..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div>Loading items...</div>
        </div>
      )}

      {/* Items List */}
      {!loading && items.length > 0 && (
        <>
          {/* Virtualization Info */}
          {useVirtualization && (
            <div style={{ 
              marginBottom: '10px', 
              padding: '8px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '4px',
              fontSize: '14px',
              color: '#1976d2'
            }}>
              Using virtualized list for better performance with {items.length} items
            </div>
          )}

          {/* Virtualized or Regular List */}
          {useVirtualization ? (
            <div style={{ height: '600px', marginBottom: '20px' }}>
              <VirtualizedList items={items} height={600} itemHeight={80} />
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
              {items.map(item => (
                <li key={item.id} style={{ 
                  padding: '15px', 
                  margin: '10px 0', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'box-shadow 0.2s ease'
                }}>
                  <Link to={'/items/' + item.id} style={{ 
                    textDecoration: 'none', 
                    color: '#333',
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>
                    {item.name}
                  </Link>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    <span style={{ marginRight: '15px' }}>
                      <strong>Category:</strong> {item.category}
                    </span>
                    <span>
                      <strong>Price:</strong> ${item.price.toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pagination.hasPrev ? '#007bff' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: pagination.hasPrev ? 'pointer' : 'not-allowed'
                }}
              >
                Previous
              </button>
              
              <span style={{ fontSize: '14px' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                style={{
                  padding: '8px 16px',
                  backgroundColor: pagination.hasNext ? '#007bff' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: pagination.hasNext ? 'pointer' : 'not-allowed'
                }}
              >
                Next
              </button>
            </div>
          )}

          {/* Results Info */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '10px', 
            fontSize: '14px', 
            color: '#666' 
          }}>
            Showing {items.length} of {pagination?.total || 0} items
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
            {searchTerm ? 'No items found matching your search.' : 'No items available.'}
          </div>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Items;