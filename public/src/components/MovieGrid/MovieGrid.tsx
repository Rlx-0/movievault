import { Movie } from "../../interface/movie";
import { Link } from "react-router-dom";
import { genreMap } from "../../config/movieFilters";
import placeholderImage from "../../img/Placeholder.png";

interface MovieGridProps {
  movies: Movie[];
  className?: string;
}

export const MovieGrid = ({ movies, className }: MovieGridProps) => {
  const getImageUrl = (path: string | null) => {
    if (!path) return placeholderImage;
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const getGenres = (genreIds: number[] | undefined) => {
    if (!genreIds) return "";
    return genreIds
      .map((id) => genreMap.get(id))
      .filter(Boolean)
      .slice(0, 2)
      .join(", ");
  };

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${
        className || ""
      }`}
    >
      {movies.map((movie) => (
        <Link
          key={movie.id}
          to={`/movie/${movie.id}`}
          className="transition-transform hover:scale-105"
        >
          <div className="aspect-[2/3] relative">
            <img
              src={getImageUrl(movie.poster_path)}
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = placeholderImage;
              }}
            />
          </div>
          <div className="p-3 sm:p-4">
            <h3
              className="text-white font-bold mb-2 truncate text-sm sm:text-base"
              title={movie.title}
            >
              {movie.title}
            </h3>
            <div
              className="text-lightGray text-xs sm:text-sm mb-2 truncate"
              title={getGenres(movie.genre_ids)}
            >
              {getGenres(movie.genre_ids)}
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-lightGray">
                {movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : "N/A"}
              </span>
              <span className="text-amber-500 font-medium">
                {movie.vote_average
                  ? `★ ${movie.vote_average.toFixed(1)}`
                  : "Not rated"}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
