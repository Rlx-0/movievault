import { useState, useEffect } from "react";
import { IEvent } from "../../interface/event";
import { Movie } from "../../interface/movie";
import { movieService } from "../../services/apiService";
import { formatDate } from "../../utils/dateFormatter";
import Loading from "../Animation/Loading";

interface EventListProps {
  events: IEvent[];
  onEventClick: (eventId: number) => void;
  onDeleteEvent?: (eventId: number) => void;
  currentUserId?: number;
  loading?: boolean;
}

export const EventList = ({
  events,
  onEventClick,
  onDeleteEvent,
  currentUserId,
  loading,
}: EventListProps) => {
  const [movieDetails, setMovieDetails] = useState<Record<number, Movie>>({});

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieIds = [
          ...new Set(events.flatMap((event) => event.movie_options)),
        ];
        const details = await Promise.all(
          movieIds.map(async (id) => {
            const movie = await movieService.getMovieDetails(id);
            return [id, movie];
          })
        );
        setMovieDetails(Object.fromEntries(details));
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
      }
    };

    fetchMovieDetails();
  }, [events]);

  const handleDelete = async (e: React.MouseEvent, eventId: number) => {
    e.stopPropagation();
    if (onDeleteEvent) {
      onDeleteEvent(eventId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loading size="small" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          onClick={() => onEventClick(event.id)}
          className="bg-darkGray rounded-lg p-4 cursor-pointer hover:bg-opacity-80 relative"
        >
          {currentUserId === event.host?.id && onDeleteEvent && (
            <button
              onClick={(e) => handleDelete(e, event.id)}
              className="absolute top-4 right-4 text-lightGray hover:text-red transition-colors"
              aria-label="Delete event"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <div className="flex gap-4">
            {event.movie_options[0] && movieDetails[event.movie_options[0]] && (
              <img
                src={`https://image.tmdb.org/t/p/w92${
                  movieDetails[event.movie_options[0]].poster_path
                }`}
                alt={movieDetails[event.movie_options[0]].title}
                className="w-16 h-24 object-cover rounded"
              />
            )}
            <div>
              <h3 className="text-xl text-white font-bold mb-2">
                {event.title}
              </h3>
              <p className="text-lightGray">{formatDate(event.date)}</p>
              <p className="text-lightGray">{event.location}</p>
              <div className="flex gap-2 mt-2">
                {event.movie_options.slice(0, 3).map(
                  (movieId) =>
                    movieDetails[movieId] && (
                      <span key={movieId} className="text-sm text-white">
                        {movieDetails[movieId].title}
                      </span>
                    )
                )}
                {event.movie_options.length > 3 && (
                  <span className="text-sm text-lightGray">
                    +{event.movie_options.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
