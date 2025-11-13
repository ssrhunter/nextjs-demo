import { test, expect } from '@playwright/test';

test.describe('Navigation Arrows - Visibility', () => {
  test('should display navigation arrows when gallery has multiple stars', async ({ page }) => {
    await page.goto('/');
    
    // Wait for star gallery to load
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Wait for navigation arrows container to be present (it's always attached but may not be visible)
    const arrowsContainer = page.locator('.navigation-arrows-container');
    await expect(arrowsContainer).toBeAttached();
    
    // Verify at least one arrow button exists
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    await expect(rightArrow).toBeAttached();
  });

  test('should hide left arrow at leftmost position', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Ensure we're at the start
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 0;
    });
    
    // Wait a moment for scroll state to update
    await page.waitForTimeout(200);
    
    // Left arrow should be hidden (opacity 0 or aria-hidden)
    const leftArrow = page.locator('button[aria-label="Navigate to previous star"]');
    await expect(leftArrow).toHaveAttribute('aria-hidden', 'true');
  });

  test('should show right arrow at leftmost position when multiple stars exist', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Ensure we're at the start
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 0;
    });
    
    await page.waitForTimeout(200);
    
    // Right arrow should be visible
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    await expect(rightArrow).toHaveAttribute('aria-hidden', 'false');
  });

  test('should hide right arrow at rightmost position', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Scroll to the end
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    });
    
    await page.waitForTimeout(200);
    
    // Right arrow should be hidden
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    await expect(rightArrow).toHaveAttribute('aria-hidden', 'true');
  });

  test('should show left arrow at rightmost position', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Scroll to the end
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    });
    
    await page.waitForTimeout(200);
    
    // Left arrow should be visible
    const leftArrow = page.locator('button[aria-label="Navigate to previous star"]');
    await expect(leftArrow).toHaveAttribute('aria-hidden', 'false');
  });

  test('should show both arrows in middle scroll position', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Scroll to middle position
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    });
    
    await page.waitForTimeout(200);
    
    // Both arrows should be visible
    const leftArrow = page.locator('button[aria-label="Navigate to previous star"]');
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    
    await expect(leftArrow).toHaveAttribute('aria-hidden', 'false');
    await expect(rightArrow).toHaveAttribute('aria-hidden', 'false');
  });
});

test.describe('Navigation Arrows - Click Navigation', () => {
  test('should scroll right by one card width when clicking right arrow', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    
    // Ensure we're at the start
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 0;
    });
    
    await page.waitForTimeout(200);
    
    // Get initial scroll position
    const initialScroll = await scrollContainer.evaluate((el) => el.scrollLeft);
    
    // Click right arrow
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    await rightArrow.click();
    
    // Wait for scroll animation
    await page.waitForTimeout(500);
    
    // Verify scroll position changed by approximately one card width (352px = 320px card + 32px gap)
    const newScroll = await scrollContainer.evaluate((el) => el.scrollLeft);
    const scrollDelta = newScroll - initialScroll;
    
    // Allow some tolerance for smooth scrolling
    expect(scrollDelta).toBeGreaterThan(300);
    expect(scrollDelta).toBeLessThan(400);
  });

  test('should scroll left by one card width when clicking left arrow', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    
    // First scroll right to have room to scroll left
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    await rightArrow.click();
    await page.waitForTimeout(500);
    
    // Get initial scroll position after scrolling right
    const initialScroll = await scrollContainer.evaluate((el) => el.scrollLeft);
    
    // Click left arrow
    const leftArrow = page.locator('button[aria-label="Navigate to previous star"]');
    await leftArrow.click();
    
    // Wait for scroll animation
    await page.waitForTimeout(500);
    
    // Verify scroll position changed by approximately one card width
    const newScroll = await scrollContainer.evaluate((el) => el.scrollLeft);
    const scrollDelta = initialScroll - newScroll;
    
    expect(scrollDelta).toBeGreaterThan(300);
    expect(scrollDelta).toBeLessThan(400);
  });

  test('should navigate through multiple cards with repeated clicks', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    
    // Ensure we're at the start
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 0;
    });
    
    await page.waitForTimeout(200);
    
    // Click right arrow 3 times
    for (let i = 0; i < 3; i++) {
      await rightArrow.click();
      await page.waitForTimeout(500);
    }
    
    // Verify we've scrolled significantly
    const finalScroll = await scrollContainer.evaluate((el) => el.scrollLeft);
    expect(finalScroll).toBeGreaterThan(900); // At least 3 cards worth
  });
});

