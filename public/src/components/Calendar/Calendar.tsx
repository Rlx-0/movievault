import { useState } from "react";
import { IEvent } from "../../interface/event";

interface CalendarProps {
  events: IEvent[];
  onDateSelect: (date: Date) => void;
}

export const Calendar = ({ events, onDateSelect }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const getDayEvents = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  return (
    <div className="bg-darkGray rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="text-white">
          ←
        </button>
        <h2 className="text-xl text-white font-bold">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button onClick={handleNextMonth} className="text-white">
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-lightGray p-2">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="p-2" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayEvents = getDayEvents(day);
          return (
            <div
              key={day}
              onClick={() =>
                onDateSelect(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  )
                )
              }
              className={`p-2 text-center cursor-pointer relative ${
                dayEvents.length > 0 ? "bg-red bg-opacity-20" : ""
              }`}
            >
              <span className="text-white">{day}</span>
              {dayEvents.length > 0 && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
