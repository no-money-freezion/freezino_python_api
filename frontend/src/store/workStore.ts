import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import api from '../services/api';
import type { WorkSession } from '../types';

const WORK_DURATION_SECONDS = 180; // 3 minutes

interface WorkStats {
  total_work_time: number; // in seconds
  total_earned: number;
  sessions_count: number;
  last_session?: string;
}

interface WorkState {
  isWorking: boolean;
  isPaused: boolean;
  timeRemaining: number; // in seconds
  startTime: number | null;
  pausedTime: number;
  workSessions: WorkSession[];
  stats: WorkStats;
  showStatsModal: boolean;
  lastCompletedSession: WorkSession | null;
  selectedJobType: string;

  // Actions
  startWork: (jobType?: string) => Promise<void>;
  pauseWork: () => void;
  resumeWork: () => void;
  completeWork: () => Promise<void>;
  cancelWork: () => Promise<void>;
  tick: () => void;
  closeStatsModal: () => void;
  loadStats: () => Promise<void>;
  setSelectedJobType: (jobType: string) => void;
}

export const useWorkStore = create<WorkState>()(
  persist(
    (set, get) => ({
      isWorking: false,
      isPaused: false,
      timeRemaining: WORK_DURATION_SECONDS,
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

      startWork: async (jobType = 'office') => {
        try {
          // Call API to start work session with job type
          await api.post('/work/start', { job_type: jobType });

          const now = Date.now();
          set({
            isWorking: true,
            isPaused: false,
            timeRemaining: WORK_DURATION_SECONDS,
            startTime: now,
            pausedTime: 0,
            selectedJobType: jobType,
          });
        } catch (error) {
          console.error('Failed to start work:', error);
          // Re-throw error to handle in component
          throw error;
        }
      },

      setSelectedJobType: (jobType) => {
        set({ selectedJobType: jobType });
      },

      pauseWork: () => {
        set({ isPaused: true });
      },

      resumeWork: () => {
        set({ isPaused: false });
      },

      completeWork: async () => {
        const state = get();

        try {
          // Call API to complete work session
          const response = await api.post<{ success: boolean; data: {
            user_id: number;
            earned: number;
            new_balance: number;
            duration_seconds: number;
            completed_at: string;
            transaction_id: number;
            work_session_id: number;
          } }>('/work/complete');

          const { data } = response.data;

          const completedSession: WorkSession = {
            id: String(data.work_session_id),
            user_id: String(data.user_id),
            duration_seconds: data.duration_seconds,
            earned: data.earned,
            completed_at: data.completed_at,
          };

          set({
            isWorking: false,
            isPaused: false,
            timeRemaining: WORK_DURATION_SECONDS,
            startTime: null,
            pausedTime: 0,
            workSessions: [completedSession, ...state.workSessions],
            stats: {
              total_work_time: state.stats.total_work_time + data.duration_seconds,
              total_earned: state.stats.total_earned + data.earned,
              sessions_count: state.stats.sessions_count + 1,
              last_session: completedSession.completed_at,
            },
            showStatsModal: true,
            lastCompletedSession: completedSession,
          });
        } catch (error) {
          console.error('Failed to complete work:', error);
          // On error, still reset the timer but don't update stats
          set({
            isWorking: false,
            isPaused: false,
            timeRemaining: WORK_DURATION_SECONDS,
            startTime: null,
            pausedTime: 0,
          });
        }
      },

      cancelWork: async () => {
        try {
          // Call API to cancel work session on server
          await api.post('/work/cancel');
        } catch (error) {
          console.error('Failed to cancel work on server:', error);
          // Continue with local cleanup even if API call fails
        }

        // Reset local state
        set({
          isWorking: false,
          isPaused: false,
          timeRemaining: WORK_DURATION_SECONDS,
          startTime: null,
          pausedTime: 0,
        });
      },

      tick: () => {
        const state = get();

        if (!state.isWorking || state.isPaused) return;

        const newTimeRemaining = state.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          void get().completeWork();
        } else {
          set({ timeRemaining: newTimeRemaining });
        }
      },

      closeStatsModal: () => {
        set({ showStatsModal: false });
      },

      loadStats: async () => {
        // In production, this would be an API call
        // const response = await api.get('/work/stats');
        // set({ stats: response.data });

        // For now, stats are persisted locally
        console.error('Stats loaded from local storage');
      },
    }),
    {
      name: 'work-storage',
      partialize: (state) => ({
        workSessions: state.workSessions,
        stats: state.stats,
      }),
    }
  )
);
