import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
      <span className="text-gray-500 text-sm">{user?.email}</span>
      <button
        onClick={handleLogout}
        className="text-sm bg-emerald-700 text-white px-4 py-1.5 rounded hover:bg-emerald-800 transition-colors"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;
