import { useEffect, useState } from "react";
import api from "../services/api";

const today = new Date().toISOString().split("T")[0];

const Attendance = () => {
  const [children, setChildren] = useState([]);
  const [records, setRecords] = useState([]);

  // Step 1 state
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(today);
  const [classStudents, setClassStudents] = useState([]);

  // Step 2 state — set of childIds marked absent
  const [absentIds, setAbsentIds] = useState(new Set());

  // Step 3 — confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchChildren = async () => {
    const res = await api.get("/children");
    setChildren(res.data);
  };

  const fetchRecords = async () => {
    const res = await api.get("/attendance");
    setRecords(res.data);
  };

  useEffect(() => {
    fetchChildren();
    fetchRecords();
  }, []);

  const classes = [...new Set(children.map((c) => c.class).filter(Boolean))].sort();

  const handleLoadStudents = () => {
    if (!selectedClass) return;
    const students = children.filter((c) => c.class === selectedClass);
    setClassStudents(students);
    setAbsentIds(new Set());
    setSuccessMsg("");
  };

  const toggleAbsent = (id) => {
    setAbsentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const absentees = classStudents.filter((c) => absentIds.has(c.id));
  const presentStudents = classStudents.filter((c) => !absentIds.has(c.id));

  const handleConfirmSubmit = async () => {
    const records = classStudents.map((c) => ({
      childId: c.id,
      date,
      status: absentIds.has(c.id) ? "absent" : "present",
    }));
    await api.post("/attendance/mark", { records });
    setShowConfirm(false);
    setClassStudents([]);
    setSelectedClass("");
    setAbsentIds(new Set());
    setSuccessMsg(`Attendance submitted for ${date} — ${presentStudents.length} present, ${absentees.length} absent.`);
    fetchRecords();
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-100">Attendance</h2>

      {successMsg && (
        <div className="bg-emerald-900/40 border border-emerald-700/50 text-emerald-400 text-sm px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}

      {/* Step 1 — Class & Date selection */}
      <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Select Class &amp; Date</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={handleLoadStudents}
            disabled={!selectedClass}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Load Students
          </button>
        </div>
      </div>

      {/* Step 2 — Student checklist */}
      {classStudents.length > 0 && (
        <div className="bg-gray-800 border border-gray-700/50 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300">
              {selectedClass} — {classStudents.length} student{classStudents.length !== 1 ? "s" : ""}
            </h3>
            <span className="text-xs text-gray-400">Check box to mark absent</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Class</th>
                <th className="px-6 py-3 text-center">Absent?</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((c) => (
                <tr key={c.id} className="border-t border-gray-700/50 hover:bg-gray-700/30 text-gray-100">
                  <td className="px-6 py-3">{c.name}</td>
                  <td className="px-6 py-3 text-gray-400">{c.class}</td>
                  <td className="px-6 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={absentIds.has(c.id)}
                      onChange={() => toggleAbsent(c.id)}
                      className="w-4 h-4 accent-red-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-gray-700/50 flex justify-end">
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Submit Attendance
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-gray-100">Confirm Attendance</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-300">
              <p><span className="text-gray-400">Date:</span> {date}</p>
              <p><span className="text-gray-400">Class:</span> {selectedClass}</p>
              <p><span className="text-gray-400">Present:</span> {presentStudents.length}</p>
              <p><span className="text-gray-400">Absent:</span> {absentees.length}</p>
            </div>
            {absentees.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-400 font-semibold uppercase">Absentees</p>
                <div className="flex flex-wrap gap-2">
                  {absentees.map((c) => (
                    <span key={c.id} className="bg-red-900/30 text-red-400 text-xs px-3 py-1 rounded-full">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-700">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-600 hover:bg-gray-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Confirm &amp; Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Records table */}
      <div className="bg-gray-800 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h3 className="text-sm font-semibold text-gray-300">Attendance Records</h3>
        </div>
        {records.length === 0 ? (
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
              {records.map((r) => (
                <tr key={r.id} className="border-t border-gray-700/50 hover:bg-gray-700/50 text-gray-100">
                  <td className="px-6 py-3">{r.childName}</td>
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

export default Attendance;
