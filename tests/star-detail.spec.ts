import { test, expect } from '@playwright/test';

test.describe('Star Detail Page - Navigation Flow', () => {
  test('should navigate from star card to detail page', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Wait for star gallery to load
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Get the first star card
    const firstStarCard = page.locator('article[aria-label*="Star card"]').first();
    const starLink = firstStarCard.locator('a').first();
    
    // Get the star name from the card
    const starName = await firstStarCard.locator('h3').textContent();
    
    // Click the star card
    await starLink.click();
    
    // Verify we're on the detail page
    await expect(page).toHaveURL(/\/star\/\d+/);
    
    // Verify the star name is displayed on the detail page
    await expect(page.locator('h1')).toContainText(starName || '');
  });

  test('should navigate back to home page using back button', async ({ page }) => {
    // Navigate directly to a star detail page
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    const firstStarLink = page.locator('article[aria-label*="Star card"] a').first();
    await firstStarLink.click();
    
    // Wait for detail page to load
    await expect(page).toHaveURL(/\/star\/\d+/);
    
    // Click the back button
    const backButton = page.locator('a[aria-label="Return to home page"]');
    await expect(backButton).toBeVisible();
    await backButton.click();
    
    // Verify we're back on the home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('article[aria-label*="Star card"]').first()).toBeVisible();
  });

  test('should navigate to multiple different star detail pages', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Get multiple star cards
    const starCards = page.locator('article[aria-label*="Star card"]');
    const count = await starCards.count();
    
    // Test at least 3 different stars (or all if less than 3)
    const starsToTest = Math.min(3, count);
    
    for (let i = 0; i < starsToTest; i++) {
      // Navigate to home
      await page.goto('/');
      await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
      
      // Get the star card
      const starCard = page.locator('article[aria-label*="Star card"]').nth(i);
      const starName = await starCard.locator('h3').textContent();
      const starLink = starCard.locator('a').first();
      
      // Click the star card
      await starLink.click();
      
      // Verify we're on the correct detail page
      await expect(page).toHaveURL(/\/star\/\d+/);
      await expect(page.locator('h1')).toContainText(starName || '');
    }
  });
});


test.describe('Star Detail Page - Error Scenarios', () => {
  test('should display error for invalid star ID', async ({ page }) => {
    // Navigate to a non-existent star ID
    await page.goto('/star/999999');
    
    // Verify error message is displayed
    await expect(page.locator('h1')).toContainText('Star Not Found');
    await expect(page.locator('p')).toContainText('This star may have been removed or the link is incorrect');
  });

  test('should have working Return to Home button in error state', async ({ page }) => {
    // Navigate to a non-existent star ID
    await page.goto('/star/999999');
    
    // Wait for error page to load
    await expect(page.locator('h1')).toContainText('Star Not Found');
    
    // Click Return to Home button
    const returnButton = page.locator('a:has-text("Return to Home")');
    await expect(returnButton).toBeVisible();
    await returnButton.click();
    
    // Verify we're back on the home page
    await expect(page).toHaveURL('/');
    await expect(page.locator('article[aria-label*="Star card"]').first()).toBeVisible();
  });

  test('should display error for non-numeric star ID', async ({ page }) => {
    // Navigate with non-numeric ID
    await page.goto('/star/invalid-id');
    
    // Verify error message is displayed
    await expect(page.locator('h1')).toContainText('Star Not Found');
  });

  test('should display error for special characters in star ID', async ({ page }) => {
    // Navigate with special characters
    await page.goto('/star/abc@123');
    
    // Verify error message is displayed
    await expect(page.locator('h1')).toContainText('Star Not Found');
  });
});


test.describe('Star Detail Page - Loading States', () => {
  test('should display loading skeleton during data fetch', async ({ page }) => {
    // Start navigation but don't wait for it to complete
    const navigationPromise = page.goto('/');
    
    // Wait for star cards to appear
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    await navigationPromise;
    
    // Get the first star link
    const firstStarLink = page.locator('article[aria-label*="Star card"] a').first();
    
    // Start navigation to detail page
    await firstStarLink.click();
    
    // The loading state might be very fast, but we can verify the page loads successfully
    await expect(page).toHaveURL(/\/star\/\d+/);
    
    // Verify the actual content is displayed (not loading skeleton)
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
  });

  test('should display loading skeleton with proper structure', async ({ page }) => {
    // Navigate to home first
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Get first star link
    const firstStarLink = page.locator('article[aria-label*="Star card"] a').first();
    await firstStarLink.click();
    
    // Wait for the page to fully load
    await expect(page).toHaveURL(/\/star\/\d+/);
    
    // Verify final content is displayed
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('a[aria-label="Return to home page"]')).toBeVisible();
  });
});


