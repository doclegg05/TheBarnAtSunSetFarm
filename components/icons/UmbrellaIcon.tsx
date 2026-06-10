import React from 'react';

const UmbrellaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9m0-9v9m0 0a3 3 0 01-3-3"
    />
  </svg>
);

export default UmbrellaIcon;
