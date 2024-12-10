import { Movie } from "../../interface/movie";

interface MovieGridProps {
  movies: Movie[];
}

export const MovieGrid = ({ movies }: MovieGridProps) => {
  const getImageUrl = (path: string | null) => {
    if (!path) return "https://via.placeholder.com/500x750?text=No+Image"; // Placeholder image TODO: Change this to a default image
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  return (
    <div className="grid grid-cols-5 gap-6">
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="bg-darkGray rounded-lg overflow-hidden hover:scale-105 transition-transform"
        >
          <img
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-64 object-cover"
          />
          <div className="p-4">
            <h3
              className="text-white font-bold mb-2 truncate"
              title={movie.title}
            >
              {movie.title}
            </h3>
            <div className="flex justify-between items-center">
              <p className="text-lightGray text-sm">
                {movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : "N/A"}
              </p>
              <span className="text-yellow-400">
                {movie.vote_average
                  ? `★ ${movie.vote_average.toFixed(1)}`
                  : "Not rated"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
