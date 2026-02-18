import { useEffect, useState } from "react";
import api from "../services/api";

const StatCard = ({ label, value, className = "" }) => (
  <div className={`bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200 ${className}`}>
    <p className="text-sm text-slate-500 dark:text-gray-400 mb-1">{label}</p>
    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{value ?? "—"}</p>
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
    <div className="animate-page-enter">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Children"   value={stats.totalChildren}    className="animate-fade-slide-up animation-delay-100" />
        <StatCard label="Total Volunteers" value={stats.totalVolunteers}  className="animate-fade-slide-up animation-delay-200" />
        <StatCard label="Present Today"    value={stats.attendanceToday}  className="animate-fade-slide-up animation-delay-300" />
      </div>
    </div>
  );
};

export default Dashboard;
