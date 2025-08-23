import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoleGate from '@/components/RoleGate';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

// Mock the Firebase Auth context
jest.mock('@/contexts/FirebaseAuthContext');

const mockUseFirebaseAuth = useFirebaseAuth as jest.MockedFunction<typeof useFirebaseAuth>;

describe('RoleGate Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state when auth is loading', () => {
    mockUseFirebaseAuth.mockReturnValue({
      user: null,
      loading: true,
      hasRole: jest.fn(),
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUserProfile: jest.fn(),
    });

    render(
      <RoleGate allowedRoles="admin">
        <div>Protected Content</div>
      </RoleGate>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows content when user has required role', () => {
    mockUseFirebaseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        role: 'admin',
        getIdToken: jest.fn(),
      },
      loading: false,
      hasRole: jest.fn((role) => role === 'admin'),
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUserProfile: jest.fn(),
    });

    render(
      <RoleGate allowedRoles="admin">
        <div>Protected Content</div>
      </RoleGate>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows fallback when user does not have required role', () => {
    mockUseFirebaseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        role: 'manager',
        getIdToken: jest.fn(),
      },
      loading: false,
      hasRole: jest.fn((role) => role === 'manager'),
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUserProfile: jest.fn(),
    });

    render(
      <RoleGate 
        allowedRoles="admin"
        fallback={<div>Access Denied</div>}
      >
        <div>Protected Content</div>
      </RoleGate>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('works with multiple allowed roles', () => {
    mockUseFirebaseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        role: 'manager',
        getIdToken: jest.fn(),
      },
      loading: false,
      hasRole: jest.fn((roles) => {
        if (Array.isArray(roles)) {
          return roles.includes('manager');
        }
        return roles === 'manager';
      }),
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUserProfile: jest.fn(),
    });

    render(
      <RoleGate allowedRoles={['admin', 'manager']}>
        <div>Protected Content</div>
      </RoleGate>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('hides content when user has no role', () => {
    mockUseFirebaseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        role: undefined,
        getIdToken: jest.fn(),
      },
      loading: false,
      hasRole: jest.fn(() => false),
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUserProfile: jest.fn(),
    });

    render(
      <RoleGate 
        allowedRoles="admin"
        fallback={<div>No Role</div>}
      >
        <div>Protected Content</div>
      </RoleGate>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('No Role')).toBeInTheDocument();
  });

  it('works with superadmin role', () => {
    mockUseFirebaseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'superadmin@example.com',
        displayName: 'Super Admin',
        emailVerified: true,
        role: 'superadmin',
        getIdToken: jest.fn(),
      },
      loading: false,
      hasRole: jest.fn((role) => role === 'superadmin'),
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      refreshUserProfile: jest.fn(),
    });

    render(
      <RoleGate allowedRoles="superadmin">
        <div>Superadmin Content</div>
      </RoleGate>
    );

    expect(screen.getByText('Superadmin Content')).toBeInTheDocument();
  });
});
