import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { eventService } from "../../services/apiService";
import { IEvent, Invitation } from "../../interface/event";
import { MovieVoting } from "../../components/MovieVoting/MovieVoting";
import { formatDate } from "../../utils/dateFormatter";
import { PageTransition } from "../../components/Animation/PageTransition";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Animation/Loading";

const CalendarIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
    <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" />
  </svg>
);

const LocationIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12z"
      strokeWidth="2"
    />
    <circle cx="12" cy="9" r="3" strokeWidth="2" />
  </svg>
);

const UsersIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
    <circle cx="9" cy="7" r="4" strokeWidth="2" />
    <path
      d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      strokeWidth="2"
    />
  </svg>
);

export const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guests, setGuests] = useState<Invitation[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setError("Authentication required");
      return;
    }
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEventById(Number(id));
        console.log("Event data: ", data);
        const eventData = data as IEvent;
        setEvent(eventData);
        if (eventData.invitations) {
          setGuests(eventData.invitations);
        }
      } catch (err) {
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <svg
            className="w-5 h-5 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "declined":
        return (
          <svg
            className="w-5 h-5 text-red"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l2 2"
            />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-darkGray p-8 rounded-lg max-w-md w-full text-center">
            <h2 className="text-2xl text-white font-bold mb-4">
              {!isAuthenticated ? "Authentication Required" : "Error"}
            </h2>
            <p className="text-lightGray mb-6">
              {!isAuthenticated
                ? "Please log in to view event details"
                : "Failed to load event details"}
            </p>
            {!isAuthenticated && (
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="inline-block bg-red hover:bg-red-light text-white px-6 py-2 rounded-full transition-colors"
                >
                  Log In
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
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-1 px-4 sm:px-8 lg:px-12 py-8">
          <div className="text-red">{error || "Event not found"}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-1 px-4 sm:px-8 lg:px-12 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl text-white font-bold mb-8">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-darkGray rounded-lg p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-lightGray">
                      <CalendarIcon />
                      <p>{formatDate(event.date)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-lightGray">
                      <LocationIcon />
                      <p>{event.location}</p>
                    </div>
                    <div className="flex items-center gap-3 text-lightGray">
                      <UsersIcon />
                      <p>
                        Hosted by{" "}
                        {event.host ? event.host.username : "Unknown Host"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description Box */}
                {event.description && (
                  <div className="bg-darkGray rounded-lg p-8">
                    <h2 className="text-2xl text-white font-bold mb-4">
                      Description
                    </h2>
                    <p className="text-lightGray">{event.description}</p>
                  </div>
                )}

                {/* Movie Voting Section */}
                <div className="bg-darkGray rounded-lg p-8">
                  <h2 className="text-2xl text-white font-bold mb-6">
                    Movie Options
                  </h2>
                  <MovieVoting
                    eventId={event.id}
                    movieOptions={event.movie_options}
                  />
                </div>
              </div>

              {/* Guest List - Now sticky on desktop */}
              <div className="lg:sticky lg:top-8 h-fit">
                <div className="bg-darkGray rounded-lg p-8">
                  <h2 className="text-2xl text-white font-bold mb-6">
                    Guest List
                  </h2>
                  <div className="space-y-3">
                    {guests.length > 0 ? (
                      guests.map((guest) => (
                        <div
                          key={guest.email}
                          className="flex items-center justify-between p-3 bg-black rounded-lg hover:bg-opacity-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {getStatusIcon(guest.status)}
                            <span className="text-white truncate">
                              {guest.email}
                            </span>
                          </div>
                          <span className="text-sm text-lightGray capitalize ml-3 flex-shrink-0">
                            {guest.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-lightGray text-sm">
                        No guests invited yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};
