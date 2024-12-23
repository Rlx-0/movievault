import { useState, useCallback, useRef, useEffect } from "react";
import { Movie } from "../../interface/movie";
import { movieService } from "../../services/apiService";
import debounce from "lodash/debounce";
import { ApiError } from "../../interface/api";

interface MovieSearchProps {
  onMovieSelect: (movie: Movie) => void;
  error?: string;
  maxSelections?: number;
  currentSelections?: number[];
}

export const MovieSearch = ({
  onMovieSelect,
  error,
  maxSelections = 5,
  currentSelections = [],
}: MovieSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setSearchError(null);
        const data = await movieService.searchMovies(query);

        // Filter out already selected movies
        const filteredResults = data.results.filter(
          (movie) => !currentSelections.includes(movie.id)
        );

        setSearchResults(filteredResults || []);
      } catch (err) {
        const error = err as ApiError;
        if (error.name !== "AbortError") {
          setSearchError("Failed to search movies");
          console.error("Movie search error:", error);
        }
      } finally {
        setLoading(false);
      }
    }, 300),
    [currentSelections]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSelect = (movie: Movie) => {
    if (currentSelections.length >= maxSelections) {
      setSearchError(`Cannot select more than ${maxSelections} movies`);
      return;
    }
    onMovieSelect(movie);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search for movies..."
        className="w-full bg-black text-white p-2 rounded"
        disabled={currentSelections.length >= maxSelections}
      />

      {error && <p className="text-red text-sm">{error}</p>}
      {currentSelections.length >= maxSelections && (
        <p className="text-yellow-500 text-sm">
          Maximum number of movies selected ({maxSelections})
        </p>
      )}

      {loading ? (
        <p className="text-lightGray">Searching...</p>
      ) : searchError ? (
        <p className="text-red">{searchError}</p>
      ) : searchResults.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {searchResults.map((movie) => (
            <div
              key={movie.id}
              onClick={() => handleSelect(movie)}
              className="flex items-center gap-2 bg-black p-2 rounded cursor-pointer hover:bg-opacity-50"
            >
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                    : "/placeholder-movie.png"
                }
                alt={movie.title}
                className="w-12 h-16 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-movie.png";
                }}
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
          ))}
        </div>
      ) : (
        searchQuery && <p className="text-lightGray">No movies found</p>
      )}
    </div>
  );
};
