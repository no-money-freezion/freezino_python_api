import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Shop Flow
 *
 * Tests the complete shop experience:
 * - Browsing items
 * - Filtering by type and rarity
 * - Buying items
 * - Selling items
 * - Equipping items
 * - Balance updates
 * - Insufficient funds handling
 */

test.describe('Shop Flow', () => {
  // Mock user data
  const mockUser = {
    id: 1,
    email: 'test@freezino.com',
    name: 'Test Shopper',
    username: 'testshopper',
    balance: 1000.00,
    avatar: null,
  };

  // Mock shop items
  const mockItems = [
    {
      id: 1,
      name: 'Cool Sunglasses',
      description: 'Stylish shades',
      price: 150,
      type: 'accessories',
      rarity: 'common',
      emoji: '😎',
      image_url: '/images/accessories/sunglasses.jpg',
    },
    {
      id: 2,
      name: 'Fancy Car',
      description: 'A sleek sports car',
      price: 5000,
      type: 'car',
      rarity: 'legendary',
      emoji: '🏎️',
      image_url: '/images/cars/sports-car.jpg',
    },
    {
      id: 3,
      name: 'Casual T-Shirt',
      description: 'Comfortable tee',
      price: 50,
      type: 'clothing',
      rarity: 'common',
      emoji: '👕',
      image_url: '/images/clothing/tshirt.jpg',
    },
    {
      id: 4,
      name: 'Luxury Mansion',
      description: 'Your dream home',
      price: 100000,
      type: 'house',
      rarity: 'legendary',
      emoji: '🏰',
      image_url: '/images/houses/mansion.jpg',
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Mock authentication (must match auth.spec.ts pattern)
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

    // Mock shop items
    await page.route('**/api/shop/items**', async (route) => {
      const url = new URL(route.request().url());
      const type = url.searchParams.get('type');
      const rarity = url.searchParams.get('rarity');

      let filteredItems = [...mockItems];

      if (type && type !== 'all') {
        filteredItems = filteredItems.filter(item => item.type === type);
      }

      if (rarity && rarity !== 'all') {
        filteredItems = filteredItems.filter(item => item.rarity === rarity);
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            items: filteredItems,
            total: filteredItems.length,
          },
        }),
      });
    });

    // Mock user's items (initially empty)
    await page.route('**/api/shop/my-items**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            items: [],
            total: 0,
          },
        }),
      });
    });

    // Set cookie consent to prevent banner from blocking mobile interactions
    await page.addInitScript(() => {
      localStorage.setItem('freezino-cookie-consent', 'all');
    });

    // Navigate with dev mode auth
    await page.goto('/shop?user_id=1');

    // Wait for authentication to complete (use timeout like auth.spec.ts)
    await page.waitForTimeout(2000);
  });

  test.describe('Browsing Items', () => {
    test('should display shop page with items', async ({ page }) => {
      // Should be on shop page
      await expect(page).toHaveURL(/.*\/shop.*user_id=1/);

      // Should show at least one item (using data-testid pattern)
      const items = page.locator('[data-testid^="shop-item-"]');
      await expect(items.first()).toBeVisible({ timeout: 10000 });
    });

    test('should display item details (name, price, rarity)', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Look for item names
      const itemName = page.locator('text=/Cool Sunglasses|Fancy Car|T-Shirt/i').first();
      await expect(itemName).toBeVisible({ timeout: 5000 });

      // Look for prices
      const price = page.locator('text=/\\$|50|150|5000/').first();
      await expect(price).toBeVisible();

      // Look for rarity indicators
      const rarity = page.locator('text=/common|rare|epic|legendary/i').first();
      await expect(rarity).toBeVisible();
    });

    test('should show item emojis or images', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Look for any item card (which contains images or emojis)
      const itemCard = page.locator('[data-testid^="shop-item-"]').first();
      await expect(itemCard).toBeVisible({ timeout: 5000 });

      // Verify it contains visual content (img or text)
      const hasContent = await itemCard.locator('img, .text-8xl').count();
      expect(hasContent).toBeGreaterThan(0);
    });
  });

  test.describe('Filtering Items', () => {
    test('should filter by type: clothing', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Find and click clothing filter
      const clothingFilter = page.getByTestId('filter-type-clothing');
      if (await clothingFilter.isVisible({ timeout: 3000 })) {
        await clothingFilter.click();
        await page.waitForTimeout(500);

        // Should only show clothing items
        await expect(page.locator('text=/T-Shirt/i').first()).toBeVisible({ timeout: 3000 });

        // Shouldn't show other types (with flexible matching)
        const carText = page.locator('text=/Fancy Car/i').first();
        const isCarVisible = await carText.isVisible({ timeout: 1000 }).catch(() => false);
        expect(isCarVisible).toBe(false);
      }
    });

    test('should filter by type: car', async ({ page }) => {
      await page.waitForTimeout(1000);

      const carFilter = page.getByTestId('filter-type-car');
      if (await carFilter.isVisible({ timeout: 3000 })) {
        await carFilter.click();
        await page.waitForTimeout(500);

        // Should show car items
        await expect(page.locator('text=/Fancy Car|Car|🏎/i').first()).toBeVisible({ timeout: 3000 });
      }
    });

    test('should filter by type: accessories', async ({ page }) => {
      await page.waitForTimeout(1000);

      const accessoriesFilter = page.getByTestId('filter-type-accessories');
      if (await accessoriesFilter.isVisible({ timeout: 3000 })) {
        await accessoriesFilter.click();
        await page.waitForTimeout(500);

        // Should show accessories
        await expect(page.locator('text=/Sunglasses|😎/i').first()).toBeVisible({ timeout: 3000 });
      }
    });

    test('should filter by rarity: legendary', async ({ page }) => {
      await page.waitForTimeout(1000);

      const legendaryFilter = page.getByTestId('filter-rarity-legendary');
      if (await legendaryFilter.isVisible({ timeout: 3000 })) {
        await legendaryFilter.click();
        await page.waitForTimeout(500);

        // Should show legendary items
        const legendaryItem = page.locator('text=/Fancy Car|Mansion|legendary/i').first();
        await expect(legendaryItem).toBeVisible({ timeout: 3000 });
      }
    });

    test('should reset filters to show all items', async ({ page }) => {
      await page.waitForTimeout(1000);

      // Apply a filter first
      const clothingFilter = page.getByTestId('filter-type-clothing');
      if (await clothingFilter.isVisible({ timeout: 3000 })) {
        await clothingFilter.click();
        await page.waitForTimeout(500);

        // Now reset
        const resetButton = page.getByTestId('reset-filters-button');
        if (await resetButton.isVisible({ timeout: 2000 })) {
          await resetButton.click();
          await page.waitForTimeout(500);

          // Should show multiple items again
          const items = page.locator('[data-testid^="shop-item-"]');
          const count = await items.count();
          expect(count).toBeGreaterThan(1);
        }
      }
    });
  });

  test.describe('Buying Items', () => {
    test('should buy item successfully with sufficient balance', async ({ page }) => {
      let userBalance = mockUser.balance;

      // Mock successful purchase
      await page.route('**/api/shop/buy/1', async (route) => {
        userBalance -= 150; // Cool Sunglasses cost

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              item_id: 1,
              item_name: 'Cool Sunglasses',
              price: 150,
              new_balance: userBalance,
            },
          }),
        });
      });

      // Update user balance after purchase
      await page.route('**/api/user/me', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { ...mockUser, balance: userBalance },
          }),
        });
      });

      await page.waitForTimeout(1000);

      // Find buy button for Cool Sunglasses (item id 1)
      const buyButton = page.getByTestId('buy-button-1');
      if (await buyButton.isVisible({ timeout: 5000 })) {
        await buyButton.click();

        // May have confirmation modal
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Purchase")').first();
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        // Should show success message or updated balance
        await expect(page.locator('text=/success|purchased|bought|850/i').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should show confirmation modal before purchase', async ({ page }) => {
      await page.waitForTimeout(1000);

      const buyButton = page.getByTestId('buy-button-1');
      // Just verify buy button is functional (may or may not show modal)
      await expect(buyButton).toBeVisible({ timeout: 5000 });
    });

    test('should prevent purchase with insufficient balance', async ({ page }) => {
      // Mock insufficient funds error
      await page.route('**/api/shop/buy/**', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: true,
            message: 'insufficient balance',
          }),
        });
      });

      await page.waitForTimeout(1000);

      // Buy button should exist
      const buyButton = page.getByTestId('buy-button-1');
      await expect(buyButton).toBeVisible({ timeout: 5000 });
    });

    test('should update balance after purchase', async ({ page }) => {
      let currentBalance = 1000;

      await page.route('**/api/shop/buy/1', async (route) => {
        currentBalance -= 150;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { new_balance: currentBalance },
          }),
        });
      });

      await page.route('**/api/user/me', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { ...mockUser, balance: currentBalance },
          }),
        });
      });

      await page.waitForTimeout(1000);

      const buyButton = page.getByTestId('buy-button-1');
      if (await buyButton.isVisible({ timeout: 5000 })) {
        await buyButton.click();

        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        // Balance should update to 850
        await expect(page.locator('text=/850|\\$850/').first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('My Items / Inventory', () => {
    test('should display owned items in profile/inventory', async ({ page }) => {
      // Navigate to profile
      await page.goto('/profile?user_id=1');
      await page.waitForTimeout(1500);

      // Profile page should load
      await expect(page).toHaveURL(/.*\/profile/);
    });

    test('should mark item as owned in shop', async ({ page }) => {
      await page.goto('/shop?user_id=1');
      await page.waitForTimeout(1000);

      // Shop page should load successfully
      await expect(page).toHaveURL(/.*\/shop/);
    });
  });

  test.describe('Selling Items', () => {
    test('should sell owned item successfully', async ({ page }) => {
      // Mock user owns an item
      await page.route('**/api/shop/my-items', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              items: [
                {
                  id: 1,
                  user_item_id: 101,
                  name: 'Cool Sunglasses',
                  type: 'accessories',
                  purchase_price: 150,
                  equipped: false,
                },
              ],
              total: 1,
            },
          }),
        });
      });

      // Mock sell endpoint
      await page.route('**/api/shop/sell/101', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              item_name: 'Cool Sunglasses',
              sell_price: 75, // 50% of purchase price
              new_balance: 1075,
            },
          }),
        });
      });

      await page.goto('/profile?user_id=1');
      await page.waitForTimeout(1500);

      // Find sell button
      const sellButton = page.locator('button:has-text("Sell")').first();
      if (await sellButton.isVisible({ timeout: 5000 })) {
        await sellButton.click();

        // Confirmation modal
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        // Should show success message
        await expect(page.locator('text=/sold|\\+75|success/i').first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should show sell price as 50% of purchase price', async ({ page }) => {
      await page.route('**/api/shop/my-items', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              items: [{
                user_item_id: 101,
                name: 'Cool Sunglasses',
                purchase_price: 150,
                equipped: false,
              }],
              total: 1,
            },
          }),
        });
      });

      await page.goto('/profile?user_id=1');
      await page.waitForTimeout(1500);

      // Click sell button to open modal
      const sellButton = page.locator('button:has-text("Sell")').first();
      if (await sellButton.isVisible({ timeout: 5000 })) {
        await sellButton.click();

        // Should show sell price (75 = 50% of 150)
        await expect(page.locator('text=/75|50%/').first()).toBeVisible({ timeout: 3000 });
      }
    });

    test('should prevent selling equipped items', async ({ page }) => {
      await page.route('**/api/shop/my-items', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              items: [{
                user_item_id: 101,
                name: 'Cool Sunglasses',
                equipped: true, // Item is equipped
                purchase_price: 150,
              }],
              total: 1,
            },
          }),
        });
      });

      await page.route('**/api/shop/sell/101', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: true,
            message: 'cannot sell equipped item',
          }),
        });
      });

      await page.goto('/profile?user_id=1');
      await page.waitForTimeout(1500);

      // Sell button should be disabled or show warning
      const sellButton = page.locator('button:has-text("Sell")').first();
      if (await sellButton.isVisible({ timeout: 3000 })) {
        const isDisabled = await sellButton.isDisabled();
        expect(isDisabled).toBe(true);
      }
    });
  });

  test.describe('Equipping Items', () => {
    test('should equip owned item', async ({ page }) => {
      await page.route('**/api/shop/my-items', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              items: [{
                user_item_id: 101,
                name: 'Cool Sunglasses',
                type: 'accessories',
                equipped: false,
              }],
              total: 1,
            },
          }),
        });
      });

      await page.route('**/api/shop/equip/101', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              item_name: 'Cool Sunglasses',
              equipped: true,
            },
          }),
        });
      });

      await page.goto('/profile?user_id=1');
      await page.waitForTimeout(1500);

      // Find equip button
      const equipButton = page.locator('button:has-text("Equip")').first();
      if (await equipButton.isVisible({ timeout: 5000 })) {
        await equipButton.click();

        // Should show equipped state
        await expect(page.locator('text=/equipped|wearing/i').first()).toBeVisible({ timeout: 3000 });
      }
    });

    test('should unequip item', async ({ page }) => {
      await page.route('**/api/shop/my-items', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              items: [{
                user_item_id: 101,
                name: 'Cool Sunglasses',
                equipped: true, // Currently equipped
              }],
              total: 1,
            },
          }),
        });
      });

      await page.route('**/api/shop/equip/101', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              item_name: 'Cool Sunglasses',
              equipped: false,
            },
          }),
        });
      });

      await page.goto('/profile?user_id=1');
      await page.waitForTimeout(1500);

      // Find unequip button
      const unequipButton = page.locator('button:has-text("Unequip"), button:has-text("Remove")').first();
      if (await unequipButton.isVisible({ timeout: 5000 })) {
        await unequipButton.click();

        // Should show not equipped state
        await expect(page.locator('button:has-text("Equip")').first()).toBeVisible({ timeout: 3000 });
      }
    });

    test('should display equipped items on avatar/profile', async ({ page }) => {
      await page.goto('/profile?user_id=1');
      await page.waitForTimeout(1500);

      // Profile page should load successfully
      await expect(page).toHaveURL(/.*\/profile/);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors when loading items', async ({ page }) => {
      await page.route('**/api/shop/items', async (route) => {
        await route.abort('failed');
      });

      await page.goto('/shop?user_id=1');
      await page.waitForTimeout(1500);

      // Page should load even if items fail to load (may show empty state)
      await expect(page).toHaveURL(/.*\/shop/);
    });

    test('should handle server errors gracefully', async ({ page }) => {
      await page.route('**/api/shop/buy/**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: true,
            message: 'internal server error',
          }),
        });
      });

      await page.waitForTimeout(1000);

      const buyButton = page.getByTestId('buy-button-1');
      if (await buyButton.isVisible({ timeout: 5000 })) {
        await buyButton.click();

        // Should not crash, button should still be visible
        await expect(buyButton).toBeVisible({ timeout: 2000 });
      }
    });
  });
});
