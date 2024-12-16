import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header = ({ onSearch }: HeaderProps) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const query = new FormData(form).get("search") as string;

    if (!query.trim()) {
      navigate("/search");
      return;
    }

    if (onSearch) {
      onSearch(query);
    } else {
      navigate("/search", { state: { searchQuery: query } });
    }
  };

  return (
    <header className="flex justify-between items-center px-12 py-5 bg-black">
      <Link to="/" className="text-2xl text-white font-bold flex-1">
        MovieVault
      </Link>

      <nav className="flex gap-10 flex-1 justify-center">
        <Link
          to="/events"
          className="text-lightGray hover:text-white transition-colors"
        >
          Events
        </Link>
        <Link
          to="/saved"
          className="text-lightGray hover:text-white transition-colors"
        >
          Saved
        </Link>
        <Link
          to="/settings"
          className="text-lightGray hover:text-white transition-colors"
        >
          Settings
        </Link>
      </nav>

      <div className="flex items-center gap-8 flex-1 justify-end">
        <form onSubmit={handleSubmit} className="flex items-center gap-8">
          <input
            type="search"
            name="search"
            placeholder="Search movies..."
            className="bg-darkGray text-white px-4 py-2 rounded-full w-64"
          />
          <button
            type="submit"
            className="text-lightGray hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="bg-red hover:bg-red-light text-white px-8 py-2 rounded-full transition-colors"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-red hover:bg-red-light text-white px-8 py-2 rounded-full transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};
