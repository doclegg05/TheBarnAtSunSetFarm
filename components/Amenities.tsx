import React from 'react';
import { AMENITIES } from './amenityList';

const Amenities: React.FC = () => {
  return (
    <div className="mt-20">
      <h3 className="text-3xl font-semibold text-center text-brand-charcoal mb-12">
        Venue Amenities
      </h3>
      {/* flex-wrap with justify-center so an incomplete last row stays centered */}
      <div className="flex flex-wrap justify-center gap-8">
        {AMENITIES.map((item, index) => (
          <div
            key={index}
            className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)] bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="p-4 bg-brand-cream rounded-full mb-4">
              <item.icon className="w-8 h-8 text-brand-sage" />
            </div>
            <h4 className="text-xl font-bold text-brand-charcoal mb-2">
              {item.title}
            </h4>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Amenities;
