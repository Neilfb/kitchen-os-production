import { renderHook, act } from '@testing-library/react';
import { useFirebaseAuth, FirebaseAuthProvider, UserRole } from '@/contexts/FirebaseAuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';

// Mock Firebase modules
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase/config', () => ({
  auth: {},
}));
jest.mock('@/lib/firebase/firestore', () => ({
  db: {},
}));

const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

describe('FirebaseAuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial loading state', () => {
    // Mock auth state listener that doesn't call callback immediately
    mockOnAuthStateChanged.mockImplementation(() => jest.fn());

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
    );

    const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it('handles user authentication with role from Firestore', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    };

    const mockUserDoc = {
      exists: () => true,
      data: () => ({
        role: 'admin',
        displayName: 'Test User',
      }),
    };

    mockGetDoc.mockResolvedValue(mockUserDoc as any);

    // Mock auth state change to authenticated user
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Simulate async auth state change
      setTimeout(() => callback(mockUser as any), 0);
      return jest.fn(); // unsubscribe function
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
    );

    const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

    // Wait for auth state to update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual({
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      role: 'admin',
      getIdToken: expect.any(Function),
    });
  });

  it('handles user with no Firestore profile (uses default role)', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    };

    const mockUserDoc = {
      exists: () => false,
    };

    mockGetDoc.mockResolvedValue(mockUserDoc as any);

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      setTimeout(() => callback(mockUser as any), 0);
      return jest.fn();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
    );

    const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.user?.role).toBe('manager'); // Default role
  });

  it('maps legacy roles correctly', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    };

    const mockUserDoc = {
      exists: () => true,
      data: () => ({
        role: 'restaurant_admin', // Legacy role
        displayName: 'Test User',
      }),
    };

    mockGetDoc.mockResolvedValue(mockUserDoc as any);

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      setTimeout(() => callback(mockUser as any), 0);
      return jest.fn();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
    );

    const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.user?.role).toBe('admin'); // Mapped from restaurant_admin
  });

  it('hasRole function works correctly', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    };

    const mockUserDoc = {
      exists: () => true,
      data: () => ({
        role: 'admin',
        displayName: 'Test User',
      }),
    };

    mockGetDoc.mockResolvedValue(mockUserDoc as any);

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      setTimeout(() => callback(mockUser as any), 0);
      return jest.fn();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
    );

    const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Test single role
    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('manager')).toBe(false);
    expect(result.current.hasRole('superadmin')).toBe(false);

    // Test multiple roles
    expect(result.current.hasRole(['admin', 'manager'])).toBe(true);
    expect(result.current.hasRole(['manager', 'superadmin'])).toBe(false);
  });

  it('handles user logout', async () => {
    // First set up authenticated user
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      getIdToken: jest.fn().mockResolvedValue('mock-token'),
    };

    let authCallback: ((user: any) => void) | null = null;

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback;
      setTimeout(() => callback(mockUser as any), 0);
      return jest.fn();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
    );

    const { result } = renderHook(() => useFirebaseAuth(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.user).toBeTruthy();

    // Simulate logout
    await act(async () => {
      if (authCallback) {
        authCallback(null);
      }
    });

    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
  });
});