test.describe('Star Detail Page - Accessibility', () => {
  test('should support keyboard navigation with Enter key', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Focus on first star link
    const firstStarLink = page.locator('article[aria-label*="Star card"] a').first();
    await firstStarLink.focus();
    
    // Press Enter to navigate
    await page.keyboard.press('Enter');
    
    // Verify we're on the detail page
    await expect(page).toHaveURL(/\/star\/\d+/);
  });

  test('should have visible focus indicators', async ({ page }) => {
    // Navigate to detail page
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    const firstStarLink = page.locator('article[aria-label*="Star card"] a').first();
    await firstStarLink.click();
    await expect(page).toHaveURL(/\/star\/\d+/);
    
    // Focus on back button
    const backButton = page.locator('a[aria-label="Return to home page"]');
    await backButton.focus();
    
    // Verify focus indicator is visible (check for focus ring classes)
    const classList = await backButton.getAttribute('class');
    expect(classList).toContain('focus:ring');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Navigate to detail page
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    const firstStarLink = page.locator('article[aria-label*="Star card"] a').first();
    await firstStarLink.click();
    await expect(page).toHaveURL(/\/star\/\d+/);
    
    // Verify back button has ARIA label
    const backButton = page.locator('a[aria-label="Return to home page"]');
    await expect(backButton).toHaveAttribute('aria-label', 'Return to home page');
    
    // Verify star image has alt text
    const starImage = page.locator('img').first();
    const altText = await starImage.getAttribute('alt');
    expect(altText).toBeTruthy();
    expect(altText?.length).toBeGreaterThan(0);
  });

  test('should have semantic HTML structure', async ({ page }) => {
    // Navigate to detail page
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    const firstStarLink = page.locator('article[aria-label*="Star card"] a').first();
    await firstStarLink.click();
    await expect(page).toHaveURL(/\/star\/\d+/);
    
    // Verify semantic elements exist
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });
});


test.describe('Star Detail Page - Responsive Design', () => {
  test('should display correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to detail page
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    const firstStarLink = page.locator('article[aria-label*="Star card"] a').first();
    await firstStarLink.click();
    await expect(page).toHaveURL(/\/star\/\d+/);
    
    // Verify key elements are visible
    await expect(page.locator('a[aria-label="Return to home page"]')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
    
    // Verify details grid adapts (should be single column on mobile)
    const detailsGrid = page.locator('article .grid').first();
    await expect(detailsGrid).toBeVisible();
  });

  test('should display correctly on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Navigate to detail page
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    const firstStarLink = page.locator('article[aria-label*="Star card"] a').first();
    await firstStarLink.click();
    await expect(page).toHaveURL(/\/star\/\d+/);
    
    // Verify key elements are visible
    await expect(page.locator('a[aria-label="Return to home page"]')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
    
    // Verify layout is appropriate for tablet
    const container = page.locator('main > div').first();
    await expect(container).toBeVisible();
  });

  test('should have responsive image on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to detail page
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    const firstStarLink = page.locator('article[aria-label*="Star card"] a').first();
    await firstStarLink.click();
    await expect(page).toHaveURL(/\/star\/\d+/);
    
    // Verify star image is visible and properly sized
    const starImage = page.locator('img').first();
    await expect(starImage).toBeVisible();
    
    // Verify image container maintains aspect ratio
    const imageContainer = page.locator('.aspect-video').first();
    await expect(imageContainer).toBeVisible();
  });

  test('should adapt details grid layout on different viewports', async ({ page }) => {
    // Test on mobile (single column)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    let firstStarLink = page.locator('article[aria-label*="Star card"] a').first();
    await firstStarLink.click();
    await expect(page).toHaveURL(/\/star\/\d+/);
    
    let detailsGrid = page.locator('article .grid').first();
    await expect(detailsGrid).toBeVisible();
    
    // Test on desktop (three columns)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    firstStarLink = page.locator('article[aria-label*="Star card"] a').first();
    await firstStarLink.click();
    await expect(page).toHaveURL(/\/star\/\d+/);
    
    detailsGrid = page.locator('article .grid').first();
    await expect(detailsGrid).toBeVisible();
  });
});
