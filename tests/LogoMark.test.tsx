import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import LogoMark from '../components/LogoMark';

afterEach(() => cleanup());

describe('Sunset Barn logo mark', () => {
  it('is named for screen readers unless it sits beside the written name', () => {
    const { getByRole, container, rerender } = render(<LogoMark />);
    expect(getByRole('img', { name: 'The Barn at Sunset Farm' })).toBeTruthy();
    rerender(<LogoMark decorative />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe(
      'true'
    );
  });

  it('gives every mark on a page its own sun mask', () => {
    const { container } = render(
      <>
        <LogoMark />
        <LogoMark />
      </>
    );
    const masks = Array.from(container.querySelectorAll('mask'), (m) => m.id);
    expect(masks).toHaveLength(2);
    expect(new Set(masks).size).toBe(2);
    for (const circle of container.querySelectorAll('circle')) {
      expect(masks).toContain(circle.getAttribute('mask')!.slice(5, -1));
    }
  });

  it('drops the sun stripes and door braces at small sizes', () => {
    const { container, rerender } = render(<LogoMark />);
    const detailed = container.querySelectorAll('mask rect').length;
    rerender(<LogoMark simple />);
    expect(container.querySelectorAll('mask rect').length).toBeLessThan(
      detailed
    );
  });

  it('draws the barn in the surrounding text colour by default', () => {
    const { container } = render(<LogoMark />);
    expect(
      container.querySelector('path[fill-rule]')?.getAttribute('fill')
    ).toBe('currentColor');
  });
});
