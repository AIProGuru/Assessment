import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';

const VirtualizedList = ({ items, height = 600, itemHeight = 80 }) => {
  const Row = ({ index, style }) => {
    const item = items[index];
    
    return (
      <div style={style}>
        <div style={{ 
          padding: '15px', 
          margin: '5px 10px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          height: itemHeight - 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Link to={'/items/' + item.id} style={{ 
            textDecoration: 'none', 
            color: '#333',
            fontWeight: 'bold',
            fontSize: '18px',
            marginBottom: '8px'
          }}>
            {item.name}
          </Link>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <span style={{ marginRight: '15px' }}>
              <strong>Category:</strong> {item.category}
            </span>
            <span>
              <strong>Price:</strong> ${item.price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  );
};

export default VirtualizedList;
