import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { EventList } from "../../components/EventList/EventList";
import { Calendar } from "../../components/Calendar/Calendar";
import { eventService } from "../../services/apiService";
import { IEvent } from "../../interface/event";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/dateFormatter";

export const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<IEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hosting" | "invited">("hosting");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEvents();
        setEvents(data);
      } catch (err) {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const hostedEvents = events.filter((event) => event.host !== null);
  const invitedEvents = events.filter((event) => event.host === null);

  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const handleEventClick = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const filtered = events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
    setFilteredEvents(filtered);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
    setFilteredEvents(null);
  };

  const displayEvents =
    filteredEvents || (activeTab === "hosting" ? hostedEvents : invitedEvents);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-1 px-12 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl text-white font-bold">Events</h1>
            <div className="flex gap-4">
              <button
                className={`px-4 py-2 text-white font-medium ${
                  activeTab === "hosting"
                    ? "border-b-2 border-red"
                    : "text-lightGray"
                }`}
                onClick={() => setActiveTab("hosting")}
              >
                Hosting ({hostedEvents.length})
              </button>
              <button
                className={`px-4 py-2 text-white font-medium ${
                  activeTab === "invited"
                    ? "border-b-2 border-red"
                    : "text-lightGray"
                }`}
                onClick={() => setActiveTab("invited")}
              >
                Invited ({invitedEvents.length})
              </button>
            </div>
          </div>
          <Link
            to="/create-event"
            className="bg-red hover:bg-red-light text-white px-6 py-2 rounded-full transition-colors"
          >
            Create Event
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left column - Calendar and Upcoming Events */}
          <div className="col-span-4 space-y-8">
            <Calendar events={events} onDateSelect={handleDateSelect} />

            <div className="bg-darkGray rounded-lg p-6">
              <h2 className="text-xl text-white font-bold mb-4">
                Upcoming Events
              </h2>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className="flex items-center gap-2 cursor-pointer hover:bg-black hover:bg-opacity-30 p-2 rounded"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-medium">
                          {event.title}
                        </h3>
                        <p className="text-sm text-lightGray">
                          {formatDate(event.date)}
                        </p>
                      </div>
                      <span className="text-lightGray">→</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-lightGray">No upcoming events</p>
              )}
            </div>
          </div>

          {/* Right column - Event List */}
          <div className="col-span-8">
            {selectedDate && (
              <div className="flex justify-between items-center mb-4">
                <p className="text-white">
                  Events for {selectedDate.toLocaleDateString()}
                </p>
                <button
                  onClick={clearDateFilter}
                  className="text-lightGray hover:text-white"
                >
                  Clear filter
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-white text-center py-8">
                Loading events...
              </div>
            ) : error ? (
              <div className="text-red text-center py-8">{error}</div>
            ) : displayEvents.length > 0 ? (
              <EventList
                events={displayEvents}
                onEventClick={handleEventClick}
              />
            ) : (
              <div className="text-lightGray text-center py-8">
                {selectedDate
                  ? "No events scheduled for this date"
                  : `No ${
                      activeTab === "hosting" ? "hosted" : "invited"
                    } events`}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
