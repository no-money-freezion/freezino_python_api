import { create } from 'zustand';

import api from '../services/api';

export interface Loan {
  id: number;
  user_id: number;
  type: 'friends' | 'bank' | 'microcredit';
  principal_amount: number;
  remaining_amount: number;
  interest_rate: number;
  interest_per_second: number;
  collateral_item_id?: number;
  last_interest_at: string;
  created_at: string;
  updated_at: string;
  collateral_item?: {
    id: number;
    item: {
      id: number;
      name: string;
      type: string;
      price: number;
      image_url: string;
    };
  };
}

export interface LoanSummary {
  total_debt: number;
  interest_per_second: number;
  friends_loan_count: number;
  total_friends_loaned: number;
  active_loans: number;
}

interface TakeLoanRequest {
  amount: number;
  type: 'friends' | 'bank' | 'microcredit';
  collateral_item_id?: number;
}

interface TakeLoanResponse {
  loan: Loan;
  new_balance: number;
  message: string;
}

interface LoanState {
  loans: Loan[];
  summary: LoanSummary | null;
  isLoading: boolean;
  error: string | null;
  isBankrupt: boolean;
  showBankruptcyPopup: boolean;

  // Actions
  fetchLoans: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  takeLoan: (request: TakeLoanRequest) => Promise<TakeLoanResponse>;
  repayLoan: (loanId: number, amount: number) => Promise<void>;
  checkBankruptcy: () => Promise<boolean>;
  setShowBankruptcyPopup: (show: boolean) => void;
  clearError: () => void;
}

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: [],
  summary: null,
  isLoading: false,
  error: null,
  isBankrupt: false,
  showBankruptcyPopup: false,

  fetchLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ success: boolean; data: { loans: Loan[]; count: number } }>('/loans');
      set({ loans: response.data.data.loans, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch loans',
        isLoading: false
      });
    }
  },

  fetchSummary: async () => {
    try {
      const response = await api.get<{ success: boolean; data: LoanSummary }>('/loans/summary');
      set({ summary: response.data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch loan summary' });
    }
  },

  takeLoan: async (request: TakeLoanRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<{ success: boolean; data: TakeLoanResponse }>('/loans/take', request);

      // Refresh loans and summary
      await get().fetchLoans();
      await get().fetchSummary();

      set({ isLoading: false });
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to take loan';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  repayLoan: async (loanId: number, amount: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/loans/repay/${loanId}`, { amount });

      // Refresh loans and summary
      await get().fetchLoans();
      await get().fetchSummary();

      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to repay loan';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  checkBankruptcy: async () => {
    try {
      const response = await api.get<{ success: boolean; is_bankrupt: boolean }>('/loans/bankruptcy-check');
      const isBankrupt = response.data.is_bankrupt;

      if (isBankrupt) {
        set({ isBankrupt: true, showBankruptcyPopup: true });

        // Refresh data after bankruptcy
        await get().fetchLoans();
        await get().fetchSummary();
      }

      return isBankrupt;
    } catch (error: any) {
      console.error('Failed to check bankruptcy:', error);
      return false;
    }
  },

  setShowBankruptcyPopup: (show: boolean) => {
    set({ showBankruptcyPopup: show, isBankrupt: show ? get().isBankrupt : false });
  },

  clearError: () => {
    set({ error: null });
  },
}));
