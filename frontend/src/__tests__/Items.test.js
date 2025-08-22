import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Items from '../pages/Items';
import { DataProvider } from '../state/DataContext';

// Mock the DataContext
const mockUseData = {
  items: [],
  pagination: null,
  loading: false,
  error: null,
  fetchItems: jest.fn(),
  searchItems: jest.fn(),
  changePage: jest.fn()
};

jest.mock('../state/DataContext', () => ({
  ...jest.requireActual('../state/DataContext'),
  useData: () => mockUseData
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <DataProvider>
        {component}
      </DataProvider>
    </BrowserRouter>
  );
};

describe('Items Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseData.loading = true;
    renderWithRouter(<Items />);
    expect(screen.getByText('Loading items...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseData.error = 'Failed to fetch items';
    renderWithRouter(<Items />);
    expect(screen.getByText('Error: Failed to fetch items')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders empty state when no items', () => {
    mockUseData.items = [];
    mockUseData.loading = false;
    mockUseData.error = null;
    renderWithRouter(<Items />);
    expect(screen.getByText('No items available.')).toBeInTheDocument();
  });

  it('renders items list', () => {
    mockUseData.items = [
      { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
      { id: 2, name: 'Headphones', category: 'Electronics', price: 399 }
    ];
    mockUseData.loading = false;
    mockUseData.error = null;
    
    renderWithRouter(<Items />);
    
    expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    expect(screen.getByText('Headphones')).toBeInTheDocument();
    expect(screen.getByText('Category: Electronics')).toBeInTheDocument();
    expect(screen.getByText('Price: $2,499')).toBeInTheDocument();
  });

  it('renders search input', () => {
    mockUseData.items = [];
    mockUseData.loading = false;
    mockUseData.error = null;
    
    renderWithRouter(<Items />);
    
    const searchInput = screen.getByPlaceholderText('Search items by name or category...');
    expect(searchInput).toBeInTheDocument();
  });

  it('handles search input change', async () => {
    mockUseData.items = [];
    mockUseData.loading = false;
    mockUseData.error = null;
    
    renderWithRouter(<Items />);
    
    const searchInput = screen.getByPlaceholderText('Search items by name or category...');
    fireEvent.change(searchInput, { target: { value: 'laptop' } });
    
    await waitFor(() => {
      expect(searchInput.value).toBe('laptop');
    });
  });

  it('renders pagination when available', () => {
    mockUseData.items = [
      { id: 1, name: 'Item 1', category: 'Test', price: 100 },
      { id: 2, name: 'Item 2', category: 'Test', price: 200 }
    ];
    mockUseData.pagination = {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNext: true,
      hasPrev: false
    };
    mockUseData.loading = false;
    mockUseData.error = null;
    
    renderWithRouter(<Items />);
    
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Showing 2 of 25 items')).toBeInTheDocument();
  });

  it('shows virtualization info when many items', () => {
    const manyItems = Array.from({ length: 60 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      category: 'Test',
      price: 100
    }));
    
    mockUseData.items = manyItems;
    mockUseData.loading = false;
    mockUseData.error = null;
    
    renderWithRouter(<Items />);
    
    expect(screen.getByText(/Using virtualized list for better performance with 60 items/)).toBeInTheDocument();
  });
});
