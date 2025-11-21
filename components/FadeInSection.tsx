import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface FadeInSectionProps {
    children: React.ReactNode;
    delay?: string; // e.g., "0s", "0.2s"
}

const FadeInSection: React.FC<FadeInSectionProps> = ({ children, delay = '0s' }) => {
    const { elementRef, isVisible } = useScrollAnimation();

    return (
        <div
            ref={elementRef}
            className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
            style={{ transitionDelay: delay }}
        >
            {children}
        </div>
    );
};

export default FadeInSection;
