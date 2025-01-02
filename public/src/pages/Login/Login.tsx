import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PageTransition } from "../../components/Animation/PageTransition";
import Loading from "../../components/Animation/Loading";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      const redirectPath = localStorage.getItem("redirectPath");
      if (redirectPath) {
        localStorage.removeItem("redirectPath");
        navigate(redirectPath);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
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
              disabled={loading}
              className="w-full bg-red hover:bg-red-light text-white py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loading size="small" /> : "Login"}
            </button>
          </form>
          <p className="text-lightGray mt-4 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-red hover:text-red-light">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};
