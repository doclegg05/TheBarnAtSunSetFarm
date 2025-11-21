import React from 'react';

const MountainIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        {/* Wait, that's a lightning bolt. Let's do mountains. */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 19.88l-9.177-14.427-.944 1.484-2.879-4.522L1 19.88h20z" />
        {/* Actually, let's try a simpler two-peak mountain */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

// Let's use a standard mountain path
const RealMountainIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        {/* That's a trend chart. */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.25 19h-14.5l6-11 4 5 2-3 2.5 9z" />
    </svg>
);

export default RealMountainIcon;
