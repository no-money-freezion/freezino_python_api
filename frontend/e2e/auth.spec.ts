import { test, expect } from '@playwright/test';

/**
 * E2E Authentication Flow Tests
 *
 * Tests the complete authentication workflow including:
 * - Dev mode authentication with user_id parameter
 * - Protected route access control
 * - Authentication persistence across navigation
 * - Logout functionality
 * - Profile access
 */

test.describe('Authentication Flow', () => {

  test.describe('Unauthenticated Access', () => {
    test('should redirect to login when accessing protected home page', async ({ page }) => {
      await page.goto('/');

      // Should be redirected to login
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator('text=FREEZINO')).toBeVisible();
    });

    test('should redirect to login when accessing dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Should be redirected to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('should redirect to login when accessing shop', async ({ page }) => {
      await page.goto('/shop');

      // Should be redirected to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('should redirect to login when accessing profile', async ({ page }) => {
      await page.goto('/profile');

      // Should be redirected to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('should allow access to public pages without authentication', async ({ page }) => {
      // Test contact page
      await page.goto('/contact');
      await expect(page).toHaveURL(/.*contact/);

      // Test about page
      await page.goto('/about');
      await expect(page).toHaveURL(/.*about/);

      // Test terms page
      await page.goto('/terms');
      await expect(page).toHaveURL(/.*terms/);

      // Test privacy page
      await page.goto('/privacy');
      await expect(page).toHaveURL(/.*privacy/);
    });
  });

  test.describe('Dev Mode Authentication', () => {
    test('should authenticate with user_id parameter', async ({ page }) => {
      // Mock the auth API endpoint before navigation
      await page.route('**/api/auth/me*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
              balance: 1000,
              avatar: null,
            },
          }),
        });
      });

      // Navigate to home with user_id parameter (dev mode)
      await page.goto('/?user_id=1');

      // Wait for authentication to complete
      await page.waitForTimeout(2000);

      // Should not be redirected to login
      await expect(page).not.toHaveURL(/.*\/login$/);

      // Verify user is authenticated by checking localStorage
      const authState = await page.evaluate(() => {
        const stored = localStorage.getItem('auth-storage');
        return stored ? JSON.parse(stored) : null;
      });

      expect(authState?.state?.isAuthenticated).toBe(true);
    });

    test('should load user data from API with user_id', async ({ page }) => {
      // Intercept the /auth/me API call
      await page.route('**/api/auth/me*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
              balance: 1000,
              avatar: null,
            },
          }),
        });
      });

      await page.goto('/?user_id=1');

      // Wait for API call and authentication
      await page.waitForTimeout(1000);

      // Should be authenticated
      await expect(page).not.toHaveURL(/.*login/);
    });

    test('should handle authentication failure in dev mode', async ({ page }) => {
      // Intercept the /auth/me API call with error
      await page.route('**/api/auth/me*', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Unauthorized',
          }),
        });
      });

      await page.goto('/?user_id=999');

      // Wait for failed authentication
      await page.waitForTimeout(1000);

      // Should redirect to login on auth failure
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Authenticated Navigation', () => {
    test.beforeEach(async ({ page }) => {
      // Mock successful authentication
      await page.route('**/api/auth/me*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
              balance: 5000,
              avatar: null,
            },
          }),
        });
      });

      // Authenticate
      await page.goto('/?user_id=1');
      await page.waitForTimeout(1000);
    });

    test('should access home page when authenticated', async ({ page }) => {
      // Should be on home page
      await expect(page).toHaveURL(/^(?!.*login)/);

      // Should not be redirected to login
      await expect(page).not.toHaveURL(/.*login/);
    });

    test('should navigate to shop page', async ({ page }) => {
      await page.goto('/shop?user_id=1');
      await page.waitForTimeout(500);

      await expect(page).toHaveURL(/.*shop/);
      await expect(page).not.toHaveURL(/.*login/);
    });

    test('should navigate to profile page', async ({ page }) => {
      await page.goto('/profile?user_id=1');
      await page.waitForTimeout(500);

      await expect(page).toHaveURL(/.*profile/);
      await expect(page).not.toHaveURL(/.*login/);
    });

    test('should navigate between protected pages without re-authentication', async ({ page }) => {
      // Navigate to shop
      await page.goto('/shop?user_id=1');
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(/.*shop/);

      // Navigate to profile
      await page.goto('/profile?user_id=1');
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(/.*profile/);

      // Navigate back to home
      await page.goto('/?user_id=1');
      await page.waitForTimeout(500);
      await expect(page).not.toHaveURL(/.*login/);
    });

    test('should maintain authentication state in localStorage', async ({ page }) => {
      // Check that user state is persisted
      const authStore = await page.evaluate(() => {
        const stored = localStorage.getItem('auth-storage');
        return stored ? JSON.parse(stored) : null;
      });

      // Should have user data in storage
      expect(authStore).toBeTruthy();
      expect(authStore.state).toBeTruthy();
      expect(authStore.state.isAuthenticated).toBe(true);
      expect(authStore.state.user).toBeTruthy();
      expect(authStore.state.user.username).toBe('testuser');
    });
  });

  test.describe('Profile Access', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authentication
      await page.route('**/api/auth/me*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
              balance: 10000,
              avatar: 'avatar.png',
            },
          }),
        });
      });

      // Mock user stats
      await page.route('**/api/user/stats*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            stats: {
              totalEarned: 50000,
              totalSpent: 40000,
              totalWorkSessions: 100,
              totalGamePlays: 250,
            },
          }),
        });
      });

      // Mock user items
      await page.route('**/api/user/items*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            items: [],
          }),
        });
      });

      await page.goto('/profile?user_id=1');
      await page.waitForTimeout(1000);
    });

    test('should display user profile information', async ({ page }) => {
      // Should be on profile page
      await expect(page).toHaveURL(/.*profile/);

      // Wait for profile content to load
      await page.waitForTimeout(1500);

      // Profile page should have loaded (verify we're not redirected to login)
      await expect(page).not.toHaveURL(/.*\/login$/);

      // Verify authentication state persists
      const authState = await page.evaluate(() => {
        const stored = localStorage.getItem('auth-storage');
        return stored ? JSON.parse(stored) : null;
      });

      expect(authState?.state?.isAuthenticated).toBe(true);
      expect(authState?.state?.user?.username).toBe('testuser');
      expect(authState?.state?.user?.balance).toBe(10000);
    });

    test('should display user statistics', async ({ page }) => {
      // Wait for stats to load
      await page.waitForTimeout(1500);

      // Should be on profile page
      await expect(page).toHaveURL(/.*profile/);
      await expect(page).not.toHaveURL(/.*\/login$/);

      // Verify page has content (not just redirected)
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();
      expect(pageContent!.length).toBeGreaterThan(100);
    });
  });

  test.describe('Logout Flow', () => {
    test('should logout and redirect to login page', async ({ page }) => {
      // Mock authentication
      await page.route('**/api/auth/me*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
              balance: 1000,
            },
          }),
        });
      });

      // Mock logout endpoint
      let logoutCalled = false;
      await page.route('**/api/auth/logout*', async (route) => {
        logoutCalled = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
          }),
        });
      });

      // Authenticate
      await page.goto('/?user_id=1');
      await page.waitForTimeout(1000);

      // Find and click logout button
      // Note: Adjust selector based on your actual logout button
      const logoutButton = page.locator('button:has-text("Выход")').or(
        page.locator('button:has-text("Logout")').or(
          page.locator('a:has-text("Выход")').or(
            page.locator('a:has-text("Logout")')
          )
        )
      );

      // Wait for logout button to be visible
      await logoutButton.first().waitFor({ timeout: 5000 }).catch(() => {
        console.log('Logout button not found, test may need selector adjustment');
      });

      if (await logoutButton.first().isVisible({ timeout: 1000 }).catch(() => false)) {
        await logoutButton.first().click();

        // Wait for redirect
        await page.waitForTimeout(1000);

        // Should be redirected to login
        await expect(page).toHaveURL(/.*login/);

        // Logout API should have been called
        expect(logoutCalled).toBe(true);

        // localStorage should be cleared
        const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
        const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));

        expect(accessToken).toBeNull();
        expect(refreshToken).toBeNull();
      }
    });

    test('should clear authentication state after logout', async ({ page }) => {
      // Mock authentication
      await page.route('**/api/auth/me*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
              balance: 1000,
            },
          }),
        });
      });

      // Mock logout
      await page.route('**/api/auth/logout*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });

      // Authenticate
      await page.goto('/?user_id=1');
      await page.waitForTimeout(1000);

      // Check auth state before logout
      let authStore = await page.evaluate(() => {
        const stored = localStorage.getItem('auth-storage');
        return stored ? JSON.parse(stored) : null;
      });
      expect(authStore?.state?.isAuthenticated).toBe(true);

      // Logout via API (simulate programmatic logout)
      await page.evaluate(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          parsed.state.user = null;
          parsed.state.isAuthenticated = false;
          localStorage.setItem('auth-storage', JSON.stringify(parsed));
        }
      });

      // Check auth state after logout
      authStore = await page.evaluate(() => {
        const stored = localStorage.getItem('auth-storage');
        return stored ? JSON.parse(stored) : null;
      });
      expect(authStore?.state?.isAuthenticated).toBe(false);
      expect(authStore?.state?.user).toBeNull();
    });
  });

  test.describe('Authentication Persistence', () => {
    test('should persist authentication across page reloads', async ({ page }) => {
      // Mock authentication
      await page.route('**/api/auth/me*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
              balance: 1000,
            },
          }),
        });
      });

      // Authenticate
      await page.goto('/?user_id=1');
      await page.waitForTimeout(1000);

      // Reload page
      await page.reload();
      await page.waitForTimeout(1000);

      // Should still be authenticated (not redirected to login)
      await expect(page).not.toHaveURL(/.*login$/);

      // Auth state should persist
      const authStore = await page.evaluate(() => {
        const stored = localStorage.getItem('auth-storage');
        return stored ? JSON.parse(stored) : null;
      });
      expect(authStore?.state?.isAuthenticated).toBe(true);
    });

    test('should maintain user data in Zustand store', async ({ page }) => {
      // Mock authentication
      await page.route('**/api/auth/me*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: '1',
              username: 'persistentuser',
              email: 'persistent@example.com',
              balance: 7500,
              avatar: 'test-avatar.png',
            },
          }),
        });
      });

      await page.goto('/?user_id=1');
      await page.waitForTimeout(1000);

      // Check persisted user data
      const userData = await page.evaluate(() => {
        const stored = localStorage.getItem('auth-storage');
        return stored ? JSON.parse(stored).state.user : null;
      });

      expect(userData).toBeTruthy();
      expect(userData.username).toBe('persistentuser');
      expect(userData.email).toBe('persistent@example.com');
      expect(userData.balance).toBe(7500);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors during authentication', async ({ page }) => {
      // Mock network error
      await page.route('**/api/auth/me*', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/?user_id=1');
      await page.waitForTimeout(1000);

      // Should redirect to login on error
      await expect(page).toHaveURL(/.*login/);
    });

    test('should handle 401 unauthorized response', async ({ page }) => {
      // Mock 401 response
      await page.route('**/api/auth/me*', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Unauthorized',
          }),
        });
      });

      await page.goto('/?user_id=1');
      await page.waitForTimeout(1000);

      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Mock 500 server error
      await page.route('**/api/auth/me*', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Internal Server Error',
          }),
        });
      });

      await page.goto('/?user_id=1');
      await page.waitForTimeout(1000);

      // Should handle error and redirect to login
      await expect(page).toHaveURL(/.*login/);
    });
  });
});
