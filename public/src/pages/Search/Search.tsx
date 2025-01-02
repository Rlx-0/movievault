import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { movieService } from "../../services/apiService";
import { MovieGrid } from "../../components/MovieGrid/MovieGrid";
import { FilterPanel } from "../../components/FilterPanel/FilterPanel";
import { Movie } from "../../interface/movie";
import { PageTransition } from "../../components/Animation/PageTransition";

export const Search = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    const stateQuery = location.state?.searchQuery;

    if (queryParam) {
      setSearchQuery(queryParam);
      handleSearch(queryParam);
    } else if (stateQuery) {
      setSearchQuery(stateQuery);
      handleSearch(stateQuery);
    } else {
      setSearchQuery("");
      fetchPopularMovies();
    }
  }, [location]);

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-1 px-4 md:px-12 py-8">
          <div className="md:hidden mb-4">
            <button
              onClick={toggleFilter}
              className="flex items-center gap-2 text-white bg-darkGray px-4 py-2 rounded-lg"
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>Filters</span>
            </button>
          </div>

          <div className="flex gap-8">
            <div className="hidden md:block sticky top-8 self-start filter-section">
              <FilterPanel
                movies={movies}
                onFilterChange={setFilteredMovies}
                key={movies.length}
              />
            </div>

            {isFilterOpen && (
              <div
                className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 md:hidden"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsFilterOpen(false);
                  }
                }}
              >
                <div
                  className="bg-darkGray rounded-lg p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto sticky top-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white font-bold">Filters</h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFilterOpen(false);
                      }}
                      className="text-lightGray hover:text-white text-xl px-2"
                    >
                      X
                    </button>
                  </div>
                  <FilterPanel
                    movies={movies}
                    onFilterChange={(filtered) => {
                      setFilteredMovies(filtered);
                    }}
                    key={movies.length}
                  />
                </div>
              </div>
            )}

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
    </PageTransition>
  );
};
