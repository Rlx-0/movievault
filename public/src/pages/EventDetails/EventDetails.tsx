import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { eventService } from "../../services/apiService";
import { IEvent } from "../../interface/event";
import { MovieVoting } from "../../components/MovieVoting/MovieVoting";
import { formatDate } from "../../utils/dateFormatter";
import { PageTransition } from "../../components/Animation/PageTransition";

// Icon Components
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

interface Guest {
  id: number;
  name: string;
  status: "accepted" | "denied" | "pending";
}

export const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //TODO Mock guest data - replace with actual API call
  const guests: Guest[] = [
    { id: 1, name: "John Doe", status: "accepted" },
    { id: 2, name: "Jane Smith", status: "pending" },
    { id: 3, name: "Mike Johnson", status: "denied" },
  ];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEventById(Number(id));
        setEvent({
          ...data,
          host: data.host ?? null,
        });
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
            className="w-5 h-5 text-green-500"
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
      case "denied":
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
            className="w-5 h-5 text-yellow-500"
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
    return <div className="text-white">Loading...</div>;
  }

  if (error || !event) {
    return <div className="text-red">{error || "Event not found"}</div>;
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
              {/* Main Event Details */}
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
                      <p>Hosted by {event.host?.name}</p>
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

              {/* Guest List */}
              <div className="bg-darkGray rounded-lg p-8 h-fit">
                <h2 className="text-2xl text-white font-bold mb-6">
                  Guest List
                </h2>
                <div className="space-y-4">
                  {guests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between p-3 bg-black rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(guest.status)}
                        <span className="text-white">{guest.name}</span>
                      </div>
                      <span className="text-sm text-lightGray capitalize">
                        {guest.status}
                      </span>
                    </div>
                  ))}
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
