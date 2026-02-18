import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-800 border border-gray-700/50 rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-emerald-400 mb-6 text-center">
          NGO Manager
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-500 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
