import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PageTransition } from "../../components/Animation/PageTransition";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-darkGray p-8 rounded-lg w-96">
          <h1 className="text-2xl text-white font-bold mb-6">Login</h1>
          {error && <div className="text-red mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-lightGray block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black text-white p-2 rounded"
              />
            </div>
            <div>
              <label className="text-lightGray block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black text-white p-2 rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red hover:bg-red-light text-white py-2 rounded-full"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};
