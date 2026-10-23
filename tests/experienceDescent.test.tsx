import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Descent } from '../components/experience/descent';
import {
  CAPTIONS,
  coverPoint,
  HOTSPOTS,
} from '../components/experience/descentSpots';

afterEach(() => cleanup());

const FRAME = { width: 1024, height: 576 };

describe('coverPoint', () => {
  it('maps a frame point straight through when the box has the frame’s shape', () => {
    const point = coverPoint({ x: 512, y: 288 }, FRAME, {
      width: 2048,
      height: 1152,
    });
    expect(point).toEqual({ x: 1024, y: 576, visible: true });
  });

  it('crops the sides on a tall phone screen, as object-fit: cover does', () => {
    const box = { width: 390, height: 844 };
    const middle = coverPoint({ x: 512, y: 288 }, FRAME, box);
    expect(middle.x).toBeCloseTo(195);
    expect(middle.y).toBeCloseTo(422);
    expect(coverPoint({ x: 100, y: 288 }, FRAME, box).visible).toBe(false);
  });
});

describe('descent film content', () => {
  it('times its captions in order without overlapping', () => {
    for (let i = 1; i < CAPTIONS.length; i += 1) {
      expect(CAPTIONS[i].from).toBeGreaterThanOrEqual(CAPTIONS[i - 1].to);
    }
  });

  it('keeps every hotspot on the film’s last frame', () => {
    for (const spot of HOTSPOTS) {
      expect(spot.x).toBeGreaterThan(0);
      expect(spot.x).toBeLessThan(FRAME.width);
      expect(spot.y).toBeGreaterThan(0);
      expect(spot.y).toBeLessThan(FRAME.height);
    }
  });
});

describe('descent hotspots', () => {
  const renderDescent = () =>
    render(
      <MemoryRouter>
        <Descent />
      </MemoryRouter>
    );

  it('opens a real photo and closes again', () => {
    renderDescent();
    const [first] = HOTSPOTS;
    fireEvent.click(screen.getAllByRole('button', { name: first.label })[0]);
    const panel = screen.getByRole('dialog', { name: first.label });
    expect(panel.querySelector('img')?.getAttribute('alt')).toBe(first.alt);

    fireEvent.keyDown(panel, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('offers a way past the film', () => {
    renderDescent();
    expect(
      screen.getByRole('button', { name: 'Skip to the barn' })
    ).toBeTruthy();
  });

  it('names the venue in the page heading from the first frame', () => {
    renderDescent();
    expect(
      screen.getByRole('heading', { level: 1, name: 'The Barn at Sunset Farm' })
    ).toBeTruthy();
  });
});
