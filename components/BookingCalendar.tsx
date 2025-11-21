import React, { useState } from 'react';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import { useBooking } from '../contexts/BookingContext';

const BOOKED_DATES = [
  '2024-08-17', '2024-08-24', '2024-09-07', '2024-09-14',
  '2024-09-21', '2024-10-05', '2024-10-12', '2024-10-26'
];

const BookingCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const { setSelectedDateRange } = useBooking();

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const isDateBooked = (date: Date) => BOOKED_DATES.includes(date.toISOString().split('T')[0]);
  const isDatePast = (date: Date) => date < new Date() && date.toDateString() !== new Date().toDateString();

  const handleDateClick = (date: Date) => {
    if (isDateBooked(date) || isDatePast(date)) return;

    const { start, end } = dateRange;

    if (!start || end) {
      setDateRange({ start: date, end: null });
    } else if (start && !end) {
      if (date < start) {
        setDateRange({ start: date, end: null });
        return;
      }

      let isRangeInvalid = false;
      const tempDate = new Date(start);
      tempDate.setDate(tempDate.getDate() + 1);
      while (tempDate <= date) {
        if (isDateBooked(tempDate)) {
          isRangeInvalid = true;
          break;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }

      if (isRangeInvalid) {
        setDateRange({ start: date, end: null });
      } else {
        setDateRange({ start, end: date });
        setHoveredDate(null);
      }
    }
  };

  const handleInquire = () => {
    setSelectedDateRange(dateRange);
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="border-r border-b border-gray-200"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const { start, end } = dateRange;

    const isBooked = isDateBooked(date);
    const isPast = isDatePast(date);
    const isDisabled = isBooked || isPast;

    const isStartDate = start?.toDateString() === date.toDateString();
    const isEndDate = end?.toDateString() === date.toDateString();
    const isInRange = start && end && date > start && date < end;

    let isHoveredInRange = false;
    if (start && !end && hoveredDate && date > start && date <= hoveredDate) {
      let isRangeInvalid = false;
      const tempDate = new Date(start);
      tempDate.setDate(tempDate.getDate() + 1);
      while (tempDate <= hoveredDate) {
        if (isDateBooked(tempDate)) {
          isRangeInvalid = true;
          break;
        }
        tempDate.setDate(tempDate.getDate() + 1);
      }
      if (!isRangeInvalid) {
        isHoveredInRange = true;
      }
    }

    let dayClasses = "h-24 md:h-32 text-center border-r border-b border-gray-200 flex flex-col items-center justify-center relative p-0";
    let contentWrapperClasses = "w-full h-full flex items-center justify-center transition-colors duration-200";

    if (isDisabled) {
      dayClasses += " bg-gray-100 text-gray-400 cursor-not-allowed";
    } else {
      dayClasses += " cursor-pointer";

      if ((start && end && (isInRange || isStartDate || isEndDate)) || isHoveredInRange) {
        dayClasses += " bg-[#EAD1DC] bg-opacity-30";
      }

      if (isStartDate && isEndDate) {
        contentWrapperClasses += " bg-[#EAD1DC] text-white rounded-full";
      } else if (start && !end && isStartDate) {
        contentWrapperClasses += " bg-[#EAD1DC] text-white rounded-full";
      } else if (isStartDate) {
        contentWrapperClasses += " bg-[#EAD1DC] text-white rounded-l-full";
      } else if (isEndDate) {
        contentWrapperClasses += " bg-[#EAD1DC] text-white rounded-r-full";
      } else if (!isInRange && !isHoveredInRange) {
        contentWrapperClasses += " hover:bg-[#EAD1DC] hover:bg-opacity-50 hover:rounded-full";
      }
    }

    days.push(
      <div
        key={day}
        className={dayClasses}
        onClick={() => handleDateClick(date)}
        onMouseEnter={() => !isDisabled && setHoveredDate(date)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        <div className={contentWrapperClasses}>
          <span className={`text-lg z-10 ${isStartDate || isEndDate ? 'text-white font-bold' : 'text-gray-700'}`}>{day}</span>
        </div>
        {isBooked && <span className="absolute bottom-2 text-xs text-red-500">Booked</span>}
      </div>
    );
  }

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <section id="calendar" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#4a4a4a]">Check Our Availability</h2>
          <div className="mt-4 w-24 h-1 bg-[#EAD1DC] mx-auto"></div>
          <p className="mt-6 text-lg max-w-3xl mx-auto text-gray-600">
            Select a start and end date for your event. Booked dates are marked.
          </p>
        </div>
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeftIcon className="w-6 h-6 text-[#4a4a4a]" />
            </button>

            <div className="flex items-center space-x-2">
              <select
                value={currentDate.getMonth()}
                onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                className="text-xl md:text-2xl font-semibold text-[#4a4a4a] bg-transparent border-none focus:ring-0 cursor-pointer hover:text-gray-600 transition-colors appearance-none pr-4"
                style={{ backgroundImage: 'none' }} // Remove default arrow for cleaner look if desired, or keep it
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                value={currentDate.getFullYear()}
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                className="text-xl md:text-2xl font-semibold text-[#4a4a4a] bg-transparent border-none focus:ring-0 cursor-pointer hover:text-gray-600 transition-colors appearance-none"
                style={{ backgroundImage: 'none' }}
              >
                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

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
        {dateRange.start && (
          <div className="text-center mt-8">
            <div className="text-xl space-y-2">
              <p>
                Start Date: <span className="font-bold text-[#A2B29F]">{formatDate(dateRange.start)}</span>
              </p>
              {dateRange.end && (
                <p>
                  End Date: <span className="font-bold text-[#A2B29F]">{formatDate(dateRange.end)}</span>
                </p>
              )}
            </div>
            {dateRange.start && dateRange.end && (
              <button
                onClick={handleInquire}
                className="mt-4 bg-[#A2B29F] text-white py-3 px-8 rounded-lg text-lg shadow-lg hover:bg-[#8c9a89] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Inquire for this Range
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default BookingCalendar;
