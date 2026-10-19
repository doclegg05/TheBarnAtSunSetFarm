import { expect, test, type Page } from '@playwright/test';

// Errors from third-party embeds (the map) or blocked networks are not ours.
const ignorable =
  /maps\.google|google\.com|ERR_|Failed to load resource|swiftshader|GPU stall|GroupMarkerNotSet/i;

const watchErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !ignorable.test(message.text())) {
      errors.push(message.text());
    }
  });
  return errors;
};

const SECTIONS = [
  'home',
  'about',
  'the-day',
  'inside',
  'barn',
  'stay',
  'packages',
  'planning',
  'explore',
  'faq',
  'contact',
];

test.describe('experience page', () => {
  test('loads every chapter without errors', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/experience');
    await expect(
      page.getByRole('heading', { level: 1, name: 'The Barn at Sunset Farm' })
    ).toBeVisible();
    for (const id of SECTIONS) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    // Walk the whole page so every scroll-driven effect runs once.
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 900) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(60);
    }
    await expect(page.locator('#contact form')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('shows no prices anywhere', async ({ page }) => {
    await page.goto('/experience');
    await expect(page.locator('body')).not.toContainText(/\$\s?\d/);
  });

  test('stays out of search results while it is a preview', async ({
    page,
  }) => {
    await page.goto('/experience');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex'
    );
  });

  test('nav jumps land on their sections', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the desktop nav is hidden on phones');
    await page.goto('/experience');
    await page.locator('header nav a[href="#packages"]').first().click();
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            Math.abs(
              document.getElementById('packages')!.getBoundingClientRect().top
            )
          ),
        { timeout: 6000 }
      )
      .toBeLessThan(4);
  });

  test('the curtain carries visitors to the gallery', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'the desktop nav is hidden on phones');
    await page.goto('/experience');
    await page.locator('header nav a[href="/gallery"]').first().click();
    await expect(page).toHaveURL(/\/gallery$/);
    await expect(
      page.getByRole('heading', { name: 'Our Gallery' })
    ).toBeVisible();
  });

  test('the sound button switches on and off', async ({ page, isMobile }) => {
    test.skip(isMobile, 'covered on desktop; same button on phones');
    await page.goto('/experience');
    const sound = page.getByRole('button', { name: 'Sound' });
    await expect(sound).toHaveAttribute('aria-pressed', 'false');
    await sound.click();
    await expect(sound).toHaveAttribute('aria-pressed', 'true');
    await sound.click();
    await expect(sound).toHaveAttribute('aria-pressed', 'false');
  });

  test('the walk into the barn loads only when near, then plays by scroll', async ({
    page,
  }) => {
    const errors = watchErrors(page);
    const frames = new Set<string>();
    page.on('request', (request) => {
      const url = request.url();
      if (/\/inside\/(sm|md)\/\d+\.avif$/.test(url)) frames.add(url);
    });
    await page.goto('/experience');
    await page.waitForTimeout(1000);
    // The poster frame is lazy and the film waits until its section is near.
    expect(frames.size).toBe(0);

    const film = page.locator('.xp-inside');
    const start = await film.evaluate((section) => {
      const spacer = section.parentElement?.classList.contains('pin-spacer')
        ? section.parentElement
        : section;
      return spacer.getBoundingClientRect().top + window.scrollY;
    });
    const height = await page.evaluate(() => window.innerHeight);
    await page.evaluate((top) => window.scrollTo(0, top), start);
    await expect.poll(() => frames.size, { timeout: 8000 }).toBeGreaterThan(60);

    // Near the end of the pin, the last caption has replaced the first.
    await page.evaluate((top) => window.scrollTo(0, top), start + height * 2.5);
    await expect(page.locator('.xp-inside-line').last()).toHaveCSS(
      'opacity',
      '1'
    );
    await expect(page.locator('.xp-inside-line').first()).toHaveCSS(
      'opacity',
      '0'
    );
    expect(errors).toEqual([]);
  });

  test('reduced motion gets a still, readable page', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = watchErrors(page);
    await page.goto('/experience');
    await expect(page.locator('.xp-reduced')).toHaveCount(1);
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await page.locator('#packages').scrollIntoViewIfNeeded();
    await expect(
      page.getByRole('heading', { name: 'Two ways to celebrate' })
    ).toBeVisible();
    await expect(page.locator('.xp-package').first()).toHaveCSS('opacity', '1');
    expect(errors).toEqual([]);
    await context.close();
  });
});

test('the classic home page is unchanged and error-free', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'The Barn at Sunset Farm' }).first()
  ).toBeVisible();
  await expect(page.locator('#packages')).toHaveCount(1);
  await expect(page.locator('.xp-root')).toHaveCount(0);
  expect(errors).toEqual([]);
});
