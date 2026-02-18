import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/children", label: "Children" },
  { to: "/volunteers", label: "Volunteers" },
  { to: "/attendance", label: "Attendance" },
];

const Sidebar = () => (
  <div className="w-56 bg-emerald-800 text-white flex flex-col shrink-0">
    <div className="px-6 py-5 text-lg font-bold tracking-wide border-b border-emerald-700">
      NGO Manager
    </div>
    <nav className="flex-1 py-4">
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-sm transition-colors ${
              isActive
                ? "bg-emerald-700 border-l-4 border-white font-semibold"
                : "hover:bg-emerald-700/60"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  </div>
);

export default Sidebar;
