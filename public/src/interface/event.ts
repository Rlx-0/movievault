import { Movie } from "./movie";

export interface IEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  movie_options: number[];
  guests: string[];
  host: number | null;
  created_at?: string;
  updated_at?: string;
  invitations?: {
    email: string;
    status: "pending" | "accepted" | "declined";
    created_at: string;
    updated_at: string;
  }[];
  movies?: Movie[];
  vote_results?: Record<
    number,
    {
      upvotes: number;
      downvotes: number;
    }
  >;
}
