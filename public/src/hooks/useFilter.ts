import { useState, useCallback } from "react";

export interface FilterConfig<T> {
  id: string;
  label: string;
  type: "range" | "multiselect" | "select" | "search";
  options?: { value: number; label: string }[];
  field: keyof T;
  range?: {
    min: number;
    max: number;
    step: number;
  };
}

export interface FilterState {
  [key: string]: any;
}

export function useFilter<T>(
  config: FilterConfig<T>[],
  initialState?: FilterState
) {
  const [filters, setFilters] = useState<FilterState>(() => {
    const initial = { ...initialState };
    config.forEach((filter) => {
      if (filter.type === "multiselect") {
        initial[filter.id] = initial[filter.id] || [];
      } else if (filter.type === "range" && filter.range) {
        initial[filter.id] = initial[filter.id] || [
          filter.range.min,
          filter.range.max,
        ];
      }
    });
    return initial;
  });

  const updateFilter = useCallback((filterId: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  }, []);

  const applyFilters = useCallback(
    (items: T[]): T[] => {
      return items.filter((item) => {
        return Object.entries(filters).every(([filterId, filterValue]) => {
          const filterConfig = config.find((c) => c.id === filterId);
          if (!filterConfig) return true;

          const itemValue = item[filterConfig.field];

          switch (filterConfig.type) {
            case "range":
              const [min, max] = filterValue || [];
              if (!min && !max) return true;

              if (filterConfig.field === "release_date") {
                const year = new Date(itemValue as string).getFullYear();
                return (!min || year >= min) && (!max || year <= max);
              }
              return (
                (!min || Number(itemValue) >= min) &&
                (!max || Number(itemValue) <= max)
              );

            case "multiselect":
              // If no filter value or empty array, show all items
              if (
                !filterValue ||
                !Array.isArray(filterValue) ||
                filterValue.length === 0
              ) {
                return true;
              }

              if (filterConfig.field === "genre_ids") {
                const movieGenres = itemValue as number[];
                // Check if movie has any of the selected genres
                // TODO Perhaps readjust this to check if movie has ALL of the selected genres
                return filterValue.some((selectedGenre) =>
                  movieGenres.includes(selectedGenre)
                );
              }
              return filterValue.includes(itemValue);

            case "select":
              return !filterValue || filterValue === itemValue;

            default:
              return true;
          }
        });
      });
    },
    [filters, config]
  );

  const resetFilters = useCallback(() => {
    // Reset to initial state with proper defaults
    const initial: FilterState = {};
    config.forEach((filter) => {
      if (filter.type === "multiselect") {
        initial[filter.id] = [];
      } else if (filter.type === "range" && filter.range) {
        initial[filter.id] = [filter.range.min, filter.range.max];
      }
    });
    setFilters(initial);
  }, [config]);

  return { filters, updateFilter, applyFilters, resetFilters };
}
