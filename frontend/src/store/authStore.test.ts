import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import api from '../services/api';
import type { User, AuthResponse } from '../types';

// Mock API module
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Clear all mocks
    vi.clearAllMocks();

    // Reset window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: '',
        search: '',
      },
      writable: true,
      configurable: true,
    });
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: '',
        balance: 1000,
      };

      const { setUser } = useAuthStore.getState();
      setUser(mockUser);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should clear authentication when user is null', () => {
      // First set a user
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: '',
        balance: 1000,
      };

      useAuthStore.getState().setUser(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Then clear it
      useAuthStore.getState().setUser(null);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      const store = useAuthStore.getState();

      store.setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      store.setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('should save tokens and set user', () => {
      const authData: AuthResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          avatar: '',
          balance: 1000,
        },
        access_token: 'access_token_123',
        refresh_token: 'refresh_token_123',
      };

      useAuthStore.getState().login(authData);

      // Check localStorage
      expect(localStorage.getItem('access_token')).toBe('access_token_123');
      expect(localStorage.getItem('refresh_token')).toBe('refresh_token_123');

      // Check state
      const state = useAuthStore.getState();
      expect(state.user).toEqual(authData.user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should call logout API and clear state', async () => {
      // Setup initial authenticated state
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: '',
        balance: 1000,
      };

      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh');
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
      });

      // Mock API response
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      // Mock location.href setter to prevent actual navigation
      const hrefSpy = vi.fn();
      Object.defineProperty(window.location, 'href', {
        set: hrefSpy,
        configurable: true,
      });

      // Call logout
      await useAuthStore.getState().logout();

      // Check API was called
      expect(api.post).toHaveBeenCalledWith('/auth/logout');

      // Check tokens cleared
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();

      // Check state cleared
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);

      // Check redirect
      expect(hrefSpy).toHaveBeenCalledWith('/login');
    });

    it('should clear state even if API call fails', async () => {
      localStorage.setItem('access_token', 'token');

      // Mock API to reject
      vi.mocked(api.post).mockRejectedValueOnce(new Error('API error'));

      const hrefSpy = vi.fn();
      Object.defineProperty(window.location, 'href', {
        set: hrefSpy,
        configurable: true,
      });

      await useAuthStore.getState().logout();

      // Should still clear tokens and state
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(hrefSpy).toHaveBeenCalledWith('/login');
    });
  });

  describe('checkAuth', () => {
    it('should authenticate in dev mode with user_id parameter', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: '',
        balance: 1000,
      };

      // Set URL with user_id
      Object.defineProperty(window.location, 'search', {
        value: '?user_id=1',
        writable: true,
        configurable: true,
      });

      // Mock API response
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { user: mockUser },
      });

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should return early if no token exists', async () => {
      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(api.get).not.toHaveBeenCalled();
    });

    it('should fetch user data when token exists', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: '',
        balance: 1000,
      };

      localStorage.setItem('access_token', 'valid_token');

      vi.mocked(api.get).mockResolvedValueOnce({
        data: { user: mockUser },
      });

      await useAuthStore.getState().checkAuth();

      expect(api.get).toHaveBeenCalledWith('/auth/me');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should try to refresh token on auth check failure', async () => {
      localStorage.setItem('access_token', 'expired_token');
      localStorage.setItem('refresh_token', 'refresh_token');

      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: '',
        balance: 1000,
      };

      // First call fails (auth check)
      // Second call succeeds (refresh token)
      // Third call succeeds (get user after refresh)
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'));
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { access_token: 'new_access_token' },
      });
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { user: mockUser },
      });

      await useAuthStore.getState().checkAuth();

      // Should have called refreshToken
      expect(api.post).toHaveBeenCalledWith('/auth/refresh', {
        refresh_token: 'refresh_token',
      });
    });
  });

  describe('refreshToken', () => {
    it('should return false if no refresh token exists', async () => {
      const result = await useAuthStore.getState().refreshToken();
      expect(result).toBe(false);
    });

    it('should refresh token and update state', async () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: '',
        balance: 1000,
      };

      localStorage.setItem('refresh_token', 'refresh_token');

      vi.mocked(api.post).mockResolvedValueOnce({
        data: { access_token: 'new_access_token' },
      });

      vi.mocked(api.get).mockResolvedValueOnce({
        data: { user: mockUser },
      });

      const result = await useAuthStore.getState().refreshToken();

      expect(result).toBe(true);
      expect(localStorage.getItem('access_token')).toBe('new_access_token');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should return false if refresh fails', async () => {
      localStorage.setItem('refresh_token', 'invalid_refresh_token');

      vi.mocked(api.post).mockRejectedValueOnce(new Error('Invalid refresh token'));

      const result = await useAuthStore.getState().refreshToken();

      expect(result).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should persist user and isAuthenticated to localStorage', () => {
      const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: '',
        balance: 1000,
      };

      useAuthStore.getState().setUser(mockUser);

      // Give time for persistence middleware to write
      // Check localStorage has the persisted data
      const stored = localStorage.getItem('auth-storage');
      expect(stored).toBeTruthy();

      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.user).toEqual(mockUser);
        expect(parsed.state.isAuthenticated).toBe(true);
      }
    });
  });
});
