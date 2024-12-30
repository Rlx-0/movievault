import { Movie } from "./movie";

interface Host {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
}

export interface IEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  movie_options: number[];
  guests: string[];
  host: Host | null;
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
