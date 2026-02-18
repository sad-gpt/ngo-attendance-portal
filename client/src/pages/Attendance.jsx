import { useEffect, useState } from "react";
import api from "../services/api";

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [form, setForm] = useState({ childId: "", date: "", status: "present" });

  const fetchRecords = async () => {
    const res = await api.get("/attendance");
    setRecords(res.data);
  };

  useEffect(() => {
    const fetchChildren = async () => {
      const res = await api.get("/children");
      setChildren(res.data);
    };
    fetchChildren();
    fetchRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/attendance", form);
    setForm({ childId: "", date: "", status: "present" });
    fetchRecords();
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-800">Attendance</h2>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Record Attendance</h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Child</label>
            <select
              required
              value={form.childId}
              onChange={(e) => setForm({ ...form, childId: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select child</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Records table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {records.length === 0 ? (
          <p className="text-gray-500 text-sm p-6">No attendance records found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Child</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3">{r.childName ?? r.child_id}</td>
                  <td className="px-6 py-3 text-gray-500">{r.date}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === "present"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
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

export default Attendance;
