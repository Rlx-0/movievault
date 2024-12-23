import { useState } from "react";
import { IEvent } from "../../interface/event";
import { eventService } from "../../services/apiService";
import { formatDate } from "../../utils/dateFormatter";
import { VoteResults } from "../../interface/api";

interface EventCardProps {
  event: IEvent;
}

export const EventCard = ({ event }: EventCardProps) => {
  const [votes, setVotes] = useState<VoteResults>({});
  const [loading, setLoading] = useState(false);

  const handleVote = async (movieId: number, vote: boolean) => {
    try {
      setLoading(true);
      await eventService.submitVote(event.id, { movie_id: movieId, vote });
      const results = await eventService.getVoteResults(event.id);
      setVotes(results as VoteResults);
    } catch (error) {
      console.error("Failed to submit vote:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-darkGray rounded-lg p-6">
      <h3 className="text-xl text-white font-bold mb-4">{event.title}</h3>
      <div className="space-y-4">
        <div>
          <p className="text-lightGray text-sm">{formatDate(event.date)}</p>
          <p className="text-lightGray text-sm">{event.location}</p>
        </div>

        <div className="space-y-2">
          <h4 className="text-white font-bold">Movie Options</h4>
          {event.movie_options.map((movieId) => (
            <div key={movieId} className="flex items-center justify-between">
              <span className="text-lightGray">{movieId}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVote(movieId, true)}
                  disabled={loading}
                  className="text-green hover:text-green-light disabled:opacity-50"
                >
                  👍 {votes[movieId]?.upvotes || 0}
                </button>
                <button
                  onClick={() => handleVote(movieId, false)}
                  disabled={loading}
                  className="text-red hover:text-red-light disabled:opacity-50"
                >
                  👎 {votes[movieId]?.downvotes || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
