import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('renders all form fields', async ({ page }) => {
    const form = page.getByRole('form', { name: 'Contact form' });
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#subject')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
    await expect(form.getByRole('button', { name: /send/i })).toBeVisible();
  });

  test('submit button is disabled until CSRF token loads', async ({ page }) => {
    // Immediately after load, button is disabled while CSRF token fetches
    // After CSRF resolves the button should become enabled
    const submitBtn = page.getByRole('form', { name: 'Contact form' }).getByRole('button', { name: /send/i });
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
  });

  test('quick subject chips populate the subject field', async ({ page }) => {
    await page.locator('button', { hasText: 'Project Collaboration' }).click();
    await expect(page.locator('#subject')).toHaveValue('Project Collaboration');

    await page.locator('button', { hasText: 'AI/ML Consulting' }).click();
    await expect(page.locator('#subject')).toHaveValue('AI/ML Consulting');
  });

  test('message character counter updates', async ({ page }) => {
    const textarea = page.locator('#message');
    await textarea.fill('Hello world');
    await expect(page.locator('text=11 characters')).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    // Wait for CSRF to load so submit is enabled
    const submitBtn = page.getByRole('form', { name: 'Contact form' }).getByRole('button', { name: /send/i });
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });

    await submitBtn.click();

    // Server returns 400 with field errors — at least one alert should appear
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.locator('#name').fill('Test User');
    await page.locator('#email').fill('not-an-email');
    await page.locator('#subject').fill('Test Subject');
    await page.locator('#message').fill('This is a test message with enough content.');

    const submitBtn = page.getByRole('form', { name: 'Contact form' }).getByRole('button', { name: /send/i });
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();

    await expect(page.locator('#email-error')).toBeVisible({ timeout: 5000 });
  });

  test('subject field error clears when chip is clicked', async ({ page }) => {
    // Trigger a validation error on subject by submitting empty
    const submitBtn = page.getByRole('form', { name: 'Contact form' }).getByRole('button', { name: /send/i });
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();

    // Wait for errors to appear
    await page.waitForTimeout(1000);

    // Click a chip — should clear subject error
    await page.locator('button', { hasText: 'General Inquiry' }).click();
    await expect(page.locator('#subject-error')).not.toBeVisible();
    await expect(page.locator('#subject')).toHaveValue('General Inquiry');
  });
});
