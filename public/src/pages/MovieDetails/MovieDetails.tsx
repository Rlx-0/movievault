import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Movie } from "../../interface/movie";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { movieService } from "../../services/apiService";
import { PageTransition } from "../../components/Animation/PageTransition";
import placeholderImage from "../../img/Placeholder.png";
import { genreMap } from "../../config/movieFilters";
import Loading from "../../components/Animation/Loading";

interface MovieCredits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}

export const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<MovieCredits | null>(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [movieData, creditsData] = await Promise.all([
          movieService.getMovieDetails(Number(id)),
          movieService.getMovieCredits(Number(id)),
        ]);
        setMovie(movieData);
        setCredits(creditsData);
      } catch (err) {
        setError("Failed to load movie details");
        console.error("Error fetching movie data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieData();
    }
  }, [id]);

  const getImageUrl = (path: string | null, size: string = "w500") => {
    if (!path) return placeholderImage;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const getGenres = (genreIds: number[] | undefined) => {
    if (!genreIds) return [];
    return genreIds.map((id) => genreMap.get(id)).filter(Boolean);
  };

  const formatRuntime = (minutes?: number) => {
    if (!minutes) return "Runtime unknown";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Release date unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDirector = () => {
    if (!credits?.crew) return null;
    return credits.crew.find((person) => person.job === "Director");
  };

  const getMainCast = () => {
    if (!credits?.cast) return [];
    return credits.cast.slice(0, 10);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Loading />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red">{error || "Movie not found"}</div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-black">
        <Header />

        {/* Backdrop Image */}
        <div
          className="w-full h-[40vh] relative bg-cover bg-center"
          style={{
            backgroundImage: movie.backdrop_path
              ? `url(${getImageUrl(movie.backdrop_path, "original")})`
              : "none",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        </div>

        <main className="flex-1 px-4 py-8 md:px-12 -mt-32 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Movie Poster */}
              <div className="w-full md:w-1/3 lg:w-1/4">
                <img
                  src={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = placeholderImage;
                  }}
                />
              </div>

              {/* Movie Details */}
              <div className="flex-1 movie-info">
                <h1 className="text-4xl text-white font-bold mb-4">
                  {movie.title}
                </h1>

                <div className="space-y-6">
                  {/* Key Details */}
                  <div className="flex flex-wrap items-center gap-4 text-lightGray">
                    <span>{formatDate(movie.release_date)}</span>
                    <span>•</span>
                    <span>{formatRuntime(movie.runtime)}</span>
                    {movie.vote_average && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="text-amber-500">★</span>
                          {movie.vote_average.toFixed(1)}/10
                        </span>
                      </>
                    )}
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2">
                    {getGenres(movie.genre_ids).map((genre) => (
                      <span
                        key={genre}
                        className="bg-darkGray px-3 py-1 rounded-full text-sm text-lightGray"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  {/* Overview */}
                  {movie.overview && (
                    <div>
                      <h2 className="text-xl text-white font-bold mb-2">
                        Overview
                      </h2>
                      <p className="text-lightGray leading-relaxed">
                        {movie.overview}
                      </p>
                    </div>
                  )}

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="space-y-2">
                      <h3 className="text-lg text-white font-bold">
                        Movie Details
                      </h3>
                      <p className="text-lightGray">
                        <span className="text-white font-medium">Status:</span>{" "}
                        {movie.status || "Unknown"}
                      </p>
                      <p className="text-lightGray">
                        <span className="text-white font-medium">
                          Original Language:
                        </span>{" "}
                        {movie.original_language?.toUpperCase() || "Unknown"}
                      </p>
                      {movie.budget && (
                        <p className="text-lightGray">
                          <span className="text-white font-medium">
                            Budget:
                          </span>{" "}
                          ${movie.budget.toLocaleString()}
                        </p>
                      )}
                      {movie.revenue && (
                        <p className="text-lightGray">
                          <span className="text-white font-medium">
                            Revenue:
                          </span>{" "}
                          ${movie.revenue.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg text-white font-bold">
                        Production Info
                      </h3>
                      {movie.production_companies && (
                        <p className="text-lightGray">
                          <span className="text-white font-medium">
                            Production Companies:
                          </span>{" "}
                          {movie.production_companies
                            .map((c) => c.name)
                            .join(", ")}
                        </p>
                      )}
                      {movie.production_countries && (
                        <p className="text-lightGray">
                          <span className="text-white font-medium">
                            Production Countries:
                          </span>{" "}
                          {movie.production_countries
                            .map((c) => c.name)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cast & Crew Section */}
          <div className="max-w-7xl mx-auto mt-12">
            {/* Director */}
            {getDirector() && (
              <div className="mb-8">
                <h2 className="text-2xl text-white font-bold mb-4">Director</h2>
                <div className="flex items-center gap-4">
                  {getDirector()?.profile_path && (
                    <img
                      src={getImageUrl(getDirector()!.profile_path)}
                      alt={getDirector()?.name}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = placeholderImage;
                      }}
                    />
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {getDirector()?.name}
                    </p>
                    <p className="text-lightGray text-sm">Director</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cast */}
            <div>
              <h2 className="text-2xl text-white font-bold mb-4">Top Cast</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {getMainCast().map((actor) => (
                  <div
                    key={actor.id}
                    className="bg-darkGray rounded-lg overflow-hidden transition-transform hover:scale-105"
                  >
                    <img
                      src={
                        actor.profile_path
                          ? getImageUrl(actor.profile_path, "w185")
                          : placeholderImage
                      }
                      alt={actor.name}
                      className="w-full aspect-[2/3] object-cover"
                      onError={(e) => {
                        e.currentTarget.src = placeholderImage;
                      }}
                    />
                    <div className="p-3">
                      <p className="text-white font-medium truncate">
                        {actor.name}
                      </p>
                      <p className="text-lightGray text-sm truncate">
                        {actor.character}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};
