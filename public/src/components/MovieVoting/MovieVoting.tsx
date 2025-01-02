import { useState, useEffect } from "react";
import { movieService, eventService } from "../../services/apiService";
import { Movie } from "../../interface/movie";
import { VoteResults } from "../../interface/api";

interface MovieVotingProps {
  eventId: number;
  movieOptions: number[];
}

export const MovieVoting = ({ eventId, movieOptions }: MovieVotingProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [votes, setVotes] = useState<VoteResults>({});
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
        setVotes(votesData as VoteResults);
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
      setVotes(updatedVotes as VoteResults);
    } catch (err) {
      setError("Failed to submit vote");
    }
  };

  const getYear = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).getFullYear();
  };

  const VoteIcon = ({ type }: { type: "up" | "down" }) => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {type === "up" ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      )}
    </svg>
  );

  if (loading) return <div className="text-white">Loading movies...</div>;
  if (error) return <div className="text-red">{error}</div>;

  return (
    <div
      className="space-y-6 movie-options"
      data-intro="Vote on movie options for the event"
    >
      <div className="grid grid-cols-1 gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="bg-black rounded-lg p-4">
            <div className="flex items-center gap-4">
              <img
                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                alt={movie.title}
                className="w-16 h-24 object-cover rounded shadow-lg"
              />

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium">{movie.title}</h3>
                  <span className="text-sm text-lightGray">
                    ({getYear(movie.release_date)})
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleVote(movie.id, true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 ${
                      votes[movie.id]?.upvotes
                        ? "bg-emerald-400 text-white"
                        : "bg-black border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
                    }`}
                  >
                    <VoteIcon type="up" />
                    <span className="font-medium">
                      {votes[movie.id]?.upvotes || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => handleVote(movie.id, false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 ${
                      votes[movie.id]?.downvotes
                        ? "bg-red text-white"
                        : "bg-black border border-red/30 text-red hover:bg-red/10"
                    }`}
                  >
                    <VoteIcon type="down" />
                    <span className="font-medium">
                      {votes[movie.id]?.downvotes || 0}
                    </span>
                  </button>

                  <span className="text-sm text-lightGray self-center ml-2">
                    {(votes[movie.id]?.upvotes || 0) +
                      (votes[movie.id]?.downvotes || 0)}{" "}
                    votes
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
