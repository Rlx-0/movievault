// TODO Eventually clean up this file
import { get, post, put, del } from "./serviceBase";
import { handleApiError } from "../utils/apiHelpers";
import { Movie, MovieResponse } from "../interface/movie";
import { ApiError } from "../interface/api";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface IUser {
  id: number;
  username: string;
  email: string;
  password?: string;
}

interface IEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  movie_options: number[];
  guests: string[];
  host?: number | null;
}

interface ITokenResponse {
  access: string;
  refresh: string;
  userId: number;
  email: string;
}

interface IVoteRequest {
  movie_id: number;
  vote: boolean | null;
}

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

export const movieService = {
  searchMovies: async (query: string, signal?: AbortSignal) => {
    try {
      const response = await get<MovieResponse>(
        `${API_BASE_URL}/movies/search/?query=${encodeURIComponent(query)}`,
        { signal }
      );
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.name === "AbortError") {
        throw apiError;
      }
      throw new Error(handleApiError(apiError));
    }
  },

  getMovieDetails: async (id: number) => {
    try {
      const response = await get<Movie>(`${API_BASE_URL}/movies/tmdb/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getPopularMovies: async () => {
    try {
      const response = await get<MovieResponse>(
        `${API_BASE_URL}/movies/popular/`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getMovieCredits: async (id: number) => {
    try {
      const response = await get<MovieCredits>(
        `${API_BASE_URL}/movies/tmdb/${id}/credits/`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export const eventService = {
  getEvents: async () => {
    try {
      const response = await get<IEvent[]>(`${API_BASE_URL}/events/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getEventById: async (id: number) => {
    try {
      const response = await get<IEvent>(`${API_BASE_URL}/events/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createEvent: async (eventData: Partial<IEvent>) => {
    try {
      const response = await post<IEvent>(`${API_BASE_URL}/events/`, eventData);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Event creation error:", apiError.response?.data);
      throw new Error(handleApiError(apiError));
    }
  },

  updateEvent: async (id: number, eventData: Partial<IEvent>) => {
    try {
      const response = await put<IEvent>(
        `${API_BASE_URL}/events/${id}/`,
        eventData
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteEvent: async (eventId: number) => {
    try {
      await del(`${API_BASE_URL}/events/${eventId}/`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  submitVote: async (eventId: number, voteData: IVoteRequest) => {
    try {
      const response = await post(
        `${API_BASE_URL}/events/${eventId}/vote/`,
        voteData
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getVoteResults: async (eventId: number) => {
    try {
      const response = await get(
        `${API_BASE_URL}/events/${eventId}/vote_results/`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  inviteGuests: async (eventId: number, emails: string[]) => {
    try {
      const response = await post(
        `${API_BASE_URL}/events/${eventId}/invite_guests/`,
        { emails }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  respondToInvitation: async (
    eventId: number,
    status: "accepted" | "declined"
  ) => {
    try {
      const response = await post(
        `${API_BASE_URL}/events/${eventId}/respond_to_invitation/`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getMovieSuggestions: async (eventId: number) => {
    try {
      const response = await get(
        `${API_BASE_URL}/events/${eventId}/movie_suggestions/`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  finalizeMovie: async (eventId: number, movieId: number) => {
    try {
      const response = await post(
        `${API_BASE_URL}/events/${eventId}/finalize_movie/`,
        { movie_id: movieId }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export const authService = {
  register: async (username: string, email: string, password: string) => {
    try {
      const response = await post<IUser>(`${API_BASE_URL}/user/register/`, {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  login: async (username: string, password: string) => {
    try {
      const response = await post<ITokenResponse>(`${API_BASE_URL}/token/`, {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  refreshToken: async (refresh: string) => {
    try {
      const response = await post<{ access: string }>(
        `${API_BASE_URL}/token/refresh/`,
        { refresh }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export const contactService = {
  submitContactForm: async (formData: {
    name: string;
    email: string;
    message: string;
  }) => {
    try {
      const response = await post(`${API_BASE_URL}/contact/`, formData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
