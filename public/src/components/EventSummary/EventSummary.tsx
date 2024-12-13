import { useEffect, useState } from "react";
import { Movie } from "../../interface/movie";
import { movieService } from "../../services/apiService";

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  movie_options: number[];
  guests: string[];
}

interface EventSummaryProps {
  formData: EventFormData;
  onCreateEvent: () => Promise<void>;
}

export const EventSummary = ({
  formData,
  onCreateEvent,
}: EventSummaryProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const moviePromises = formData.movie_options.map((id) =>
          movieService.getMovieDetails(id)
        );
        const movieResults = await Promise.all(moviePromises);
        if (isMounted) {
          setMovies(movieResults);
        }
      } catch (error) {
        if (isMounted) {
          setError("Failed to fetch movie details");
          console.error("Failed to fetch movie details:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (formData.movie_options.length > 0) {
      fetchMovies();
    } else {
      setMovies([]);
    }

    return () => {
      isMounted = false;
    };
  }, [formData.movie_options]);

  const isValid =
    formData.title.trim() !== "" &&
    formData.date !== "" &&
    formData.time !== "" &&
    formData.location.trim() !== "" &&
    formData.movie_options.length > 0 &&
    formData.guests.length > 0;

  const formatDate = (date: string, time: string) => {
    if (!date || !time) return "Not set";
    try {
      const datetime = new Date(`${date}T${time}`);
      return datetime.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const handleCreateEvent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onCreateEvent();
    } catch (error) {
      setError("Failed to create event. Please try again.");
      console.error("Failed to create event:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-darkGray rounded-lg p-6 sticky top-8">
      <h2 className="text-2xl text-white font-bold mb-6">Summary</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-white font-bold mb-2">Event Title</h3>
          <p className="text-lightGray text-sm">
            {formData.title || "Not set"}
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold mb-2">Movies</h3>
          {isLoading ? (
            <p className="text-lightGray text-sm">Loading movies...</p>
          ) : error ? (
            <p className="text-red text-sm">{error}</p>
          ) : (
            <div className="space-y-2">
              {movies.map((movie) => (
                <p key={movie.id} className="text-lightGray text-sm">
                  {movie.title} (
                  {movie.release_date
                    ? new Date(movie.release_date).getFullYear()
                    : "Unknown year"}
                  )
                </p>
              ))}
              {movies.length === 0 && (
                <p className="text-lightGray text-sm">No movies selected</p>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-white font-bold mb-2">Date & Time</h3>
          <p className="text-lightGray text-sm">
            {formatDate(formData.date, formData.time)}
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold mb-2">Location</h3>
          <p className="text-lightGray text-sm">
            {formData.location || "Not set"}
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold mb-2">Guests</h3>
          <div className="space-y-1">
            {formData.guests.map((guest) => (
              <p key={guest} className="text-lightGray text-sm">
                {guest}
              </p>
            ))}
            {formData.guests.length === 0 && (
              <p className="text-lightGray text-sm">No guests invited</p>
            )}
          </div>
        </div>

        <button
          onClick={handleCreateEvent}
          disabled={!isValid || isLoading}
          className={`w-full py-2 rounded transition-colors ${
            isValid && !isLoading
              ? "bg-red hover:bg-red-light text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Creating Event..." : "Create Event"}
        </button>
      </div>
    </div>
  );
};
