import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IEvent } from "../../interface/event";
import { eventService, movieService } from "../../services/apiService";
import { Movie } from "../../interface/movie";
import placeholderImage from "../../img/Placeholder.png";
import { useAuth } from "../../context/AuthContext";

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

const ClockIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="9" strokeWidth="2" />
    <path d="M12 7v5l3 3" strokeWidth="2" />
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

export const NextEvent = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [nextEvent, setNextEvent] = useState<IEvent | null>(null);
  const [movieDetails, setMovieDetails] = useState<Record<number, Movie>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNextEvent = async () => {
      try {
        setLoading(true);
        const events = await eventService.getEvents();

        const futureEvents = events
          .filter((event) => new Date(event.date) >= new Date())
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        if (futureEvents.length > 0) {
          setNextEvent(futureEvents[0] as IEvent);

          // Fetch movie details if there are movie options
          if (futureEvents[0].movie_options.length > 0) {
            const movieIds = futureEvents[0].movie_options;
            const details = await Promise.all(
              movieIds.map(async (id) => {
                const movie = await movieService.getMovieDetails(id);
                return [id, movie];
              })
            );
            setMovieDetails(Object.fromEntries(details));
          }
        }
      } catch (err) {
        setError("Failed to load next event");
      } finally {
        setLoading(false);
      }
    };

    fetchNextEvent();
  }, []);

  const handleClick = () => {
    if (nextEvent) {
      navigate(`/events/${nextEvent.id}`);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: date.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
        }),
      };
    } catch {
      return { date: "Invalid date", time: "Invalid time" };
    }
  };

  if (loading) {
    return (
      <div className="bg-darkGray bg-opacity-90 p-8 lg:p-16 rounded-3xl w-[90%] lg:w-auto lg:min-w-[42rem] max-w-3xl mx-auto lg:mx-0 text-center">
        <h2 className="text-3xl lg:text-5xl text-white font-bold mb-8">
          Next Event
        </h2>
        <p className="text-2xl lg:text-3xl text-lightGray">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-darkGray bg-opacity-90 p-8 lg:p-16 rounded-3xl w-[90%] lg:w-auto lg:min-w-[42rem] max-w-3xl mx-auto lg:mx-0 text-center next-event">
        <h2 className="text-3xl lg:text-5xl text-white font-bold mb-8">
          Next Event
        </h2>
        {!isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-xl lg:text-2xl text-lightGray">
              Please log in to view your upcoming events
            </p>
            <Link
              to="/login"
              className="inline-block bg-red hover:bg-red-light text-white px-6 py-2 rounded-full transition-colors"
            >
              Log In
            </Link>
          </div>
        ) : (
          <p className="text-xl lg:text-2xl text-red">{error}</p>
        )}
      </div>
    );
  }

  if (!nextEvent) {
    return (
      <div className="bg-darkGray bg-opacity-90 p-8 lg:p-16 rounded-3xl w-[90%] lg:w-auto lg:min-w-[42rem] max-w-3xl mx-auto lg:mx-0 text-center next-event">
        <h2 className="text-3xl lg:text-5xl text-white font-bold mb-8">
          Next Event
        </h2>
        <p className="text-2xl lg:text-3xl text-lightGray">
          <span className="inline-block mr-2">📅</span>
          You have no upcoming events
        </p>
      </div>
    );
  }

  const firstMovieId = nextEvent.movie_options[0];
  const firstMovie = firstMovieId ? movieDetails[firstMovieId] : null;

  return (
    <div
      className="bg-darkGray bg-opacity-90 p-8 lg:p-16 rounded-3xl w-[90%] lg:w-auto lg:min-w-[42rem] max-w-3xl mx-auto lg:mx-0 text-center cursor-pointer hover:bg-opacity-100 transition-all duration-300 next-event"
      onClick={handleClick}
    >
      <h2 className="text-3xl lg:text-5xl text-white font-bold mb-8">
        Next Event
      </h2>
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {firstMovie && (
          <div className="mx-auto lg:mx-0">
            <img
              src={`https://image.tmdb.org/t/p/w500${firstMovie.poster_path}`}
              alt={firstMovie.title}
              className="w-36 lg:w-48 h-54 lg:h-72 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.src = placeholderImage;
              }}
            />
          </div>
        )}
        <div className="space-y-4 lg:space-y-6 text-center lg:text-left flex-1">
          <h3 className="text-2xl lg:text-4xl text-white font-bold">
            {nextEvent.title}
          </h3>

          <div className="flex items-center justify-center lg:justify-start gap-3 text-xl lg:text-2xl text-lightGray">
            <CalendarIcon />
            <span>{formatDateTime(nextEvent.date).date}</span>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-3 text-lg lg:text-xl text-lightGray">
            <ClockIcon />
            <span>{formatDateTime(nextEvent.date).time}</span>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-3 text-lg lg:text-xl text-lightGray">
            <LocationIcon />
            <span>{nextEvent.location}</span>
          </div>

          {nextEvent.guests && (
            <div className="flex items-center justify-center lg:justify-start gap-3 text-base lg:text-lg text-lightGray">
              <UsersIcon />
              <span>
                {nextEvent.guests.length}{" "}
                {nextEvent.guests.length === 1 ? "guest" : "guests"}
              </span>
            </div>
          )}

          {nextEvent.description && (
            <p className="text-base lg:text-lg text-lightGray mt-4">
              {nextEvent.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
