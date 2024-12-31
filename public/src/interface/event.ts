import { Movie } from "./movie";

interface Host {
  id: number;
  username: string;
  email: string;
  avatar?: string;
}

export interface Invitation {
  email: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  updated_at: string;
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
  invitations: Invitation[];
  movies?: Movie[];
  vote_results?: Record<
    number,
    {
      upvotes: number;
      downvotes: number;
    }
  >;
}
