import React from 'react';

const BookingCalendar: React.FC = () => {

  const handleInquire = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="calendar" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4a4a4a]">Check Availability</h2>
          <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto"></div>
          <p className="mt-6 text-lg max-w-3xl mx-auto text-gray-600">
            View our availability below. Please note that dates are subject to change.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden p-4 md:p-8 flex justify-center">
          <div className="w-full relative" style={{ paddingBottom: '75%', height: 0 }}>
             <iframe 
               src="https://calendar.google.com/calendar/embed?src=52a0469a73b4b4a5408374ad0608546d2f0ed6cb0dd69c3a0c72add874a2e3a4%40group.calendar.google.com&ctz=America%2FNew_York" 
               style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
               frameBorder="0" 
               scrolling="no"
               title="Google Calendar Availability"
             ></iframe>
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={handleInquire}
            className="bg-[#A2B29F] text-white py-3 px-8 rounded-lg text-lg shadow-lg hover:bg-[#8c9a89] active:scale-95 transition-all duration-200"
          >
            Inquire Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default BookingCalendar;
