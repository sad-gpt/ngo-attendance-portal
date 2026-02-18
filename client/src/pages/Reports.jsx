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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">Reports</h2>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400">Filter by date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-xs text-gray-400 hover:text-gray-200 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700/50 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm p-6">No attendance records found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Child</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-t border-gray-700/50 hover:bg-gray-700/50 text-gray-100">
                  <td className="px-6 py-3">{r.name}</td>
                  <td className="px-6 py-3 text-gray-400">{r.date}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === "present"
                          ? "bg-green-900/50 text-green-400"
                          : "bg-red-900/50 text-red-400"
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
