import { useState } from "react";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { EventDetails } from "../../components/EventDetails/EventDetails";
import { GuestList } from "../../components/GuestList/GuestList";
import { EventSummary } from "../../components/EventSummary/EventSummary";
import { eventService } from "../../services/apiService";
import { useNavigate, Link } from "react-router-dom";
import { PageTransition } from "../../components/Animation/PageTransition";
import { useAuth } from "../../context/AuthContext";

interface EventForm {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  movie_options: number[];
  guests: string[];
}

interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export const CreateEvent = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showValidation, setShowValidation] = useState(false);

  const [formData, setFormData] = useState<EventForm>(() => {
    try {
      const savedForm = localStorage.getItem("eventFormData");
      if (savedForm) {
        return JSON.parse(savedForm);
      }
    } catch (error) {
      console.error("Error parsing saved form data:", error);
    }

    return {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      movie_options: [],
      guests: [],
    };
  });

  const validateForm = (data: EventForm): FormValidation => {
    const errors: Record<string, string> = {};

    if (!data.title.trim()) {
      errors.title = "Title is required";
    }
    if (!data.date) {
      errors.date = "Date is required";
    } else {
      const selectedDate = new Date(`${data.date}T${data.time || "00:00"}`);
      if (selectedDate < new Date()) {
        errors.date = "Event date must be in the future";
      }
    }
    if (!data.time) {
      errors.time = "Time is required";
    }
    if (!data.location.trim()) {
      errors.location = "Location is required";
    }
    if (data.movie_options.length === 0) {
      errors.movie_options = "At least one movie is required";
    }
    if (data.guests.length === 0) {
      errors.guests = "At least one guest is required";
    } else {
      const invalidEmails = data.guests.filter(
        (email) => !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      );
      if (invalidEmails.length > 0) {
        errors.guests = "Some email addresses are invalid";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const handleFormChange = (updates: Partial<EventForm>) => {
    setFormData((prev) => {
      const newFormData = { ...prev, ...updates };
      try {
        localStorage.setItem("eventFormData", JSON.stringify(newFormData));
        if (showValidation) {
          const { errors } = validateForm(newFormData);
          setValidationErrors(errors);
        }
      } catch (error) {
        console.error("Error saving form data:", error);
      }
      return newFormData;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const validation = validateForm(formData);
    setShowValidation(true);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      const firstErrorField = Object.keys(validation.errors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      errorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!isAuthenticated) {
      try {
        localStorage.setItem("eventFormData", JSON.stringify(formData));
        localStorage.setItem("redirectPath", "/create-event");
        setShowAuthPrompt(true);
      } catch (error) {
        console.error("Error saving form data:", error);
      }
      return;
    }

    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: new Date(`${formData.date}T${formData.time}`).toISOString(),
        location: formData.location.trim(),
        movie_options: formData.movie_options,
        guests: formData.guests.map((email) => email.trim().toLowerCase()),
      };

      await eventService.createEvent(eventData);
      localStorage.removeItem("eventFormData");
      navigate("/events");
    } catch (error) {
      console.error("Failed to create event:", error);
      setValidationErrors({
        submit: "Failed to create event. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-black">
        <Header />
        <main className="flex-1 px-4 sm:px-12 py-8">
          <h1 className="text-3xl text-white font-bold mb-8">Create Event</h1>
          {validationErrors.submit && (
            <div className="bg-red bg-opacity-10 text-red px-4 py-3 rounded mb-6">
              {validationErrors.submit}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-8">
              <EventDetails
                formData={formData}
                onFormChange={handleFormChange}
                validationErrors={validationErrors}
                className="movie-selection"
              />
              <GuestList
                guests={formData.guests}
                onGuestsChange={(guests) => handleFormChange({ guests })}
                validationError={validationErrors.guests}
                className="guest-list-input"
              />
            </div>
            <div className="w-full md:w-80">
              {showAuthPrompt ? (
                <div className="bg-darkGray p-8 rounded-lg text-center sticky top-8">
                  <h2 className="text-2xl text-white font-bold mb-4">
                    Authentication Required
                  </h2>
                  <p className="text-lightGray mb-6">
                    Please log in to create your event. Your event details will
                    be saved.
                  </p>
                  <div className="space-y-4">
                    <Link
                      to="/login"
                      className="inline-block bg-red hover:bg-red-light text-white px-6 py-2 rounded-full transition-colors w-full text-center"
                    >
                      Log In
                    </Link>
                    <p className="text-sm text-lightGray">
                      Don't have an account?{" "}
                      <Link
                        to="/register"
                        className="text-red hover:text-red-light"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </div>
              ) : (
                <EventSummary
                  formData={formData}
                  onCreateEvent={handleSubmit}
                  className="event-summary sticky top-8"
                  loading={loading}
                />
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};
