import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-[#FDF8F5]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4a4a4a]">A Venue As Unique As Your Love</h2>
          <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto"></div>
          <p className="mt-6 text-lg max-w-3xl mx-auto text-gray-600">
            Nestled in the heart of rolling hills, The Barn at Sunset Farm offers a breathtaking backdrop for your special day. Our meticulously restored black barn blends rustic character with modern amenities, while our charming cottages provide a perfect retreat for you and your guests.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-xl bg-gray-900">
            <img 
              src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=75&w=1200&auto=format&fit=crop" 
              alt="Elegant table setting inside the barn" 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
          </div>
          <div className="text-left">
            <h3 className="text-3xl font-semibold mb-4 text-[#4a4a4a]">The Main Barn</h3>
            <p className="text-gray-600 mb-4">
              With its soaring ceilings, exposed wooden beams, and grand chandeliers, the barn is a versatile space that can be transformed to match your vision. It comfortably accommodates up to 200 guests, featuring a spacious dance floor, a built-in bar, and panoramic windows overlooking the farm.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Capacity for 200 guests</li>
              <li>Climate-controlled for year-round comfort</li>
              <li>State-of-the-art sound system</li>
              <li>Bridal suite & Groom's quarters</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mt-20">
          <div className="text-left md:order-2">
            <h3 className="text-3xl font-semibold mb-4 text-[#4a4a4a]">Our Cozy Cottages</h3>
            <p className="text-gray-600 mb-4">
              Extend the celebration with an overnight stay in our beautifully appointed cottages. Perfect for the wedding party or out-of-town guests, each cottage offers a peaceful sanctuary with modern comforts and picturesque views. Wake up to the serene sounds of the countryside.
            </p>
             <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Five unique cottages available</li>
              <li>Sleeps up to 20 guests total</li>
              <li>Fully equipped kitchens and living areas</li>
              <li>Private patios with scenic views</li>
            </ul>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl md:order-1 bg-gray-900">
            <img 
              src="https://images.unsplash.com/photo-1449844908441-8829872d2607?q=75&w=1200&auto=format&fit=crop" 
              alt="Exterior of a charming cabin cottage at the venue" 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;