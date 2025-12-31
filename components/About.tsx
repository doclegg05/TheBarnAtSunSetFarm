import React from 'react';
import Amenities from './Amenities';
import EventCoordination from './EventCoordination';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-[#FDF8F5]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4a4a4a]">A Venue As Unique As Your Love</h2>
          <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto"></div>
          <p className="mt-6 text-lg max-w-3xl mx-auto text-gray-600">
            Located just minutes from Summersville, WV and the New River Gorge, The Barn at Sunset Farm offers an affordable, rustic venue for weddings, elopements, and family reunions in the heart of Nicholas County. Our beautifully crafted barn blends rustic character with modern amenities, while our charming cottage provides a perfect retreat for you and your guests.
          </p>
        </div>

        {/* Main Barn Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-xl bg-gray-900 h-[400px]">
            {/* TICKET #010 FIX: Pointing to local file 'real-barn.png' */}
            <img
              src="/photos/real-barn.png"
              alt="Interior view of The Barn at Sunset Farm"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
              onError={(e) => {
                // Fallback if user hasn't uploaded the photo yet
                (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/EAD1DC/4a4a4a?text=Upload+real-barn.png';
              }}
            />
          </div>
          <div className="text-left">
            <h3 className="text-3xl font-semibold mb-4 text-[#4a4a4a]">The Main Barn</h3>
            <p className="text-gray-600 mb-4">
              With its soaring ceilings, exposed wooden beams, and grand chandeliers, the barn is a versatile space that can be transformed to match your vision. It comfortably accommodates up to 200 guests, featuring a spacious dance floor, and panoramic windows overlooking the farm.
            </p>
            <p className="text-gray-600">
              Whether you envision a rustic chic gathering or a formal black-tie affair, our barn provides the perfect canvas. The space is designed to flow seamlessly from your ceremony to cocktail hour and reception.
            </p>
          </div>
        </div>

        {/* Amenities Section */}
        <Amenities />

        {/* Cottages Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mt-20">
          <div className="text-left md:order-2">
            <h3 className="text-3xl font-semibold mb-4 text-[#4a4a4a]">Overnight Lodging Included</h3>
            <p className="text-gray-600 mb-4">
              Extend the celebration with an overnight stay in our beautifully appointed one bedroom cottage. Perfect for the wedding party or out-of-town guests, the cottage offers a peaceful sanctuary with modern comforts and picturesque views. Wake up to the serene sounds of the countryside.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>One bedroom cottage included</li>
              <li>Sleeps up to 15 guests (5 bedrooms in barn + 1 cottage)</li>
              <li>Fully equipped kitchens and living areas</li>
              <li>Private patios with scenic views</li>
            </ul>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl md:order-1 bg-gray-900 h-[400px]">
            {/* TICKET #010 FIX: Pointing to local file 'real-cottage.png' */}
            <img
              src="/photos/real-cottage.png"
              alt="Exterior view of the guest cottages"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
              onError={(e) => {
                // Fallback if user hasn't uploaded the photo yet
                (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/A2B29F/4a4a4a?text=Upload+real-cottage.png';
              }}
            />
          </div>
        </div>

        {/* Event Coordination Section */}
        <div className="mt-24 pt-12 border-t border-[#EAD1DC]">
          <EventCoordination />
        </div>

      </div>
    </section>
  );
};

export default About;