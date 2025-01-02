import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PageTransition } from "../../components/Animation/PageTransition";
import { Link } from "react-router-dom";
import Loading from "../../components/Animation/Loading";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register(username, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="bg-darkGray p-8 rounded-lg w-96">
          <h1 className="text-2xl text-white font-bold mb-6">Create Account</h1>
          {error && <div className="text-red mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-lightGray block mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black text-white p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="text-lightGray block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black text-white p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="text-lightGray block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black text-white p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="text-lightGray block mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black text-white p-2 rounded"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red hover:bg-red-light text-white py-2 rounded-full"
            >
              {loading ? <Loading size="small" /> : "Create Account"}
            </button>
          </form>
          <p className="text-lightGray mt-4 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-red hover:text-red-light">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};
