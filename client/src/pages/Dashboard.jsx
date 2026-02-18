import { useEffect, useState } from "react";
import api from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get("/reports/dashboard-stats");
      setStats(res.data);
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Total Children</p>
          <p className="text-3xl font-bold text-emerald-700">
            {stats.totalChildren ?? "—"}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Total Volunteers</p>
          <p className="text-3xl font-bold text-emerald-700">
            {stats.totalVolunteers ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
