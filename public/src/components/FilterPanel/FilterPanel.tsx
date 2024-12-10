// TODO Ensure this is working properly
export const FilterPanel = () => {
  return (
    <aside className="w-64 bg-darkGray rounded-lg p-6">
      <div className="mb-8">
        <h3 className="text-white font-bold mb-4">Rating</h3>
        <div className="space-y-4">
          <div>
            <label className="text-lightGray text-sm">Min. rating</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              defaultValue="4.5"
              className="w-full bg-black text-white p-2 rounded mt-1"
            />
          </div>
          <div>
            <label className="text-lightGray text-sm">Max. rating</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              defaultValue="9.0"
              className="w-full bg-black text-white p-2 rounded mt-1"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-white font-bold mb-4">Genres</h3>
        <div className="space-y-2">
          {["Comedy", "Romance", "Action", "Drama", "Fantasy"].map((genre) => (
            <label key={genre} className="flex items-center text-lightGray">
              <input type="checkbox" className="mr-2" />
              {genre}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};
