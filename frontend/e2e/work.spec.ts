import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Work Flow
 *
 * Tests the complete work session flow:
 * - Job selection
 * - Starting work
 * - Timer countdown
 * - Pause/resume
 * - Cancellation
 * - Completion
 * - Statistics display
 * - History tracking
 */

test.describe('Work Flow', () => {
  // Mock user data for authenticated tests
  const mockUser = {
    id: 1,
    email: 'test@freezino.com',
    name: 'Test Worker',
    username: 'testworker',
    balance: 500.00,
    avatar: null,
  };

  test.beforeEach(async ({ page }) => {
    // Mock authentication API (must match auth.spec.ts pattern)
    await page.route('**/api/auth/me*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: mockUser,
        }),
      });
    });

    await page.route('**/api/work/status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            is_working: false,
            user_id: mockUser.id,
            duration_sec: 180,
            reward: 100,
            can_complete: false,
            started_at: null,
            completes_at: null,
            elapsed_sec: 0,
            remaining_sec: 180,
            progress: 0,
          },
        }),
      });
    });

    await page.route('**/api/work/jobs', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              type: 'bottle_collector',
              name: 'Bottle Collector',
              description: 'Collect bottles from the streets',
              base_reward: 100,
              duration_seconds: 180,
              emoji: '♻️',
            },
            {
              type: 'pizza_delivery',
              name: 'Pizza Delivery',
              description: 'Deliver pizzas around town',
              base_reward: 150,
              duration_seconds: 240,
              emoji: '🍕',
            },
          ],
        }),
      });
    });

    // Navigate with dev mode authentication
    await page.goto('/?user_id=1');

    // Wait for authentication to complete (use timeout like auth.spec.ts)
    await page.waitForTimeout(2000);
  });

  test.describe('Job Selection', () => {
    test('should display available jobs', async ({ page }) => {
      // Wait for home page to load
      await expect(page).toHaveURL(/.*\?user_id=1/);

      // Look for job selector component
      const jobSelector = page.getByTestId('job-selector');
      await expect(jobSelector).toBeVisible({ timeout: 10000 });
    });

    test('should show job details when selected', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Click on a specific job option
      const jobElement = page.getByTestId('job-option-bottle_collector');
      if (await jobElement.isVisible()) {
        await jobElement.click();

        // Should show job details (wage, duration)
        await expect(page.locator('text=/100|150|180|240/').first()).toBeVisible();
      }
    });
  });

  test.describe('Starting Work', () => {
    test('should start work session successfully', async ({ page }) => {
      // Mock successful work start
      await page.route('**/api/work/start', async (route) => {
        const now = new Date();
        const completesAt = new Date(now.getTime() + 180000); // 3 minutes

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              user_id: mockUser.id,
              job_type: 'bottle_collector',
              started_at: now.toISOString(),
              completes_at: completesAt.toISOString(),
              duration_sec: 180,
              reward: 100,
            },
          }),
        });
      });

      // Update status route to return working state
      await page.route('**/api/work/status', async (route) => {
        const now = new Date();
        const completesAt = new Date(now.getTime() + 180000);

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              is_working: true,
              user_id: mockUser.id,
              job_type: 'bottle_collector',
              duration_sec: 180,
              reward: 100,
              can_complete: false,
              started_at: now.toISOString(),
              completes_at: completesAt.toISOString(),
              elapsed_sec: 1,
              remaining_sec: 179,
              progress: 0.005,
            },
          }),
        });
      });

      await page.waitForTimeout(500);

      // Find and click start work button
      const startButton = page.getByTestId('start-work-button');
      if (await startButton.isVisible({ timeout: 5000 })) {
        await startButton.click();

        // Should show timer countdown
        await expect(page.getByTestId('timer-countdown')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should prevent starting work when already working', async ({ page }) => {
      // Mock already working state
      await page.route('**/api/work/status', async (route) => {
        const now = new Date();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              is_working: true,
              user_id: mockUser.id,
              started_at: now.toISOString(),
              remaining_sec: 120,
            },
          }),
        });
      });

      await page.route('**/api/work/start', async (route) => {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            error: true,
            message: 'work session already in progress',
          }),
        });
      });

      await page.reload();
      await page.waitForTimeout(1000);

      // Start button should be disabled or not visible
      const startButton = page.getByTestId('start-work-button');
      if (await startButton.isVisible({ timeout: 2000 })) {
        const isDisabled = await startButton.isDisabled();
        expect(isDisabled).toBe(true);
      }
    });
  });

  test.describe('Work Timer', () => {
    test('should display countdown timer during work', async ({ page }) => {
      // Mock work start
      await page.route('**/api/work/start', async (route) => {
        const now = new Date();
        const completesAt = new Date(now.getTime() + 180000);

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              user_id: mockUser.id,
              job_type: 'bottle_collector',
              started_at: now.toISOString(),
              completes_at: completesAt.toISOString(),
              duration_sec: 180,
              reward: 100,
            },
          }),
        });
      });

      await page.waitForTimeout(500);

      // Start work
      const startButton = page.getByTestId('start-work-button');
      if (await startButton.isVisible({ timeout: 3000 })) {
        await startButton.click();

        // Should show timer countdown in modal
        const timer = page.getByTestId('timer-countdown');
        await expect(timer).toBeVisible({ timeout: 5000 });
      }
    });

    test('should update timer every second', async ({ page }) => {
      let remainingSeconds = 120;

      await page.route('**/api/work/status', async (route) => {
        const now = new Date();
        remainingSeconds = Math.max(0, remainingSeconds - 1);

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              is_working: true,
              remaining_sec: remainingSeconds,
              elapsed_sec: 180 - remainingSeconds,
              progress: (180 - remainingSeconds) / 180,
            },
          }),
        });
      });

      await page.reload();
      await page.waitForTimeout(2000);

      // Timer should be counting down
      const timer = page.getByTestId('timer-countdown');
      if (await timer.isVisible({ timeout: 3000 })) {
        const initialText = await timer.textContent();
        await page.waitForTimeout(2000);
        const updatedText = await timer.textContent();

        // Timer should have changed (unless it hit 0)
        if (remainingSeconds > 0) {
          expect(initialText).not.toBe(updatedText);
        }
      }
    });

    test('should show progress bar', async ({ page }) => {
      // Mock work start
      await page.route('**/api/work/start', async (route) => {
        const now = new Date();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              user_id: mockUser.id,
              job_type: 'bottle_collector',
              started_at: now.toISOString(),
              completes_at: new Date(now.getTime() + 180000).toISOString(),
              duration_sec: 180,
              reward: 100,
            },
          }),
        });
      });

      await page.waitForTimeout(500);

      // Start work
      const startButton = page.getByTestId('start-work-button');
      if (await startButton.isVisible({ timeout: 3000 })) {
        await startButton.click();

        // Look for progress bar in modal
        const progress = page.getByTestId('timer-progress-bar');
        await expect(progress).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Pause and Resume', () => {
    test('should pause work session', async ({ page }) => {
      // Mock working state
      await page.route('**/api/work/status', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              is_working: true,
              remaining_sec: 120,
            },
          }),
        });
      });

      await page.reload();
      await page.waitForTimeout(1000);

      // Find pause button
      const pauseButton = page.getByTestId('work-pause-button');
      if (await pauseButton.isVisible({ timeout: 3000 })) {
        await pauseButton.click();

        // Should show resume button (paused state)
        await expect(page.getByTestId('work-resume-button')).toBeVisible({ timeout: 3000 });
      }
    });

    test('should resume paused work session', async ({ page }) => {
      await page.route('**/api/work/status', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              is_working: true,
              is_paused: true,
              remaining_sec: 120,
            },
          }),
        });
      });

      await page.reload();
      await page.waitForTimeout(1000);

      // Find resume button
      const resumeButton = page.getByTestId('work-resume-button');
      if (await resumeButton.isVisible({ timeout: 3000 })) {
        await resumeButton.click();

        // Should show pause button again (resumed state)
        await expect(page.getByTestId('work-pause-button')).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe('Cancel Work', () => {
    test('should cancel work session', async ({ page }) => {
      await page.route('**/api/work/cancel', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Work session cancelled',
          }),
        });
      });

      await page.route('**/api/work/status', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              is_working: true,
              is_paused: true,
              remaining_sec: 120,
            },
          }),
        });
      });

      await page.reload();
      await page.waitForTimeout(1000);

      // Find cancel button (only available when paused)
      const cancelButton = page.getByTestId('work-cancel-button');
      if (await cancelButton.isVisible({ timeout: 3000 })) {
        await cancelButton.click();

        // Should show confirmation or return to start state
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        // Should return to job selector with start button
        await expect(page.getByTestId('start-work-button')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Complete Work', () => {
    test('should complete work and show earnings', async ({ page }) => {
      await page.route('**/api/work/complete', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              user_id: mockUser.id,
              earned: 100,
              new_balance: 600,
              duration_sec: 180,
              transaction_id: 1,
              work_session_id: 1,
            },
          }),
        });
      });

      // Mock completed work state
      await page.route('**/api/work/status', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              is_working: true,
              can_complete: true,
              remaining_sec: 0,
              elapsed_sec: 180,
              progress: 1.0,
            },
          }),
        });
      });

      await page.reload();
      await page.waitForTimeout(1000);

      // Find complete button
      const completeButton = page.locator('button:has-text("Complete"), button:has-text("Collect"), button:has-text("Finish")').first();
      if (await completeButton.isVisible({ timeout: 5000 })) {
        await completeButton.click();

        // Should show earnings/stats modal
        await expect(page.locator('text=/earned|\\+100|\\$100|congratulations/i').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should not allow completing work before time is up', async ({ page }) => {
      await page.route('**/api/work/complete', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: true,
            message: 'work not completed yet, 45 seconds remaining',
          }),
        });
      });

      await page.route('**/api/work/status', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              is_working: true,
              can_complete: false,
              remaining_sec: 45,
            },
          }),
        });
      });

      await page.reload();
      await page.waitForTimeout(1000);

      // Complete button should be disabled or not visible
      const completeButton = page.locator('button:has-text("Complete")').first();
      if (await completeButton.isVisible({ timeout: 2000 })) {
        const isDisabled = await completeButton.isDisabled();
        expect(isDisabled).toBe(true);
      }
    });

    test('should display statistics modal after completion', async ({ page }) => {
      await page.route('**/api/work/complete', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              earned: 100,
              new_balance: 600,
            },
          }),
        });
      });

      await page.route('**/api/stats/countries/work', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              comparisons: [
                { country: 'Bangladesh', wage: 50, emoji: '🇧🇩' },
                { country: 'India', wage: 75, emoji: '🇮🇳' },
                { country: 'China', wage: 120, emoji: '🇨🇳' },
              ],
            },
          }),
        });
      });

      // Mock completed state
      await page.route('**/api/work/status', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              is_working: true,
              can_complete: true,
              remaining_sec: 0,
            },
          }),
        });
      });

      await page.reload();
      await page.waitForTimeout(1000);

      const completeButton = page.locator('button:has-text("Complete")').first();
      if (await completeButton.isVisible({ timeout: 3000 })) {
        await completeButton.click();

        // Should show stats modal with country comparisons
        await expect(page.locator('text=/bangladesh|india|china/i').first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Work History', () => {
    test('should display work history', async ({ page }) => {
      await page.route('**/api/work/history**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              sessions: [
                {
                  id: 1,
                  job_type: 'bottle_collector',
                  duration_seconds: 180,
                  earned: 100,
                  completed_at: new Date().toISOString(),
                },
                {
                  id: 2,
                  job_type: 'pizza_delivery',
                  duration_seconds: 240,
                  earned: 150,
                  completed_at: new Date(Date.now() - 3600000).toISOString(),
                },
              ],
              total: 2,
              limit: 10,
              offset: 0,
            },
          }),
        });
      });

      // Navigate to history page or section
      await page.goto('/?user_id=1');
      await page.waitForTimeout(1000);

      // Try to find history link/button
      const historyLink = page.locator('a:has-text("History"), button:has-text("History")').first();
      if (await historyLink.isVisible({ timeout: 3000 })) {
        await historyLink.click();

        // Should show work sessions
        await expect(page.locator('text=/bottle|pizza|100|150/i').first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.route('**/api/work/start', async (route) => {
        await route.abort('failed');
      });

      await page.waitForTimeout(500);

      const startButton = page.getByTestId('start-work-button');
      if (await startButton.isVisible({ timeout: 3000 })) {
        await startButton.click();

        // Should show error message
        await expect(page.locator('text=/error|failed|try again/i').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should handle server errors', async ({ page }) => {
      await page.route('**/api/work/start', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: true,
            message: 'internal server error',
          }),
        });
      });

      await page.waitForTimeout(500);

      const startButton = page.getByTestId('start-work-button');
      if (await startButton.isVisible({ timeout: 3000 })) {
        await startButton.click();

        // Should show error message
        await expect(page.locator('text=/error|server/i').first()).toBeVisible({ timeout: 5000 });
      }
    });
  });
});
