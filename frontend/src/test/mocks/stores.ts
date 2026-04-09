import { vi } from 'vitest';

// Mock for authStore
export const mockAuthStore = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
  setUser: vi.fn(),
};

// Mock for workStore
export const mockWorkStore = {
  isWorking: false,
  isPaused: false,
  timeRemaining: 180,
  showStatsModal: false,
  lastCompletedSession: null,
  stats: {
    sessions_count: 0,
    total_earned: 0,
    total_work_time: 0,
  },
  startWork: vi.fn(),
  pauseWork: vi.fn(),
  resumeWork: vi.fn(),
  cancelWork: vi.fn(),
  tick: vi.fn(),
  closeStatsModal: vi.fn(),
};

// Mock for shopStore
export const mockShopStore = {
  items: [],
  userItems: [],
  loading: false,
  error: null,
  fetchItems: vi.fn(),
  fetchUserItems: vi.fn(),
  buyItem: vi.fn(),
  sellItem: vi.fn(),
  equipItem: vi.fn(),
};

// Mock for soundStore
export const mockSoundStore = {
  isMuted: false,
  volume: 0.5,
  toggleMute: vi.fn(),
  setVolume: vi.fn(),
};
