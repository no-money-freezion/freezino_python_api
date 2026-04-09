import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useWorkStore } from './workStore';
import api from '../services/api';
import type { WorkSession } from '../types';

// Mock API module
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('workStore', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset store to initial state
    useWorkStore.setState({
      isWorking: false,
      isPaused: false,
      timeRemaining: 180,
      startTime: null,
      pausedTime: 0,
      workSessions: [],
      stats: {
        total_work_time: 0,
        total_earned: 0,
        sessions_count: 0,
      },
      showStatsModal: false,
      lastCompletedSession: null,
      selectedJobType: 'office',
    });

    // Clear mocks
    vi.clearAllMocks();

    // Mock Date.now
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useWorkStore.getState();

      expect(state.isWorking).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.timeRemaining).toBe(180);
      expect(state.startTime).toBeNull();
      expect(state.pausedTime).toBe(0);
      expect(state.workSessions).toEqual([]);
      expect(state.stats.total_work_time).toBe(0);
      expect(state.stats.total_earned).toBe(0);
      expect(state.stats.sessions_count).toBe(0);
      expect(state.showStatsModal).toBe(false);
      expect(state.lastCompletedSession).toBeNull();
      expect(state.selectedJobType).toBe('office');
    });
  });

  describe('startWork', () => {
    it('should call API and start work session', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      const now = Date.now();
      vi.setSystemTime(now);

      await useWorkStore.getState().startWork('office');

      expect(api.post).toHaveBeenCalledWith('/work/start', { job_type: 'office' });

      const state = useWorkStore.getState();
      expect(state.isWorking).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.timeRemaining).toBe(180);
      expect(state.startTime).toBe(now);
      expect(state.pausedTime).toBe(0);
      expect(state.selectedJobType).toBe('office');
    });

    it('should start work with default job type', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      await useWorkStore.getState().startWork();

      expect(api.post).toHaveBeenCalledWith('/work/start', { job_type: 'office' });
    });

    it('should start work with custom job type', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      await useWorkStore.getState().startWork('courier');

      expect(api.post).toHaveBeenCalledWith('/work/start', { job_type: 'courier' });

      const state = useWorkStore.getState();
      expect(state.selectedJobType).toBe('courier');
    });

    it('should throw error if API call fails', async () => {
      const apiError = new Error('Failed to start work');
      vi.mocked(api.post).mockRejectedValueOnce(apiError);

      await expect(useWorkStore.getState().startWork()).rejects.toThrow('Failed to start work');

      // State should not change on error
      const state = useWorkStore.getState();
      expect(state.isWorking).toBe(false);
    });
  });

  describe('setSelectedJobType', () => {
    it('should update selected job type', () => {
      useWorkStore.getState().setSelectedJobType('courier');
      expect(useWorkStore.getState().selectedJobType).toBe('courier');

      useWorkStore.getState().setSelectedJobType('streamer');
      expect(useWorkStore.getState().selectedJobType).toBe('streamer');
    });
  });

  describe('pauseWork', () => {
    it('should set isPaused to true', () => {
      useWorkStore.getState().pauseWork();
      expect(useWorkStore.getState().isPaused).toBe(true);
    });
  });

  describe('resumeWork', () => {
    it('should set isPaused to false', () => {
      useWorkStore.setState({ isPaused: true });
      useWorkStore.getState().resumeWork();
      expect(useWorkStore.getState().isPaused).toBe(false);
    });
  });

  describe('completeWork', () => {
    it('should call API and update state with completed session', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user_id: 1,
            earned: 100,
            new_balance: 1100,
            duration_seconds: 180,
            completed_at: '2025-01-15T10:00:00Z',
            transaction_id: 1,
            work_session_id: 1,
          },
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      // Set up initial working state
      useWorkStore.setState({
        isWorking: true,
        timeRemaining: 0,
        stats: {
          total_work_time: 300,
          total_earned: 200,
          sessions_count: 2,
        },
      });

      await useWorkStore.getState().completeWork();

      expect(api.post).toHaveBeenCalledWith('/work/complete');

      const state = useWorkStore.getState();
      expect(state.isWorking).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.timeRemaining).toBe(180); // Reset to default
      expect(state.startTime).toBeNull();
      expect(state.pausedTime).toBe(0);
      expect(state.showStatsModal).toBe(true);
      expect(state.workSessions).toHaveLength(1);
      expect(state.stats.total_work_time).toBe(480); // 300 + 180
      expect(state.stats.total_earned).toBe(300); // 200 + 100
      expect(state.stats.sessions_count).toBe(3); // 2 + 1
      expect(state.lastCompletedSession).toEqual({
        id: '1',
        user_id: '1',
        duration_seconds: 180,
        earned: 100,
        completed_at: '2025-01-15T10:00:00Z',
      });
    });

    it('should reset state on API error', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('API error'));

      useWorkStore.setState({
        isWorking: true,
        timeRemaining: 10,
      });

      await useWorkStore.getState().completeWork();

      const state = useWorkStore.getState();
      expect(state.isWorking).toBe(false);
      expect(state.timeRemaining).toBe(180); // Reset to default
      expect(state.startTime).toBeNull();
      // Stats should NOT be updated on error
      expect(state.stats.sessions_count).toBe(0);
    });

    it('should prepend new session to workSessions array', async () => {
      const existingSession: WorkSession = {
        id: '99',
        user_id: '1',
        duration_seconds: 180,
        earned: 50,
        completed_at: '2025-01-15T09:00:00Z',
      };

      useWorkStore.setState({
        isWorking: true,
        workSessions: [existingSession],
      });

      const mockResponse = {
        data: {
          success: true,
          data: {
            user_id: 1,
            earned: 100,
            new_balance: 1100,
            duration_seconds: 180,
            completed_at: '2025-01-15T10:00:00Z',
            transaction_id: 1,
            work_session_id: 1,
          },
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      await useWorkStore.getState().completeWork();

      const state = useWorkStore.getState();
      expect(state.workSessions).toHaveLength(2);
      expect(state.workSessions[0].id).toBe('1'); // New session first
      expect(state.workSessions[1].id).toBe('99'); // Old session second
    });
  });

  describe('cancelWork', () => {
    it('should call API and reset state', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      useWorkStore.setState({
        isWorking: true,
        timeRemaining: 100,
        startTime: Date.now(),
        pausedTime: 10,
      });

      await useWorkStore.getState().cancelWork();

      expect(api.post).toHaveBeenCalledWith('/work/cancel');

      const state = useWorkStore.getState();
      expect(state.isWorking).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.timeRemaining).toBe(180); // Reset to default
      expect(state.startTime).toBeNull();
      expect(state.pausedTime).toBe(0);
    });

    it('should reset state even if API call fails', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('API error'));

      useWorkStore.setState({
        isWorking: true,
        timeRemaining: 100,
      });

      await useWorkStore.getState().cancelWork();

      const state = useWorkStore.getState();
      expect(state.isWorking).toBe(false);
      expect(state.timeRemaining).toBe(180); // Should still reset
    });
  });

  describe('tick', () => {
    it('should decrement timeRemaining when working', () => {
      useWorkStore.setState({
        isWorking: true,
        isPaused: false,
        timeRemaining: 100,
      });

      useWorkStore.getState().tick();

      expect(useWorkStore.getState().timeRemaining).toBe(99);
    });

    it('should not decrement when paused', () => {
      useWorkStore.setState({
        isWorking: true,
        isPaused: true,
        timeRemaining: 100,
      });

      useWorkStore.getState().tick();

      expect(useWorkStore.getState().timeRemaining).toBe(100); // Unchanged
    });

    it('should not decrement when not working', () => {
      useWorkStore.setState({
        isWorking: false,
        isPaused: false,
        timeRemaining: 100,
      });

      useWorkStore.getState().tick();

      expect(useWorkStore.getState().timeRemaining).toBe(100); // Unchanged
    });

    it('should call completeWork when timeRemaining reaches 0', () => {
      const completeWorkSpy = vi.spyOn(useWorkStore.getState(), 'completeWork');

      useWorkStore.setState({
        isWorking: true,
        isPaused: false,
        timeRemaining: 1,
      });

      useWorkStore.getState().tick();

      expect(completeWorkSpy).toHaveBeenCalled();
    });

    it('should not call completeWork when timeRemaining is above 0', () => {
      const completeWorkSpy = vi.spyOn(useWorkStore.getState(), 'completeWork');

      useWorkStore.setState({
        isWorking: true,
        isPaused: false,
        timeRemaining: 10,
      });

      useWorkStore.getState().tick();

      expect(completeWorkSpy).not.toHaveBeenCalled();
    });
  });

  describe('closeStatsModal', () => {
    it('should set showStatsModal to false', () => {
      useWorkStore.setState({ showStatsModal: true });
      useWorkStore.getState().closeStatsModal();
      expect(useWorkStore.getState().showStatsModal).toBe(false);
    });
  });

  describe('loadStats', () => {
    it('should exist as a function', async () => {
      // Currently this function doesn't do much in the implementation
      await expect(useWorkStore.getState().loadStats()).resolves.toBeUndefined();
    });
  });

  describe('persistence', () => {
    it('should persist workSessions and stats to localStorage', () => {
      const mockSession: WorkSession = {
        id: '1',
        user_id: '1',
        duration_seconds: 180,
        earned: 100,
        completed_at: '2025-01-15T10:00:00Z',
      };

      useWorkStore.setState({
        workSessions: [mockSession],
        stats: {
          total_work_time: 180,
          total_earned: 100,
          sessions_count: 1,
        },
      });

      // Check localStorage has the persisted data
      const stored = localStorage.getItem('work-storage');
      expect(stored).toBeTruthy();

      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.workSessions).toEqual([mockSession]);
        expect(parsed.state.stats).toEqual({
          total_work_time: 180,
          total_earned: 100,
          sessions_count: 1,
        });
      }
    });

    it('should not persist isWorking state', () => {
      useWorkStore.setState({
        isWorking: true,
        timeRemaining: 100,
      });

      const stored = localStorage.getItem('work-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        // isWorking should not be in persisted state
        expect(parsed.state.isWorking).toBeUndefined();
        expect(parsed.state.timeRemaining).toBeUndefined();
      }
    });
  });

  describe('integration: complete work flow', () => {
    it('should handle complete work session from start to finish', async () => {
      // Start work
      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });
      await useWorkStore.getState().startWork('bottle_collector');

      let state = useWorkStore.getState();
      expect(state.isWorking).toBe(true);
      expect(state.selectedJobType).toBe('bottle_collector');

      // Simulate some ticks
      for (let i = 0; i < 5; i++) {
        useWorkStore.getState().tick();
      }

      state = useWorkStore.getState();
      expect(state.timeRemaining).toBe(175); // 180 - 5

      // Pause
      useWorkStore.getState().pauseWork();
      expect(useWorkStore.getState().isPaused).toBe(true);

      // Tick should not decrement when paused
      useWorkStore.getState().tick();
      expect(useWorkStore.getState().timeRemaining).toBe(175);

      // Resume
      useWorkStore.getState().resumeWork();
      expect(useWorkStore.getState().isPaused).toBe(false);

      // Complete work
      const mockCompleteResponse = {
        data: {
          success: true,
          data: {
            user_id: 1,
            earned: 100,
            new_balance: 1100,
            duration_seconds: 180,
            completed_at: '2025-01-15T10:00:00Z',
            transaction_id: 1,
            work_session_id: 1,
          },
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockCompleteResponse);
      await useWorkStore.getState().completeWork();

      state = useWorkStore.getState();
      expect(state.isWorking).toBe(false);
      expect(state.showStatsModal).toBe(true);
      expect(state.workSessions).toHaveLength(1);
      expect(state.stats.sessions_count).toBe(1);
      expect(state.stats.total_earned).toBe(100);
    });
  });
});
