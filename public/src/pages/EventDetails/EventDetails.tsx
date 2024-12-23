import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { eventService } from "../../services/apiService";
import { IEvent } from "../../interface/event";
import { MovieVoting } from "../../components/MovieVoting/MovieVoting";
import { formatDate } from "../../utils/dateFormatter";

export const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEventById(Number(id));
        setEvent({
          ...data,
          host: data.host ?? null,
        });
      } catch (err) {
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error || !event) {
    return <div className="text-red">{error || "Event not found"}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      <main className="flex-1 px-12 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl text-white font-bold mb-4">{event.title}</h1>
          <div className="bg-darkGray rounded-lg p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-lightGray">{formatDate(event.date)}</p>
              <p className="text-lightGray">{event.location}</p>
              {event.description && (
                <p className="text-white mt-4">{event.description}</p>
              )}
            </div>

            <MovieVoting
              eventId={event.id}
              movieOptions={event.movie_options}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
