import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay, parseISO } from 'date-fns';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';
import './BookingCalendar.css'; // We will create this for custom styling

const BookingCalendar: React.FC = () => {
  const { bookedDates, loading, error } = useGoogleCalendar();

  // Helper to check if a date is booked
  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDateStr => {
      // Parse the 'YYYY-MM-DD' string from the hook treated as local date
      // We compare YYYY-MM-DD strings directly to avoid timezone issues
      const dateStr = format(date, 'yyyy-MM-dd');
      return bookedDateStr === dateStr;
    });
  };

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
            View our availability below. Days marked in <span className="text-[#EAD1DC] font-bold">pink</span> are already booked.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden p-6 md:p-12 flex flex-col items-center">
          {loading && <p className="text-gray-500 text-lg animate-pulse">Loading availability...</p>}
          {error && <p className="text-red-500">Unable to load calendar. Please contact us directly.</p>}

          {!loading && !error && (
            <div className="custom-calendar-wrapper w-full flex justify-center">
              <Calendar
                view="month"
                tileClassName={({ date, view }) => {
                  if (view === 'month') {
                    if (isDateBooked(date)) {
                      return 'booked-date';
                    }
                  }
                  return null;
                }}
                tileDisabled={({ date, view }) => {
                  // Disable text input/clicking for booked dates AND dates in the past
                  return view === 'month' && (isDateBooked(date) || date < new Date(new Date().setHours(0, 0, 0, 0)));
                }}
                minDate={new Date()} // Don't show past months
                next2Label={null} // Hide "next year" arrow for cleaner look
                prev2Label={null}
              />
            </div>
          )}

          <div className="mt-8 flex gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-gray-300 bg-white"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#EAD1DC] opacity-80"></div>
              <span className="text-gray-600">Booked</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={handleInquire}
            className="bg-[#A2B29F] text-white py-3 px-8 rounded-lg text-lg shadow-lg hover:bg-[#8c9a89] active:scale-95 transition-all duration-200"
          >
            Inquire About a Date
          </button>
        </div>
      </div>
    </section>
  );
};

export default BookingCalendar;
