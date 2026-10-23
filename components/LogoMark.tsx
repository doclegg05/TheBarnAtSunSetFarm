import React from 'react';

/*
 * The Sunset Barn mark: the barn's silhouette against a half sun, from the
 * brand's master board (design/boards/LogoMark.dc.html). Geometry and
 * colours are copied from it; change them there first.
 */

const BARN =
  'M64 114 L100 58 L136 114 L130 114 L130 160 L70 160 L70 114 Z M67 120 L16 140 L20 140 L20 160 L67 160 Z M133 120 L184 140 L180 140 L180 160 L133 160 Z';
const BARN_WITH_OPENINGS =
  'M64 114 L100 58 L136 114 L130 114 L130 160 L70 160 L70 114 Z M86 127 H114 V160 H86 Z M92 88 H108 V107 H92 Z';
const WINGS =
  'M67 120 L16 140 L20 140 L20 160 L67 160 Z M133 120 L184 140 L180 140 L180 160 L133 160 Z';
const BRACES =
  'M100 127 V160 M86 127 L100 160 M100 127 L86 160 M114 127 L100 160 M100 127 L114 160 M100 88 V107';
const BRACES_SIMPLE = 'M100 127 V160 M100 88 V107';
/** The bands that cut across the sun, top to bottom. */
const SUN_STRIPES = [104, 117, 130];

interface LogoMarkProps {
  className?: string;
  /** The barn and ground line; follows the text colour by default. */
  ink?: string;
  /** Golden Hour by default. */
  sun?: string;
  /** Cedar by default, like the real barn doors. */
  door?: string;
  /** Leaves out the sun stripes and door braces, for small sizes. */
  simple?: boolean;
  /** True when the venue's name is written beside the mark. */
  decorative?: boolean;
}

const LogoMark: React.FC<LogoMarkProps> = ({
  className,
  ink = 'currentColor',
  sun = '#E6A35A',
  door = '#B8692F',
  simple = false,
  decorative = false,
}) => {
  const maskId = `bsf-sun-${React.useId().replace(/:/g, '')}`;
  const label = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img', 'aria-label': 'The Barn at Sunset Farm' };
  return (
    <svg viewBox="8 48 184 120" className={className} {...label}>
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="200"
          height="200"
        >
          <rect x="0" y="0" width="200" height="157" fill="#fff" />
          {!simple &&
            SUN_STRIPES.map((y) => (
              <rect key={y} x="0" y={y} width="200" height="4.5" fill="#000" />
            ))}
          <path
            d={BARN}
            fill="#000"
            stroke="#000"
            strokeWidth="7"
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <circle cx="100" cy="154" r="78" fill={sun} mask={`url(#${maskId})`} />
      <path fillRule="evenodd" fill={ink} d={BARN_WITH_OPENINGS} />
      <path fill={ink} d={WINGS} />
      <rect x="86" y="127" width="28" height="33" fill={door} />
      <rect x="92" y="88" width="16" height="19" fill={door} />
      <path
        d={simple ? BRACES_SIMPLE : BRACES}
        stroke={ink}
        strokeWidth={simple ? 3.4 : 2.2}
        fill="none"
      />
      <rect x="10" y="160" width="180" height="4.5" rx="2.25" fill={ink} />
    </svg>
  );
};

export default LogoMark;
