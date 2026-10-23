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

const PAGES = [
  {
    path: '/experience',
    heading: 'The Barn at Sunset Farm',
    sections: ['arrive', 'barn', 'inside', 'next', 'contact'],
  },
  {
    path: '/experience/the-day',
    heading: 'From first look to last dance',
    sections: ['the-day', 'packages', 'planning', 'faq', 'contact'],
  },
  {
    path: '/experience/stay',
    heading: 'Sleep where you celebrate',
    sections: ['stay', 'explore', 'contact'],
  },
] as const;

/** Past this the story page has grown long again; move detail to a page. */
const MAX_STORY_SCREENS = 12;

test.describe('experience page', () => {
  for (const { path, heading, sections } of PAGES) {
    test(`${path} loads every chapter without errors`, async ({ page }) => {
      const errors = watchErrors(page);
      await page.goto(path);
      await expect(
        page.getByRole('heading', { level: 1, name: heading })
      ).toBeVisible();
      for (const id of sections) {
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
  }

  test('the story page stays a short scroll', async ({ page }) => {
    await page.goto('/experience');
    await page.waitForTimeout(1500);
    const screens = await page.evaluate(
      () => document.documentElement.scrollHeight / window.innerHeight
    );
    expect(screens).toBeLessThan(MAX_STORY_SCREENS);
  });

  test('a link to another page lands on its section', async ({ page }) => {
    await page.goto('/experience/stay');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sleep where you celebrate' })
    ).toBeVisible();
    // The phone menu is closed, so click the link the way a script would.
    await page
      .locator('a[href="/experience/the-day#faq"]')
      .first()
      .dispatchEvent('click');
    await expect(page).toHaveURL(/\/experience\/the-day#faq$/, {
      timeout: 15_000,
    });
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            Math.abs(
              document.getElementById('faq')!.getBoundingClientRect().top
            )
          ),
        { timeout: 8000 }
      )
      .toBeLessThan(4);
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
    await page.goto('/experience/the-day');
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

  // Smooth scrolling listens to touch with passive: false, which makes iOS
  // wait for script before every scroll step; touch screens scroll natively.
  test('smooth scrolling runs only with a mouse or trackpad', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/experience');
    await expect(
      page.getByRole('heading', { level: 1, name: 'The Barn at Sunset Farm' })
    ).toBeVisible();
    const html = page.locator('html');
    if (isMobile) {
      await page.waitForTimeout(1000);
      await expect(html).not.toHaveClass(/lenis/);
    } else {
      await expect(html).toHaveClass(/lenis/);
    }
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

  test('the films play on a tap and hold their last frame', async ({
    page,
  }) => {
    const errors = watchErrors(page);
    // Headless Chromium has no H.264, so playing is stubbed; the test drives
    // the film's end itself.
    await page.addInitScript(() => {
      HTMLMediaElement.prototype.play = () => Promise.resolve();
    });
    await page.goto('/experience');
    await expect(
      page.getByRole('button', { name: 'Play the arrival' })
    ).toBeVisible();

    const inside = page.locator('#inside');
    await inside.scrollIntoViewIfNeeded();
    const lines = inside.locator('[data-line]');
    // Before the tap the first line invites the visitor in. The lines fade
    // with a CSS transition, so check which one is meant to show, not a
    // sampled opacity that a busy test browser may not have reached yet.
    await expect(lines.first()).toHaveClass(/\bopacity-100\b/);
    await inside.getByRole('button', { name: 'Step inside' }).click();
    await inside
      .locator('video')
      .evaluate((video) => video.dispatchEvent(new Event('ended')));

    // At the end the last line holds on the last frame, with a replay.
    await expect(lines.last()).toHaveClass(/\bopacity-100\b/);
    await expect(lines.first()).toHaveClass(/\bopacity-0\b/);
    await expect(
      inside.getByRole('button', { name: 'Watch again' })
    ).toBeVisible();
    await expect(
      inside.locator(
        'img[src$="last-landscape.avif"], img[src$="last-portrait.avif"]'
      )
    ).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test('reduced motion gets a still, readable page', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = watchErrors(page);
    await page.goto('/experience/the-day');
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
  // The new brand stays on the experience pages until it is rolled out.
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    '/photos/sunset-willow-logo.webp'
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});
