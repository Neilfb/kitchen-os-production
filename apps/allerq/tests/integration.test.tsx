import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import SigninForm from '../src/components/SigninForm';
import RestaurantList from '../src/components/RestaurantList';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock the auth context
const mockSignin = jest.fn();
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signin: mockSignin,
    user: null,
  }),
}));

// Mock the restaurants hook
const mockRestaurants = [
  { id: '1', name: 'Test Restaurant', address: '123 Test St' },
];
jest.mock('@/hooks/useRestaurants', () => ({
  useRestaurants: () => ({
    restaurants: mockRestaurants,
    loading: false,
    error: null,
    fetchRestaurants: jest.fn(),
  }),
}));

describe('Authentication and Navigation Flow', () => {
  it('allows user to sign in and view restaurants', async () => {
    // First render the sign in form
    render(<SigninForm />);
    
    // Fill in login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input[type="password"]' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    const form = screen.getByRole('form', { name: /sign in form/i });
    fireEvent.submit(form);
    
    // Check if signin was called with correct credentials
    expect(mockSignin).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Now render the restaurant list
    render(<RestaurantList />);
    
    // Verify restaurant content is displayed
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
  });
});
