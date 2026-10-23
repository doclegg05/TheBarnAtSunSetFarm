import React from 'react';

/*
 * The brand (design/) goes on the experience pages first; the classic site
 * keeps its own icon and fonts. So the experience pages add the Sunset Barn
 * icons and the semibold heading weight to the page head while they are
 * open, and put the classic ones back when the visitor leaves.
 */

const BRAND_ICON = '/favicon.svg';
const TOUCH_ICON = '/apple-touch-icon.png';
const HEADING_WEIGHT =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap';

const addLink = (attributes: Readonly<Record<string, string>>) => {
  const link = document.createElement('link');
  for (const [name, value] of Object.entries(attributes)) {
    link.setAttribute(name, value);
  }
  document.head.appendChild(link);
  return link;
};

/** Swaps the tab icon to the Sunset Barn mark; returns how to undo it. */
const swapIcon = (): (() => void) => {
  const icon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!icon) {
    const added = addLink({
      rel: 'icon',
      type: 'image/svg+xml',
      href: BRAND_ICON,
    });
    return () => added.remove();
  }
  const href = icon.getAttribute('href');
  const type = icon.getAttribute('type');
  icon.setAttribute('href', BRAND_ICON);
  icon.setAttribute('type', 'image/svg+xml');
  return () => {
    if (href === null) icon.removeAttribute('href');
    else icon.setAttribute('href', href);
    if (type === null) icon.removeAttribute('type');
    else icon.setAttribute('type', type);
  };
};

export const useBrandHead = () => {
  React.useEffect(() => {
    const restoreIcon = swapIcon();
    const added = [
      addLink({ rel: 'apple-touch-icon', href: TOUCH_ICON }),
      addLink({ rel: 'stylesheet', href: HEADING_WEIGHT }),
    ];
    return () => {
      restoreIcon();
      for (const link of added) link.remove();
    };
  }, []);
};
