import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const icons = {
  Dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Children: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Volunteers: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Attendance: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <polyline points="9 16 11 18 15 14"/>
    </svg>
  ),
  Reports: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
};

const allLinks = [
  { to: "/dashboard", label: "Dashboard", roles: ["admin"] },
  { to: "/children", label: "Children", roles: ["admin"] },
  { to: "/volunteers", label: "Volunteers", roles: ["admin"] },
  { to: "/attendance", label: "Attendance", roles: ["admin", "volunteer"] },
  { to: "/reports", label: "Reports", roles: ["admin"] },
];

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role || "admin";
  const links = allLinks.filter((l) => l.roles.includes(role));

  return (
    <div className="w-72 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-600/50 flex flex-col shrink-0">
      <Link
        to="/dashboard"
        className="block px-4 py-5 text-sm font-bold tracking-wide whitespace-nowrap leading-tight border-b border-slate-200 dark:border-gray-600/50 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
      >
        Prajakirana Seva Charitable Trust
      </Link>
      <nav className="flex-1 py-4">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/50 border-l-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold"
                  : "text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-600/50 hover:text-slate-900 dark:hover:text-gray-100"
              }`
            }
          >
            {icons[label]}
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
