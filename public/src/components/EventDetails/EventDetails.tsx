import { useState, useEffect } from "react";
import { Movie } from "../../interface/movie";
import { MovieSearch } from "../MovieSearch/MovieSearch";
import { movieService } from "../../services/apiService";
import Loading from "../../components/Animation/Loading";

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  movie_options: number[];
}

interface EventDetailsProps {
  formData: EventFormData;
  onFormChange: (updates: Partial<EventFormData>) => void;
  validationErrors?: Record<string, string>;
  className?: string;
}

export const EventDetails = ({
  formData,
  onFormChange,
  className,
}: EventDetailsProps) => {
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSelectedMovies = async () => {
      if (formData.movie_options.length === 0) {
        setSelectedMovies([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const moviePromises = formData.movie_options.map((id) =>
          movieService.getMovieDetails(id)
        );
        const movies = await Promise.all(moviePromises);
        setSelectedMovies(movies);
      } catch (error) {
        console.error("Failed to fetch selected movies:", error);
        setError("Failed to load selected movies");
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedMovies();
  }, [formData.movie_options]);

  const handleMovieSelect = (movie: Movie) => {
    if (!formData.movie_options.includes(movie.id)) {
      onFormChange({
        movie_options: [...formData.movie_options, movie.id],
      });
    }
  };

  const handleRemoveMovie = (movieId: number) => {
    onFormChange({
      movie_options: formData.movie_options.filter(
        (id: number) => id !== movieId
      ),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Loading />
      </div>
    );
  }

  return (
    <div className={`bg-darkGray rounded-lg p-6 ${className || ""}`}>
      <h2 className="text-2xl text-white font-bold mb-6">Event Details</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-lightGray text-sm mb-1">
            Event Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onFormChange({ title: e.target.value })}
            placeholder="Enter event title"
            className="w-full bg-black text-white p-2 rounded"
            required
          />
        </div>

        <div className="space-y-4 movie-selection">
          <h3 className="text-white font-bold mb-4">Selected Movies</h3>
          <MovieSearch onMovieSelect={handleMovieSelect} />
          {error && <p className="text-red text-sm">{error}</p>}
          <div className="space-y-2">
            {loading ? (
              <p className="text-lightGray">Loading selected movies...</p>
            ) : selectedMovies.length > 0 ? (
              selectedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center justify-between bg-black rounded p-2"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt={movie.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="text-white">{movie.title}</p>
                      <p className="text-sm text-lightGray">
                        {movie.release_date
                          ? new Date(movie.release_date).getFullYear()
                          : "Unknown year"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMovie(movie.id)}
                    className="text-red hover:text-red-light"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className="text-lightGray text-sm">No movies selected yet</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lightGray text-sm mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => onFormChange({ date: e.target.value })}
              className="w-full bg-black text-white p-2 rounded [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              required
            />
          </div>
          <div>
            <label className="block text-lightGray text-sm mb-1">Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => onFormChange({ time: e.target.value })}
              className="w-full bg-black text-white p-2 rounded [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-lightGray text-sm mb-1">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => onFormChange({ location: e.target.value })}
            placeholder="Enter location"
            className="w-full bg-black text-white p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-lightGray text-sm mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onFormChange({ description: e.target.value })}
            placeholder="Add a description for your event..."
            className="w-full bg-black text-white p-2 rounded h-32 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
