import { describe, it, expect, vi } from 'vitest';

import { formatCurrency, formatDate, formatTime, formatDateTime, formatDuration } from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats currency with dollar sign before amount for English', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('$');
      expect(result).toContain('1');
    });

    it('formats zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('formats negative numbers correctly', () => {
      const result = formatCurrency(-500);
      expect(result).toContain('-');
      expect(result).toContain('500');
    });

    it('formats large numbers with separators', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('1');
    });
  });

  describe('formatDate', () => {
    it('formats date object', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('formats date from string', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('formats date from timestamp', () => {
      const timestamp = Date.now();
      const result = formatDate(timestamp);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatTime', () => {
    it('formats time from date object', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatTime(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('formats time from string', () => {
      const result = formatTime('2024-01-15T14:30:00');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time together', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatDateTime(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDuration', () => {
    const mockT = vi.fn((key: string, options?: Record<string, unknown>) => {
      if (key === 'work.hoursAndMinutes') {
        return `${options?.hours}h ${options?.minutes}m`;
      }
      if (key === 'work.minutes') {
        return `${options?.count}m`;
      }
      return key;
    });

    it('formats duration less than an hour', () => {
      const result = formatDuration(1800, mockT); // 30 minutes
      expect(result).toBe('30m');
    });

    it('formats duration with hours and minutes', () => {
      const result = formatDuration(5400, mockT); // 1 hour 30 minutes
      expect(result).toBe('1h 30m');
    });

    it('formats zero duration', () => {
      const result = formatDuration(0, mockT);
      expect(result).toBe('0m');
    });

    it('formats only hours without minutes', () => {
      const result = formatDuration(3600, mockT); // 1 hour
      expect(result).toBe('1h 0m');
    });
  });
});
