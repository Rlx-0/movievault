import { useState, useEffect } from "react";
import { Movie } from "../../interface/movie";
import { MovieSearch } from "../MovieSearch/MovieSearch";
import { movieService } from "../../services/apiService";

interface EventDetailsProps {
  formData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    movie_options: number[];
  };
  onFormChange: (updates: Partial<typeof formData>) => void;
}

export const EventDetails = ({ formData, onFormChange }: EventDetailsProps) => {
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSelectedMovies = async () => {
      if (formData.movie_options.length === 0) return;

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
  }, []);

  const handleMovieSelect = async (movie: Movie) => {
    if (selectedMovies.length >= 5) {
      setError("Maximum of 5 movies can be selected");
      return;
    }

    if (selectedMovies.find((m) => m.id === movie.id)) {
      setError("This movie is already selected");
      return;
    }

    setSelectedMovies([...selectedMovies, movie]);
    onFormChange({
      movie_options: [...formData.movie_options, movie.id],
    });
    setError(null);
  };

  const handleRemoveMovie = (movieId: number) => {
    setSelectedMovies(selectedMovies.filter((m) => m.id !== movieId));
    onFormChange({
      movie_options: formData.movie_options.filter((id) => id !== movieId),
    });
    setError(null);
  };

  return (
    <div className="bg-darkGray rounded-lg p-6">
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

        <div className="space-y-4">
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
              className="w-full bg-black text-white p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-lightGray text-sm mb-1">Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => onFormChange({ time: e.target.value })}
              className="w-full bg-black text-white p-2 rounded"
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
