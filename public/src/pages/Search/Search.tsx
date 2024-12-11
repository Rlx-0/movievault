import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { movieService } from "../../services/apiService";
import { MovieGrid } from "../../components/MovieGrid/MovieGrid";
import { FilterPanel } from "../../components/FilterPanel/FilterPanel";
import { Movie } from "../../interface/movie";

export const Search = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    setFilteredMovies(movies);
  }, [movies]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearchQuery(query);

    try {
      const data = await movieService.searchMovies(query);
      setMovies(data.results || []);
      if (!data.results?.length) {
        setError("No movies found matching your search");
      }
    } catch (error) {
      setError("Failed to search movies");
      console.error("Error searching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularMovies = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await movieService.getPopularMovies();
      setMovies(data.results || []);
      console.log(data.results);
    } catch (error) {
      setError("Failed to fetch popular movies");
      console.error("Error fetching popular movies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get("q");

    if (queryParam) {
      handleSearch(queryParam);
    } else {
      fetchPopularMovies();
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header onSearch={handleSearch} />
      <main className="flex-1 px-12 py-8">
        <div className="flex gap-8">
          <FilterPanel
            movies={movies}
            onFilterChange={setFilteredMovies}
            key={movies.length}
          />
          <div className="flex-1">
            <h2 className="text-2xl text-white font-bold mb-6">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : "Popular Movies"}
            </h2>
            {loading ? (
              <div className="text-white">Loading...</div>
            ) : error ? (
              <div className="text-red text-center py-8">{error}</div>
            ) : (
              <MovieGrid movies={filteredMovies} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
