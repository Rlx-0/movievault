import { useState } from "react";

interface GuestListProps {
  guests: string[];
  onGuestsChange: (guests: string[]) => void;
  className?: string;
}

export const GuestList = ({
  guests,
  onGuestsChange,
  className,
}: GuestListProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleAddGuest = () => {
    if (!email.trim()) {
      setError("Email cannot be empty");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (guests.includes(email)) {
      setError("This guest has already been invited");
      return;
    }

    onGuestsChange([...guests, email]);
    setEmail("");
    setError(null);
  };

  const handleRemoveGuest = (emailToRemove: string) => {
    onGuestsChange(guests.filter((email) => email !== emailToRemove));
  };

  return (
    <div className={`bg-darkGray rounded-lg p-6 ${className || ""}`}>
      <h2 className="text-2xl text-white font-bold mb-6">Guest List</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-lightGray text-sm mb-1">
            Invite Guests
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Enter email address"
              className="flex-1 bg-black text-white p-2 rounded"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddGuest();
                }
              }}
            />
            <button
              onClick={handleAddGuest}
              className="bg-red hover:bg-red-light text-white px-4 py-2 rounded transition-colors"
            >
              Add
            </button>
          </div>
          {error && <p className="text-red text-sm mt-1">{error}</p>}
        </div>

        <div>
          <h3 className="text-white font-bold mb-4">Invited Guests</h3>
          {guests.length === 0 ? (
            <p className="text-lightGray text-sm">No guests invited yet</p>
          ) : (
            <div className="space-y-2">
              {guests.map((guest) => (
                <div
                  key={guest}
                  className="flex items-center justify-between bg-black rounded p-2"
                >
                  <span className="text-white">{guest}</span>
                  <button
                    onClick={() => handleRemoveGuest(guest)}
                    className="text-red hover:text-red-light"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
