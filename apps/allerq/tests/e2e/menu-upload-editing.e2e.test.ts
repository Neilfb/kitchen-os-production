import { test, expect } from '@playwright/test';

test.describe('Menu Upload and Editing E2E Flow', () => {
  test('should upload menu file, display extracted items, edit and save menu items', async ({ page }) => {
    // Navigate to menu upload page
    await page.goto('/menus/upload');

    // Upload a menu file
    const filePath = './tests/fixtures/sample-menu.pdf';
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('input[type="file"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    // Wait for extracted items to appear
    await expect(page.locator('text=Test Dish')).toBeVisible();
    await expect(page.locator('text=nuts')).toBeVisible();
    await expect(page.locator('text=vegan')).toBeVisible();

    // Navigate to menu edit page for the uploaded menu
    // Assuming menuId is '123' for test
    await page.goto('/menus/123/edit');

    // Wait for menu item to load
    await expect(page.locator('text=Test Dish')).toBeVisible();

    // Edit allergen tags
    const allergenInput = page.locator('input[aria-label="allergens"]');
    await allergenInput.fill('gluten');

    // Edit dietary tags
    const dietaryInput = page.locator('input[aria-label="dietary tags"]');
    await dietaryInput.fill('vegetarian');

    // Save changes
    await page.click('button:has-text("Save")');

    // Expect success message
    await expect(page.locator('text=Saved successfully')).toBeVisible();
  });

  test('should handle upload API failure gracefully', async ({ page }) => {
    // Intercept upload API to simulate failure
    await page.route('/api/menus/upload', route =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Upload failed' }),
      })
    );

    await page.goto('/menus/upload');

    const filePath = './tests/fixtures/sample-menu.pdf';
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('input[type="file"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    await expect(page.locator('text=Upload failed')).toBeVisible();
  });

  test('should handle save API failure gracefully', async ({ page }) => {
    // Intercept save API to simulate failure
    await page.route('/api/menus/123', route =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Save failed' }),
      })
    );

    await page.goto('/menus/123/edit');

    await expect(page.locator('text=Test Dish')).toBeVisible();

    await page.click('button:has-text("Save")');

    await expect(page.locator('text=Save failed')).toBeVisible();
  });
});
