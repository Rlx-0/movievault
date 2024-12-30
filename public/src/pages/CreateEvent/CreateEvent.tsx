import { useState } from "react";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { EventDetails } from "../../components/EventDetails/EventDetails";
import { GuestList } from "../../components/GuestList/GuestList";
import { EventSummary } from "../../components/EventSummary/EventSummary";
import { eventService } from "../../services/apiService";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "../../components/Animation/PageTransition";

interface EventForm {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  movie_options: number[];
  guests: string[];
}

export const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EventForm>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    movie_options: [],
    guests: [],
  });

  const handleFormChange = (updates: Partial<EventForm>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    try {
      const eventData = {
        title: formData.title,
        description: formData.description || "",
        date: new Date(`${formData.date}T${formData.time}`).toISOString(),
        location: formData.location,
        movie_options: formData.movie_options,
        guests: formData.guests.map((email) => email.trim().toLowerCase()),
      };

      await eventService.createEvent(eventData);
      navigate("/events");
    } catch (error) {
      console.error("Failed to create event:", error);
      throw error;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-1 px-4 sm:px-12 py-8">
          <h1 className="text-3xl text-white font-bold mb-8">Create Event</h1>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-8">
              <EventDetails
                formData={formData}
                onFormChange={handleFormChange}
              />
              <GuestList
                guests={formData.guests}
                onGuestsChange={(guests) => handleFormChange({ guests })}
              />
            </div>
            <div className="w-full md:w-80">
              <EventSummary formData={formData} onCreateEvent={handleSubmit} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};
