import React from 'react';
import {
  GOOGLE_MAPS_EMBED_URL,
  GOOGLE_MAPS_PIN_URL,
} from '../lib/venueLocation';

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
        src={GOOGLE_MAPS_EMBED_URL}
        className="w-full h-full"
        title="Map"
      ></iframe>
      <a
        href={GOOGLE_MAPS_PIN_URL}
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
