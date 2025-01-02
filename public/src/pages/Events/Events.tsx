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
import { useAuth } from "../../context/AuthContext";
import { PageTransition } from "../../components/Animation/PageTransition";
import Loading from "../../components/Animation/Loading";

export const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<IEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hosting" | "invited">("hosting");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { userId, userEmail } = useAuth();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEvents();
        setEvents(data as IEvent[]);
        setFilteredEvents(null);
        setSelectedDate(null);
      } catch (error) {
        setError("Failed to fetch events");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };

    fetchEvents();
  }, []);

  const hostedEvents = events.filter((event) => event.host?.id === userId);
  const invitedEvents = events.filter((event) => {
    if (!userEmail) {
      return false;
    }

    const isInvited = event.invitations?.some(
      (inv) =>
        inv.email.toLowerCase() === userEmail.toLowerCase() &&
        (inv.status === "pending" || inv.status === "accepted")
    );

    return isInvited;
  });

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

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await eventService.deleteEvent(eventId);
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (error) {
      setError("Failed to delete event");
    }
  };

  const displayEvents =
    filteredEvents || (activeTab === "hosting" ? hostedEvents : invitedEvents);

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-1 px-4 sm:px-12 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
            <div className="w-full sm:w-auto">
              <div className="flex justify-between sm:hidden items-center">
                <h1 className="text-2xl sm:text-3xl text-white font-bold">
                  Events
                </h1>
                <Link
                  to="/create-event"
                  className="bg-red hover:bg-red-light text-white p-2 rounded-full transition-colors"
                  aria-label="Create Event"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </Link>
              </div>

              {/* Desktop layout */}
              <div className="hidden sm:flex items-center gap-4 sm:gap-8">
                <h1 className="text-2xl sm:text-3xl text-white font-bold">
                  Events
                </h1>
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

              {/* Mobile tabs */}
              <div className="flex sm:hidden gap-2 mt-4">
                <button
                  className={`flex-1 px-2 py-2 text-white font-medium text-sm ${
                    activeTab === "hosting"
                      ? "border-b-2 border-red"
                      : "text-lightGray"
                  }`}
                  onClick={() => setActiveTab("hosting")}
                >
                  Host ({hostedEvents.length})
                </button>
                <button
                  className={`flex-1 px-2 py-2 text-white font-medium text-sm ${
                    activeTab === "invited"
                      ? "border-b-2 border-red"
                      : "text-lightGray"
                  }`}
                  onClick={() => setActiveTab("invited")}
                >
                  Inv ({invitedEvents.length})
                </button>
              </div>
            </div>

            {/* Desktop create event button */}
            <Link
              to="/create-event"
              className="create-event-btn bg-red hover:bg-red-light text-white px-4 py-2 rounded-full"
            >
              Create Event
            </Link>
          </div>

          {/* Mobile Calendar Toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={toggleCalendar}
              className="flex items-center gap-2 text-white bg-darkGray px-4 py-2 rounded-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  strokeWidth="2"
                />
                <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" />
              </svg>
              <span>
                {selectedDate ? selectedDate.toLocaleDateString() : "Calendar"}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Calendar and Upcoming Events - Hidden on mobile */}
            <div className="hidden md:block md:col-span-4 space-y-8">
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

            {/* Mobile Calendar Modal */}
            {isCalendarOpen && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 md:hidden">
                <div className="bg-darkGray rounded-lg p-4 w-full max-w-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white font-bold">Select Date</h2>
                    <button
                      onClick={toggleCalendar}
                      className="text-lightGray hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                  <Calendar
                    events={events}
                    onDateSelect={(date) => {
                      handleDateSelect(date);
                      setIsCalendarOpen(false);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Event List */}
            <div className="md:col-span-8">
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
                <div className="min-h-screen bg-black">
                  <Loading />
                </div>
              ) : !userId ? (
                <div className="bg-darkGray rounded-lg p-8 text-center">
                  <h2 className="text-2xl text-white font-bold mb-4">
                    Authentication Required
                  </h2>
                  <p className="text-lightGray mb-6">
                    Please log in to view and manage your events
                  </p>
                  <div className="space-y-4">
                    <Link
                      to="/login"
                      className="inline-block bg-red hover:bg-red-light text-white px-6 py-2 rounded-full transition-colors"
                    >
                      Login
                    </Link>
                    <p className="text-sm text-lightGray">
                      Don't have an account?{" "}
                      <Link
                        to="/register"
                        className="text-red hover:text-red-light"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-red text-center py-8">{error}</div>
              ) : displayEvents.length > 0 ? (
                <EventList
                  events={displayEvents}
                  onEventClick={handleEventClick}
                  onDeleteEvent={handleDeleteEvent}
                  currentUserId={userId || undefined}
                  loading={loading}
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
    </PageTransition>
  );
};
