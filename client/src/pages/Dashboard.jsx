import { useEffect, useState } from "react";
import api from "../services/api";

const StatCard = ({ label, value }) => (
  <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-6">
    <p className="text-sm text-gray-400 mb-1">{label}</p>
    <p className="text-3xl font-bold text-emerald-400">{value ?? "—"}</p>
  </div>
);

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
      <h2 className="text-xl font-bold text-gray-100 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Children" value={stats.totalChildren} />
        <StatCard label="Total Volunteers" value={stats.totalVolunteers} />
        <StatCard label="Present Today" value={stats.attendanceToday} />
      </div>
    </div>
  );
};

export default Dashboard;
