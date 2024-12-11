import { FilterConfig } from "../hooks/useFilter";
import { Movie } from "../interface/movie";

export const genreMap = new Map([
  [28, "Action"],
  [12, "Adventure"],
  [16, "Animation"],
  [35, "Comedy"],
  [80, "Crime"],
  [18, "Drama"],
  [14, "Fantasy"],
  [27, "Horror"],
  [10749, "Romance"],
  [878, "Sci-Fi"],
  [53, "Thriller"],
]);

export const movieFilterConfig: FilterConfig<Movie>[] = [
  {
    id: "rating",
    label: "Rating",
    type: "range",
    field: "vote_average",
    range: {
      min: 0,
      max: 10,
      step: 0.1,
    },
  },
  {
    id: "genres",
    label: "Genres",
    type: "multiselect",
    field: "genre_ids",
    options: [
      { value: 28, label: "Action" },
      { value: 12, label: "Adventure" },
      { value: 16, label: "Animation" },
      { value: 35, label: "Comedy" },
      { value: 80, label: "Crime" },
      { value: 18, label: "Drama" },
      { value: 14, label: "Fantasy" },
      { value: 27, label: "Horror" },
      { value: 10749, label: "Romance" },
      { value: 878, label: "Science Fiction" },
      { value: 53, label: "Thriller" },
    ],
  },
  {
    id: "year",
    label: "Release Year",
    type: "range",
    field: "release_date",
    range: {
      min: 1900,
      max: new Date().getFullYear(),
      step: 1,
    },
  },
];
