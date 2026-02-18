import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

// Static particle positions — 3 drift variants distributed across the screen
const PARTICLES = [
  { top: "9%",  left: "6%",   s: 2.5, dur: 9,  dl: 0,   cls: "animate-particle-a" },
  { top: "24%", left: "15%",  s: 2,   dur: 12, dl: 1.8, cls: "animate-particle-b" },
  { top: "42%", left: "3%",   s: 3,   dur: 8,  dl: 0.6, cls: "animate-particle-c" },
  { top: "58%", left: "11%",  s: 2,   dur: 11, dl: 2.5, cls: "animate-particle-a" },
  { top: "75%", left: "19%",  s: 3,   dur: 10, dl: 1.1, cls: "animate-particle-b" },
  { top: "89%", left: "7%",   s: 2,   dur: 7,  dl: 3.5, cls: "animate-particle-c" },
  { top: "14%", left: "81%",  s: 3,   dur: 13, dl: 2.2, cls: "animate-particle-a" },
  { top: "28%", left: "91%",  s: 2,   dur: 9,  dl: 0.4, cls: "animate-particle-b" },
  { top: "51%", left: "95%",  s: 2,   dur: 8,  dl: 4.1, cls: "animate-particle-c" },
  { top: "68%", left: "85%",  s: 3,   dur: 11, dl: 1.9, cls: "animate-particle-a" },
  { top: "84%", left: "93%",  s: 2,   dur: 14, dl: 3.2, cls: "animate-particle-b" },
  { top: "5%",  left: "53%",  s: 2.5, dur: 10, dl: 2.9, cls: "animate-particle-c" },
  { top: "94%", left: "44%",  s: 3,   dur: 8,  dl: 1.3, cls: "animate-particle-a" },
  { top: "36%", left: "48%",  s: 2,   dur: 15, dl: 0.2, cls: "animate-particle-b" },
  { top: "63%", left: "37%",  s: 2.5, dur: 9,  dl: 4.6, cls: "animate-particle-c" },
];

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #040d1a 0%, #060f1e 45%, #03100f 100%)" }}
    >
      {/* ── Subtle dot-grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(16,185,129,0.18) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* ── Scan line ── */}
      <div
        className="absolute inset-x-0 h-px pointer-events-none animate-scan-line"
        style={{ background: "linear-gradient(90deg, transparent, rgba(52,211,153,0.5), transparent)" }}
      />

      {/* ── Background orbs ── */}
      <div
        className="absolute -top-48 -left-48 rounded-full pointer-events-none animate-orb-glow"
        style={{ width: 520, height: 520, background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 68%)", animationDelay: "0s" }}
      />
      <div
        className="absolute -bottom-64 -right-48 rounded-full pointer-events-none animate-orb-glow"
        style={{ width: 620, height: 620, background: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 68%)", animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/4 right-[8%] rounded-full pointer-events-none animate-float-3"
        style={{ width: 280, height: 280, background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-1/4 left-[12%] rounded-full pointer-events-none animate-float-1"
        style={{ width: 240, height: 240, background: "radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)", animationDelay: "3s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none animate-orb-glow"
        style={{ width: 700, height: 700, background: "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 60%)", animationDelay: "1s" }}
      />

      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className={`absolute rounded-full pointer-events-none ${p.cls}`}
          style={{
            top: p.top, left: p.left,
            width: p.s, height: p.s,
            background: "rgba(52,211,153,0.9)",
            boxShadow: "0 0 6px 1px rgba(52,211,153,0.7)",
            "--dur": `${p.dur}s`,
            "--dl": `${p.dl}s`,
          }}
        />
      ))}

      {/* ── Card wrapper (glow halo behind) ── */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Glow halo */}
        <div
          className="absolute -inset-6 rounded-[36px] pointer-events-none animate-orb-glow"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.2) 0%, transparent 70%)", animationDelay: "0.5s" }}
        />

        {/* Glass card */}
        <div
          className="relative animate-fade-slide-up"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderTop: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "24px",
            boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.08)",
            padding: "40px 32px 36px",
          }}
        >
          {/* Inner top highlight */}
          <div
            className="absolute inset-x-8 top-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
          />

          {/* ── Logo ── */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative flex items-center justify-center mb-4" style={{ width: 80, height: 80 }}>
              {/* Outer dashed ring — rotates CW */}
              <div
                className="absolute rounded-full border border-dashed border-emerald-500/25 animate-rotate-slow"
                style={{ width: 76, height: 76 }}
              />
              {/* Inner solid ring — rotates CCW */}
              <div
                className="absolute rounded-full border border-teal-400/30 animate-rotate-ccw"
                style={{ width: 60, height: 60 }}
              />
              {/* Pulse rings */}
              <div
                className="absolute rounded-full border-2 border-emerald-500/50 animate-pulse-ring"
                style={{ width: 44, height: 44 }}
              />
              <div
                className="absolute rounded-full border-2 border-emerald-400/35 animate-pulse-ring"
                style={{ width: 44, height: 44, animationDelay: "1.2s" }}
              />
              {/* Icon */}
              <div
                className="relative flex items-center justify-center rounded-xl"
                style={{
                  width: 44, height: 44,
                  background: "linear-gradient(135deg, #059669, #0d9488)",
                  boxShadow: "0 8px 24px rgba(5,150,105,0.5), 0 0 0 1px rgba(5,150,105,0.3)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                  <path d="M20 6C12 6 8 13 8 19c0 8 7 13 12 17 5-4 12-9 12-17 0-6-4-13-12-13z" fill="white" opacity="0.95"/>
                  <path d="M20 13v14M13 20h14" stroke="#059669" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <h1 className="text-lg font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
              Prajakirana Seva Charitable Trust
            </h1>
            <p className="text-sm mt-1 tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>
              Sign in to continue
            </p>
          </div>

          {/* ── Role toggle ── */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {["admin", "volunteer"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                style={
                  role === r
                    ? {
                        background: "linear-gradient(135deg, #059669, #0d9488)",
                        color: "white",
                        boxShadow: "0 2px 12px rgba(5,150,105,0.4)",
                      }
                    : { color: "rgba(255,255,255,0.35)" }
                }
              >
                {r === "admin" ? "Admin" : "Volunteer"}
              </button>
            ))}
          </div>

          {/* ── Error ── */}
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm animate-fade-in"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "rgba(252,165,165,1)",
              }}
            >
              {error}
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Email */}
            <div className="relative animate-fade-slide-up animation-delay-100">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.28)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input w-full pl-10 pr-4 py-3 text-sm rounded-xl"
              />
            </div>

            {/* Password */}
            <div className="relative animate-fade-slide-up animation-delay-200">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.28)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input w-full pl-10 pr-11 py-3 text-sm rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
                style={{ color: "rgba(255,255,255,0.28)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
              >
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative mt-2 py-3 rounded-xl text-sm font-bold text-white overflow-hidden animate-fade-slide-up animation-delay-300 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #059669 0%, #0d9488 50%, #059669 100%)",
                boxShadow: "0 6px 24px rgba(5,150,105,0.45), 0 0 40px rgba(5,150,105,0.1)",
              }}
            >
              {/* Shimmer sweep */}
              <span
                className="absolute inset-0 pointer-events-none animate-shimmer-btn"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.14) 50%, transparent 75%)",
                  backgroundSize: "200% 100%",
                }}
              />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in as {role === "admin" ? "Admin" : "Volunteer"}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