test.describe('Navigation Arrows - Keyboard Navigation', () => {
  test('should navigate with Enter key on left arrow', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    
    // Scroll to middle position
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 700;
    });
    
    await page.waitForTimeout(200);
    
    const initialScroll = await scrollContainer.evaluate((el) => el.scrollLeft);
    
    // Focus and press Enter on left arrow
    const leftArrow = page.locator('button[aria-label="Navigate to previous star"]');
    await leftArrow.focus();
    await page.keyboard.press('Enter');
    
    await page.waitForTimeout(500);
    
    // Verify scroll occurred
    const newScroll = await scrollContainer.evaluate((el) => el.scrollLeft);
    expect(newScroll).toBeLessThan(initialScroll);
  });

  test('should navigate with Space key on right arrow', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    
    // Ensure we're at the start
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 0;
    });
    
    await page.waitForTimeout(200);
    
    const initialScroll = await scrollContainer.evaluate((el) => el.scrollLeft);
    
    // Focus and press Space on right arrow
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    await rightArrow.focus();
    await page.keyboard.press('Space');
    
    await page.waitForTimeout(500);
    
    // Verify scroll occurred
    const newScroll = await scrollContainer.evaluate((el) => el.scrollLeft);
    expect(newScroll).toBeGreaterThan(initialScroll);
  });

  test('should have visible focus indicator on arrow buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Ensure right arrow is visible
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 0;
    });
    
    await page.waitForTimeout(200);
    
    // Focus on right arrow
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    await rightArrow.focus();
    
    // Verify focus ring classes are present
    const classList = await rightArrow.getAttribute('class');
    expect(classList).toContain('focus:ring');
  });

  test('should be keyboard focusable with Tab key', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Ensure we're in middle position so both arrows are visible
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    });
    
    await page.waitForTimeout(200);
    
    // Tab through elements to reach arrows
    await page.keyboard.press('Tab');
    
    // Check if either arrow button is focused
    const leftArrow = page.locator('button[aria-label="Navigate to previous star"]');
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    
    // At least one should be focusable
    const leftTabIndex = await leftArrow.getAttribute('tabindex');
    const rightTabIndex = await rightArrow.getAttribute('tabindex');
    
    // Visible arrows should have tabindex 0
    expect(leftTabIndex === '0' || rightTabIndex === '0').toBeTruthy();
  });

  test('should remove hidden arrows from tab order', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Ensure we're at the start (left arrow hidden)
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 0;
    });
    
    await page.waitForTimeout(200);
    
    // Left arrow should have tabindex -1
    const leftArrow = page.locator('button[aria-label="Navigate to previous star"]');
    await expect(leftArrow).toHaveAttribute('tabindex', '-1');
  });
});

test.describe('Navigation Arrows - Accessibility', () => {
  test('should have appropriate ARIA labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Check left arrow ARIA label
    const leftArrow = page.locator('button[aria-label="Navigate to previous star"]');
    await expect(leftArrow).toHaveAttribute('aria-label', 'Navigate to previous star');
    
    // Check right arrow ARIA label
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    await expect(rightArrow).toHaveAttribute('aria-label', 'Navigate to next star');
  });

  test('should set aria-hidden when arrows are not visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // At start position, left arrow should be hidden
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 0;
    });
    
    await page.waitForTimeout(200);
    
    const leftArrow = page.locator('button[aria-label="Navigate to previous star"]');
    await expect(leftArrow).toHaveAttribute('aria-hidden', 'true');
  });

  test('should have proper button semantics', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Verify both elements are buttons
    const leftArrow = page.locator('button[aria-label="Navigate to previous star"]');
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    
    await expect(leftArrow).toHaveRole('button');
    await expect(rightArrow).toHaveRole('button');
  });
});

test.describe('Navigation Arrows - Reduced Motion', () => {
  test('should respect prefers-reduced-motion for scroll behavior', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    
    // Ensure we're at the start
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 0;
    });
    
    await page.waitForTimeout(200);
    
    const initialScroll = await scrollContainer.evaluate((el) => el.scrollLeft);
    
    // Click right arrow
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    await rightArrow.click();
    
    // With reduced motion, scroll should be instant (no smooth animation)
    // Wait a short time and verify scroll completed
    await page.waitForTimeout(200);
    
    const newScroll = await scrollContainer.evaluate((el) => el.scrollLeft);
    const scrollDelta = newScroll - initialScroll;
    
    // Verify scroll occurred (should be at least 150px)
    expect(scrollDelta).toBeGreaterThan(150);
  });

  test('should apply reduced-motion class when preference is enabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Check if reduced-motion class is applied
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    const classList = await rightArrow.getAttribute('class');
    
    expect(classList).toContain('reduced-motion');
  });
});

test.describe('Navigation Arrows - Responsive Design', () => {
  test('should display arrows on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Verify arrows container exists
    const arrowsContainer = page.locator('.navigation-arrows-container');
    await expect(arrowsContainer).toBeAttached();
  });

  test('should have minimum touch target size on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    // Ensure right arrow is visible
    const scrollContainer = page.locator('[role="region"][aria-label="Scrollable star cards"]');
    await scrollContainer.evaluate((el) => {
      el.scrollLeft = 0;
    });
    
    await page.waitForTimeout(200);
    
    // Check button size
    const rightArrow = page.locator('button[aria-label="Navigate to next star"]');
    const box = await rightArrow.boundingBox();
    
    // Minimum 44x44px touch target
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('should display arrows on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    const arrowsContainer = page.locator('.navigation-arrows-container');
    await expect(arrowsContainer).toBeAttached();
  });

  test('should display arrows on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/');
    await page.waitForSelector('article[aria-label*="Star card"]', { timeout: 10000 });
    
    const arrowsContainer = page.locator('.navigation-arrows-container');
    await expect(arrowsContainer).toBeAttached();
  });
});
