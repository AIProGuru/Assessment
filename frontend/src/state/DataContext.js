import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  const fetchItems = useCallback(async (signal, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const { page = 1, limit = 10, q = '' } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(q && { q })
      });

      const response = await fetch(`http://localhost:3001/api/items?${queryParams}`, {
        signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        console.error('Error fetching items:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const searchItems = useCallback(async (searchTerm, signal) => {
    setCurrentSearchTerm(searchTerm);
    await fetchItems(signal, { q: searchTerm, page: 1, limit: 10 });
  }, [fetchItems]);

  const changePage = useCallback(async (page, signal) => {
    await fetchItems(signal, { page, limit: 10, q: currentSearchTerm });
  }, [fetchItems, currentSearchTerm]);

  return (
    <DataContext.Provider value={{ 
      items, 
      pagination, 
      loading, 
      error, 
      fetchItems, 
      searchItems, 
      changePage,
      currentSearchTerm
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};