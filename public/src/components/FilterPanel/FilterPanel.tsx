import { useEffect } from "react";
import { useFilter } from "../../hooks/useFilter";
import { movieFilterConfig } from "../../config/movieFilters";
import { Movie } from "../../interface/movie";

interface FilterPanelProps {
  onFilterChange: (movies: Movie[]) => void;
  movies: Movie[];
}

export const FilterPanel = ({ onFilterChange, movies }: FilterPanelProps) => {
  const { filters, updateFilter, applyFilters, resetFilters } =
    useFilter<Movie>(movieFilterConfig);

  useEffect(() => {
    const filteredMovies = applyFilters(movies);
    onFilterChange(filteredMovies);
  }, [movies, applyFilters, onFilterChange]);

  const handleFilterChange = (filterId: string, value: any) => {
    updateFilter(filterId, value);
    const filteredMovies = applyFilters(movies);
    onFilterChange(filteredMovies);
  };

  return (
    <aside className="w-64 bg-darkGray rounded-lg p-6">
      {movieFilterConfig.map((filter) => (
        <div key={filter.id} className="mb-8">
          <h3 className="text-white font-bold mb-4">{filter.label}</h3>
          {filter.type === "range" && (
            <div className="space-y-4">
              <div>
                <label className="text-lightGray text-sm">
                  Min {filter.label}
                </label>
                <input
                  type="number"
                  min={filter.range?.min}
                  max={filter.range?.max}
                  step={filter.range?.step}
                  value={filters[filter.id]?.[0] ?? filter.range?.min}
                  onChange={(e) =>
                    handleFilterChange(filter.id, [
                      parseFloat(e.target.value),
                      filters[filter.id]?.[1] ?? filter.range?.max,
                    ])
                  }
                  className="w-full bg-black text-white p-2 rounded mt-1"
                />
              </div>
              <div>
                <label className="text-lightGray text-sm">
                  Max {filter.label}
                </label>
                <input
                  type="number"
                  min={filter.range?.min}
                  max={filter.range?.max}
                  step={filter.range?.step}
                  value={filters[filter.id]?.[1] ?? filter.range?.max}
                  onChange={(e) =>
                    handleFilterChange(filter.id, [
                      filters[filter.id]?.[0] ?? filter.range?.min,
                      parseFloat(e.target.value),
                    ])
                  }
                  className="w-full bg-black text-white p-2 rounded mt-1"
                />
              </div>
            </div>
          )}
          {filter.type === "multiselect" && (
            <div className="space-y-2">
              {filter.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center text-lightGray"
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={filters[filter.id]?.includes(option.value)}
                    onChange={(e) => {
                      const currentValues = filters[filter.id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: any) => v !== option.value);
                      handleFilterChange(filter.id, newValues);
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      <button
        onClick={() => {
          resetFilters();
          onFilterChange(movies);
        }}
        className="w-full bg-red text-white py-2 rounded hover:bg-red-light transition-colors"
      >
        Reset Filters
      </button>
    </aside>
  );
};
