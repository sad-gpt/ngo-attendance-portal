import { useEffect, useState } from "react";
import api from "../services/api";

const Reports = () => {
  const [records, setRecords] = useState([]);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      const res = await api.get("/reports/attendance");
      setRecords(res.data);
    };
    fetchRecords();
  }, []);

  const filtered = dateFilter
    ? records.filter((r) => r.date === dateFilter)
    : records;

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Reports</h2>
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500 dark:text-gray-400">Filter by date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-xs text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up animation-delay-100 hover:shadow-md transition-shadow duration-200">
        {filtered.length === 0 ? (
          <p className="text-slate-500 dark:text-gray-400 text-sm p-6">No attendance records found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Child</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100">
                  <td className="px-6 py-3">{r.name}</td>
                  <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{r.date}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === "present"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;
