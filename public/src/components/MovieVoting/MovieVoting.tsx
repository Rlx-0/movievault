import { useState, useEffect } from "react";
import { movieService, eventService } from "../../services/apiService";
import { Movie } from "../../interface/movie";

interface MovieVotingProps {
  eventId: number;
  movieOptions: number[];
}

export const MovieVoting = ({ eventId, movieOptions }: MovieVotingProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [votes, setVotes] = useState<
    Record<number, { upvotes: number; downvotes: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMoviesAndVotes = async () => {
      try {
        setLoading(true);
        const moviePromises = movieOptions.map((id) =>
          movieService.getMovieDetails(id)
        );
        const moviesData = await Promise.all(moviePromises);
        setMovies(moviesData);

        const votesData = await eventService.getVoteResults(eventId);
        setVotes(votesData);
      } catch (err) {
        setError("Failed to load movies and votes");
      } finally {
        setLoading(false);
      }
    };

    fetchMoviesAndVotes();
  }, [eventId, movieOptions]);

  const handleVote = async (movieId: number, vote: boolean) => {
    try {
      await eventService.submitVote(eventId, { movie_id: movieId, vote });
      const updatedVotes = await eventService.getVoteResults(eventId);
      setVotes(updatedVotes);
    } catch (err) {
      setError("Failed to submit vote");
    }
  };

  if (loading) return <div className="text-white">Loading movies...</div>;
  if (error) return <div className="text-red">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl text-white font-bold">Movie Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="bg-black rounded-lg p-4 flex gap-4">
            <img
              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
              alt={movie.title}
              className="w-24 h-36 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="text-white font-bold">{movie.title}</h3>
              <p className="text-lightGray text-sm">
                {new Date(movie.release_date).getFullYear()}
              </p>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleVote(movie.id, true)}
                  className="text-green hover:text-green-light"
                >
                  👍 {votes[movie.id]?.upvotes || 0}
                </button>
                <button
                  onClick={() => handleVote(movie.id, false)}
                  className="text-red hover:text-red-light"
                >
                  👎 {votes[movie.id]?.downvotes || 0}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
