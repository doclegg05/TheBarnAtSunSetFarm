import { expect, test, type Page } from '@playwright/test';
import { readHeadersFile } from '../headersFile';

// vite preview ignores public/_headers, so each page gets the live site's
// headers added here. Report-only policies still fire violation events, so a
// page that would break under the policy fails this test before it is enforced.
const siteHeaders = readHeadersFile().get('/*') ?? {};

const PAGES = [
  '/',
  '/gallery',
  '/virtual-tour',
  '/experience',
  '/no-such-page',
];

// Only this site's own pages get the headers; the map iframe is Google's page.
async function serveWithSiteHeaders(
  page: Page,
  baseURL: string | undefined
): Promise<void> {
  if (!baseURL) throw new Error('playwright.config.ts must set baseURL');
  const siteOrigin = new URL(baseURL).origin;
  await page.route(
    (url) => url.origin === siteOrigin,
    async (route) => {
      if (route.request().resourceType() !== 'document') {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: { ...response.headers(), ...siteHeaders },
      });
    }
  );
}

async function watchViolations(page: Page): Promise<string[]> {
  const violations: string[] = [];
  await page.exposeFunction('reportCspViolation', (text: string) =>
    violations.push(text)
  );
  await page.addInitScript({
    content: `document.addEventListener('securitypolicyviolation', (event) =>
      window.reportCspViolation(event.effectiveDirective + ' blocked ' + event.blockedURI));`,
  });
  return violations;
}

async function walkWholePage(page: Page): Promise<void> {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 900) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(500);
}

for (const path of PAGES) {
  test(`${path} loads under the content security policy`, async ({
    page,
    baseURL,
  }) => {
    await serveWithSiteHeaders(page, baseURL);
    const violations = await watchViolations(page);
    const response = await page.goto(path);
    expect(
      response?.headers()['content-security-policy-report-only']
    ).toBeTruthy();
    await walkWholePage(page);
    expect(violations).toEqual([]);
  });
}

test('the experience sound loads under the content security policy', async ({
  page,
  baseURL,
  isMobile,
}) => {
  test.skip(isMobile, 'covered on desktop; same button on phones');
  await serveWithSiteHeaders(page, baseURL);
  const violations = await watchViolations(page);
  await page.goto('/experience');
  const sound = page.getByRole('button', { name: 'Sound' });
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(1000);
  expect(violations).toEqual([]);
});
