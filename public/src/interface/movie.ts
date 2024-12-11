export interface Movie {
  id: number;
  title: string;
  overview?: string;
  poster_path: string | null;
  release_date?: string;
  genres?: string[];
  vote_average?: number;
  runtime?: number;
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  original_language: string;
  original_title: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
