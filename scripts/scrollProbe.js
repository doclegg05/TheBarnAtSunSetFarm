/**
 * Scroll probe for /experience: paste into the page's console (or run through
 * a browser tool). It scrolls the whole page top to bottom at a steady pace,
 * times every frame, and reports how long the page is and which sections
 * drop frames. Run it before and after a performance change and compare.
 *
 *   await window.__scrollProbe({ pxPerFrame: 40 })
 */
window.__scrollProbe = async ({ pxPerFrame = 40, settleMs = 600 } = {}) => {
  const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
  const sectionAt = () => {
    const probeY = window.innerHeight * 0.5;
    const sections = document.querySelectorAll(
      'main section[id], main > div, .xp-finale'
    );
    let name = 'unknown';
    for (const section of sections) {
      const box = section.getBoundingClientRect();
      if (box.top <= probeY && box.bottom > probeY) {
        name = section.id || section.className.split(' ')[0] || 'unnamed';
      }
    }
    return name;
  };

  const longFrames = [];
  let observer = null;
  if (
    PerformanceObserver.supportedEntryTypes?.includes('long-animation-frame')
  ) {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        longFrames.push({
          duration: Math.round(entry.duration),
          render: Math.round(
            entry.renderStart
              ? entry.startTime + entry.duration - entry.renderStart
              : 0
          ),
          layout: Math.round(
            entry.styleAndLayoutStart
              ? entry.startTime + entry.duration - entry.styleAndLayoutStart
              : 0
          ),
        });
      }
    });
    observer.observe({ type: 'long-animation-frame', buffered: false });
  }

  window.scrollTo(0, 0);
  await new Promise((resolve) => setTimeout(resolve, settleMs));
  const height = document.documentElement.scrollHeight;
  const screens = height / window.innerHeight;

  const deltas = [];
  const bySection = new Map();
  let last = performance.now();
  for (let y = 0; y <= height - window.innerHeight; y += pxPerFrame) {
    window.scrollTo(0, y);
    await frame();
    const now = performance.now();
    const delta = now - last;
    last = now;
    deltas.push(delta);
    const name = sectionAt();
    const stats = bySection.get(name) ?? { frames: 0, slow: 0, worst: 0 };
    stats.frames += 1;
    if (delta > 20) stats.slow += 1;
    stats.worst = Math.max(stats.worst, Math.round(delta));
    bySection.set(name, stats);
  }
  observer?.disconnect();

  const sorted = [...deltas].sort((a, b) => a - b);
  const pct = (p) =>
    Math.round(sorted[Math.floor((sorted.length - 1) * p)] * 10) / 10;
  return {
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    pageScreens: Math.round(screens * 10) / 10,
    frames: deltas.length,
    p50: pct(0.5),
    p95: pct(0.95),
    max: Math.round(sorted[sorted.length - 1]),
    slowShare: `${Math.round((deltas.filter((d) => d > 20).length / deltas.length) * 100)}%`,
    longAnimationFrames: longFrames.length,
    sections: Object.fromEntries(
      [...bySection].map(([name, s]) => [
        name,
        `${s.slow}/${s.frames} slow, worst ${s.worst}ms`,
      ])
    ),
  };
};
