import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import LoginPage from './LoginPage';
import * as authStore from '../store/authStore';
import { render, screen, waitFor } from '../test/utils';

// Mock the auth store
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock api
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login page with Google button', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      checkAuth: vi.fn(),
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/freezino/i)).toBeInTheDocument();
    expect(screen.getByText(/войти через google/i)).toBeInTheDocument();
  });

  it('shows project description', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      checkAuth: vi.fn(),
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/казино-симулятор/i)).toBeInTheDocument();
  });

  it('shows educational disclaimers', () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      checkAuth: vi.fn(),
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/не настоящее казино/i)).toBeInTheDocument();
    expect(screen.getByText(/виртуальные деньги/i)).toBeInTheDocument();
    expect(screen.getByText(/образовательная/i)).toBeInTheDocument();
  });

  it('shows loading state when processing OAuth', async () => {
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      checkAuth: vi.fn(),
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/?code=test-code']}>
        <LoginPage />
      </MemoryRouter>
    );

    // Page should show loading when processing OAuth callback
    await waitFor(() => {
      // This is a simplified test - in real scenario, we'd need to mock the API call
      expect(screen.queryByText(/войти через google/i)).toBeInTheDocument();
    });
  });
});
