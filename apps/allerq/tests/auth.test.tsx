import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import SigninForm from '../src/components/SigninForm';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock the auth context
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: jest.fn(),
    user: null,
  }),
}));

describe('SigninForm', () => {
  it('renders the sign in form', () => {
    render(<SigninForm />);
    
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i, { selector: 'input[type="password"]' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
  
  it('requires a valid email', async () => {
    render(<SigninForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    // HTML5 validation should prevent form submission for invalid email
    expect(emailInput).toBeInvalid();
  });
});
