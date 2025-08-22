import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import Stats from './Stats';
import { DataProvider } from '../state/DataContext';

function App() {
  return (
    <DataProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <nav style={{
          padding: '16px 20px', 
          borderBottom: '1px solid #ddd',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            display: 'flex', 
            alignItems: 'center',
            gap: '20px'
          }}>
            <Link to="/" style={{
              textDecoration: 'none',
              color: '#333',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              🏠 Home Assessment
            </Link>
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link to="/" style={{
                textDecoration: 'none',
                color: '#007bff',
                padding: '8px 12px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}>
                Items
              </Link>
              <Link to="/stats" style={{
                textDecoration: 'none',
                color: '#007bff',
                padding: '8px 12px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}>
                Stats
              </Link>
            </div>
          </div>
        </nav>
        
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Items />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
      </div>
    </DataProvider>
  );
}

export default App;