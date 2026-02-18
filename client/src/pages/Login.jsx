import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const EnvelopeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-gray-400">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-gray-400">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
      if (res.data.user.role === "volunteer") {
        navigate("/attendance");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">

      {/* Floating orbs */}
      <div className="animate-float-1 absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="animate-float-2 absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="animate-float-3 absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-emerald-300/15 dark:bg-emerald-500/10 blur-2xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 bg-white/90 dark:bg-gray-700/90 backdrop-blur-xl border border-slate-200/60 dark:border-gray-600/50 rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 animate-fade-slide-up">

        <div className="flex flex-col items-center mb-6 animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 40 40" className="mb-3">
            <rect width="40" height="40" rx="10" fill="#059669"/>
            <path d="M20 8 C14 8 10 13 10 18 C10 24 15 28 20 32 C25 28 30 24 30 18 C30 13 26 8 20 8Z" fill="white" opacity="0.9"/>
            <path d="M20 14 L20 26 M14 20 L26 20" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">NGO Manager</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Sign in to continue</p>
        </div>

        <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-gray-500 mb-6 animate-fade-in animation-delay-150">
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              role === "admin"
                ? "bg-emerald-600 text-white"
                : "bg-white/80 dark:bg-gray-600/80 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-500/80"
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRole("volunteer")}
            className={`flex-1 py-2 text-sm font-semibold transition-colors ${
              role === "volunteer"
                ? "bg-emerald-600 text-white"
                : "bg-white/80 dark:bg-gray-600/80 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-500/80"
            }`}
          >
            Volunteer
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative animate-fade-slide-up animation-delay-100">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <EnvelopeIcon />
            </span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/80 dark:bg-gray-600/80 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="relative animate-fade-slide-up animation-delay-200">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <LockIcon />
            </span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/80 dark:bg-gray-600/80 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-150 animate-fade-slide-up animation-delay-300"
          >
            Login as {role === "admin" ? "Admin" : "Volunteer"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
