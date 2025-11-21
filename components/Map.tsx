import React from 'react';

const Map: React.FC = () => {
    return (
        <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden shadow-xl">
            <iframe
                title="Map of The Barn at Sunset Farm"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=The+Barn+at+Sunset+Farm,Mount+Nebo,WV`}
            ></iframe>
            {/* Note: Since we don't have a real API key in this demo environment, 
          we'll use a standard embed URL that doesn't require a key for simple display 
          or fallback to a direct link if the embed is restricted. 
          
          Actually, for a public un-metered embed without an API key, we can use the /maps/embed?pb=... format 
          if we had the specific pb parameter. Since we don't, we can use the search query format 
          but it often requires an API key. 
          
          Alternative: Use the standard "maps?q=" output in an iframe which might refuse to connect, 
          or better yet, just a placeholder image with a link for this demo if we can't generate a valid keyless embed.
          
          However, the most reliable "free" embed often comes from the "Share -> Embed a map" flow 
          which generates a specific pb="..." string. 
          
          Let's try a generic search embed that works for many:
      */}
        </div>
    );
};

// Better approach for the demo without an API key:
// Use a direct link to Google Maps in a nice card, OR try to find a working embed URL.
// Given the constraints, I will use a standard iframe src that searches. 
// If it fails (gray screen), I will provide a fallback link.

const GoogleMapEmbed: React.FC = () => {
    // Using a known working embed structure for search queries often requires an API key.
    // For this demo, I will construct a "View on Google Maps" card with a static map image placeholder 
    // if I can't verify the embed works. 
    // BUT, let's try the standard embed first.

    // Actually, without a specific PB code, the best bet is a link. 
    // Let's try to simulate the embed with a generic one or just use a placeholder.

    return (
        <div className="w-full h-full min-h-[400px] bg-gray-200 rounded-lg overflow-hidden shadow-xl relative group">
            <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src="https://maps.google.com/maps?q=The%20Barn%20at%20Sunset%20Farm%2C%20Mount%20Nebo%2C%20WV&t=&z=13&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full"
                title="Map"
            ></iframe>
            <a
                href="https://www.google.com/maps/search/?api=1&query=The+Barn+at+Sunset+Farm,+Mount+Nebo,+WV"
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
