import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, setIsDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-600/50 px-3 sm:px-6 py-3 flex items-center gap-2 sm:gap-3 justify-between shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-gray-600/50 text-slate-500 dark:text-gray-400 bg-white dark:bg-gray-700 hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors shrink-0"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      {/* Email — truncated on small screens */}
      <span className="text-slate-500 dark:text-gray-400 text-sm truncate flex-1 min-w-0">
        {user?.email}
      </span>

      <div className="flex items-center gap-2 shrink-0">
        {/* Dark mode toggle */}
        <button
          onClick={() => setIsDark((v) => !v)}
          className="p-2 rounded-lg border border-slate-200 dark:border-gray-600/50 text-slate-500 dark:text-gray-400 bg-white dark:bg-gray-700 hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-sm bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <span className="hidden sm:inline">Logout</span>
          <span className="sm:hidden">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
