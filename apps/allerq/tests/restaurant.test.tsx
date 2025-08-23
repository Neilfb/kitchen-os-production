import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import RestaurantList from '../src/components/RestaurantList';

// Mock the restaurant data
const mockRestaurants = [
  {
    id: '1',
    name: 'Test Restaurant',
    description: 'A test restaurant',
    address: '123 Test St',
  },
  {
    id: '2',
    name: 'Another Restaurant',
    description: 'Another test restaurant',
    address: '456 Test Ave',
  },
];

// Mock the useRestaurants hook
jest.mock('@/hooks/useRestaurants', () => ({
  useRestaurants: () => ({
    restaurants: mockRestaurants,
    loading: false,
    error: null,
    fetchRestaurants: jest.fn(),
  }),
}));

describe('RestaurantList', () => {
  it('renders the restaurant list', () => {
    render(<RestaurantList />);
    
    // Verify that restaurants are rendered
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Another Restaurant')).toBeInTheDocument();
  });

  it('displays restaurant details', () => {
    render(<RestaurantList />);
    
    // Check that restaurant details are shown
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    expect(screen.getByText('456 Test Ave')).toBeInTheDocument();
  });
});
