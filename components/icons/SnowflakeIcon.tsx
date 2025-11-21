import React from 'react';

const SnowflakeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m-9-9h18m-2.929-7.071L7.071 17.071M19.071 17.071L4.929 4.929" />
        {/* Simple snowflake/asterisk */}
    </svg>
);

export default SnowflakeIcon;
