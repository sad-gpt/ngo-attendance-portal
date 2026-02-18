import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/children", label: "Children" },
  { to: "/volunteers", label: "Volunteers" },
  { to: "/attendance", label: "Attendance" },
  { to: "/reports", label: "Reports" },
];

const Sidebar = () => (
  <div className="w-56 bg-gray-900 border-r border-gray-700/50 text-white flex flex-col shrink-0">
    <div className="px-6 py-5 text-lg font-bold tracking-wide border-b border-gray-700/50 text-gray-100">
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
                ? "bg-emerald-700/30 border-l-2 border-emerald-500 text-emerald-400 font-semibold"
                : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
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
