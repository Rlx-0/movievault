import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  onSearch?: (query: string) => Promise<void>;
}

export const Header = ({ onSearch }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    } else {
      navigate("/search");
    }
    setSearchQuery("");
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  };

  const NavLinks = () => (
    <>
      <Link
        to="/"
        className={`text-lg ${
          location.pathname === "/"
            ? "text-white"
            : "text-lightGray hover:text-white"
        }`}
      >
        Home
      </Link>
      <Link
        to="/events"
        className={`text-lg ${
          location.pathname === "/events"
            ? "text-white"
            : "text-lightGray hover:text-white"
        }`}
      >
        Events
      </Link>
      {isAuthenticated ? (
        <button
          onClick={handleLogout}
          className="text-lg text-lightGray hover:text-white"
        >
          Logout
        </button>
      ) : (
        <Link to="/login" className="text-lg text-lightGray hover:text-white">
          Login
        </Link>
      )}
    </>
  );

  return (
    <header className="bg-black bg-opacity-90 px-8 py-6">
      <div className="flex justify-between items-center gap-4">
        <Link to="/" className="text-2xl text-white font-bold">
          MovieNight
        </Link>

        {/* Desktop Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:block flex-1 max-w-md mx-8"
        >
          <div className="relative">
            <input
              type="search"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-darkGray text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <svg
                className="w-5 h-5 text-lightGray hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <NavLinks />
        </nav>

        {/* Mobile Search and Menu */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={toggleSearch}
            className="text-white focus:outline-none"
            aria-label="Search"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar - Expandable */}
      {isSearchOpen && (
        <form
          onSubmit={handleSearch}
          className="md:hidden mt-4 animate-slideDown"
        >
          <div className="relative">
            <input
              type="search"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-darkGray text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <svg
                className="w-5 h-5 text-lightGray hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>
      )}

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden pt-4 pb-2 space-y-4 flex flex-col items-center animate-slideDown">
          <NavLinks />
        </nav>
      )}
    </header>
  );
};
