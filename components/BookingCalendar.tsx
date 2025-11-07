import React, { useState } from 'react';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

const BOOKED_DATES = [
  '2024-08-17', '2024-08-24', '2024-09-07', '2024-09-14',
  '2024-09-21', '2024-10-05', '2024-10-12', '2024-10-26'
];

const BookingCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="border-r border-b border-gray-200"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    const isBooked = BOOKED_DATES.includes(dateString);
    const isSelected = selectedDate?.toDateString() === date.toDateString();
    const isPast = date < new Date() && date.toDateString() !== new Date().toDateString();

    let dayClasses = "p-2 h-24 md:h-32 text-center border-r border-b border-gray-200 transition-colors duration-300 flex flex-col items-center justify-center";
    if (isPast || isBooked) {
      dayClasses += " bg-gray-100 text-gray-400 cursor-not-allowed";
    } else {
      dayClasses += " cursor-pointer hover:bg-[#EAD1DC] hover:bg-opacity-50";
    }
    if (isSelected) {
      dayClasses += " bg-[#EAD1DC] text-white font-bold";
    }
    
    days.push(
      <div 
        key={day} 
        className={dayClasses}
        onClick={() => !(isBooked || isPast) && setSelectedDate(date)}
      >
        <span className={`text-lg ${isSelected ? 'text-white' : 'text-gray-700'}`}>{day}</span>
        {isBooked && <span className="text-xs mt-1 text-red-500">Booked</span>}
      </div>
    );
  }

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <section id="calendar" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4a4a4a]">Check Our Availability</h2>
          <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto"></div>
          <p className="mt-6 text-lg max-w-3xl mx-auto text-gray-600">
            Your dream date awaits. Browse our calendar for available dates. Saturdays are highlighted. Booked dates are marked.
          </p>
        </div>
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeftIcon className="w-6 h-6 text-[#4a4a4a]" />
            </button>
            <h3 className="text-2xl md:text-3xl font-semibold text-[#4a4a4a]">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronRightIcon className="w-6 h-6 text-[#4a4a4a]" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center font-semibold text-gray-600">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 border-b-2 border-gray-200">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-5">{days}</div>
        </div>
        {selectedDate && (
          <div className="text-center mt-8">
            <p className="text-xl">You've selected: <span className="font-bold text-[#A2B29F]">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
            <button className="mt-4 bg-[#A2B29F] text-white py-3 px-8 rounded-lg text-lg hover:bg-opacity-90 transition-all duration-300 shadow-lg">
              Inquire for this Date
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookingCalendar;
