import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="flex justify-between items-center px-12 py-5 bg-black">
      <Link to="/" className="text-2xl text-white font-bold">
        MovieVault
      </Link>

      <nav className="flex gap-10">
        <Link
          to="/events"
          className="text-red hover:text-white transition-colors"
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

      <div className="flex items-center gap-8">
        <button className="text-lightGray hover:text-white transition-colors">
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
        <Link
          to="/login"
          className="bg-red hover:bg-red-light text-white px-8 py-2 rounded-full transition-colors"
        >
          Login
        </Link>
      </div>
    </header>
  );
};
