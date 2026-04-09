# Frontend Testing Guide

This document describes the testing setup for the Freezino frontend application.

## Testing Stack

- **Vitest**: Unit and integration testing framework
- **@testing-library/react**: React component testing utilities
- **@playwright/test**: End-to-end testing framework

## Test Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── GameCard.tsx
│   │   ├── GameCard.test.tsx           # Unit tests
│   │   ├── GameCard.snapshot.test.tsx  # Snapshot tests
│   │   └── __snapshots__/              # Snapshot files
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   └── LoginPage.test.tsx          # Integration tests
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── formatters.test.ts          # Utility tests
│   └── test/
│       ├── setup.ts                    # Test setup file
│       ├── utils.tsx                   # Test utilities
│       └── mocks/                      # Mock data and stores
├── e2e/
│   ├── login.spec.ts                   # Login flow E2E tests
│   ├── work.spec.ts                    # Work flow E2E tests
│   ├── games.spec.ts                   # Game flow E2E tests
│   └── shop.spec.ts                    # Shop flow E2E tests
└── playwright.config.ts                # Playwright configuration
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test:coverage

# Run tests with UI
npm test:ui
```

### End-to-End Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test e2e/login.spec.ts
```

## Test Categories

### Unit Tests

Unit tests focus on individual components and utilities in isolation.

Examples:
- `GameCard.test.tsx` - Tests GameCard component rendering and interactions
- `LoadingSpinner.test.tsx` - Tests LoadingSpinner component
- `formatters.test.ts` - Tests utility functions

### Integration Tests

Integration tests verify that multiple components work together correctly.

Examples:
- `LoginPage.test.tsx` - Tests login page with auth store integration
- `ProtectedRoute.test.tsx` - Tests route protection with auth

### Snapshot Tests

Snapshot tests capture component output to detect unintended UI changes.

Examples:
- `GameCard.snapshot.test.tsx` - Captures GameCard visual output
- `LoadingSpinner.snapshot.test.tsx` - Captures LoadingSpinner states

### E2E Tests

End-to-end tests verify complete user flows across the application.

Test Flows:
1. **Login Flow** (`login.spec.ts`)
   - User sees login page
   - Google OAuth button is visible
   - Educational disclaimers are shown

2. **Work Flow** (`work.spec.ts`)
   - Work button appears when balance is zero
   - Timer counts down for 3 minutes
   - Stats modal shows after completion

3. **Game Flow** (`games.spec.ts`)
   - Game cards are displayed
   - Games are playable
   - Balance updates after games

4. **Shop Flow** (`shop.spec.ts`)
   - Items can be browsed
   - Items can be purchased
   - Items appear in profile
   - Items can be sold

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('text=Login')).toBeVisible();
});
```

## Mocking

### Store Mocks

Located in `src/test/mocks/stores.ts`, these provide mock implementations of Zustand stores.

```typescript
import { mockAuthStore } from '../test/mocks/stores';

vi.mock('../store/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));
```

## Coverage Goals

- Overall coverage: > 70%
- Critical paths (auth, payments): > 90%
- UI components: > 60%

## CI/CD

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-deployment

## Troubleshooting

### Common Issues

**Tests fail with "Cannot find module"**
- Run `npm install` to ensure all dependencies are installed

**Playwright tests fail**
- Run `npx playwright install` to install browsers
- Check that dev server is running on correct port

**Snapshot tests fail**
- Run `npm test -- -u` to update snapshots if changes are intentional

**Tests timeout**
- Increase timeout in vitest.config.ts or playwright.config.ts
- Check for infinite loops or async issues

## Best Practices

1. **Test behavior, not implementation** - Focus on what the user sees and does
2. **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Keep tests isolated** - Each test should be independent
4. **Mock external dependencies** - Use mocks for API calls, stores, etc.
5. **Write descriptive test names** - Test names should describe what is being tested
6. **Avoid test duplication** - DRY principle applies to tests too

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
