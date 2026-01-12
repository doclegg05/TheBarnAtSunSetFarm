

import React from 'react';

const GoogleMapEmbed: React.FC = () => {

    return (
        <div className="w-full h-full min-h-[400px] bg-gray-200 rounded-lg overflow-hidden shadow-xl relative group">
            <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src="https://maps.google.com/maps?q=19%20Boulder%20Trail%2C%20Mt.%20Nebo%2C%20WV&t=&z=13&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full"
                title="Map"
            ></iframe>
            <a
                href="https://www.google.com/maps/search/?api=1&query=19+Boulder+Trail,+Mt.+Nebo,+WV"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center"
            >
                <span className="sr-only">View on Google Maps</span>
            </a>
        </div>
    );
};

export default GoogleMapEmbed;
