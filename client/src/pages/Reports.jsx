import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";

const ClassReportModal = ({ className, records, date, onClose }) => {
  const present = records.filter((r) => r.status === "present");
  const absent = records.filter((r) => r.status === "absent");
  const total = records.length;
  const pct = total > 0 ? Math.round((present.length / total) * 100) : 0;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-2xl w-full max-w-xl mx-4 animate-scale-in flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-gray-600 shrink-0">
          <div>
            <h3 className="text-slate-900 dark:text-gray-100 font-semibold">{className}</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{date} &middot; {total} student{total !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto flex flex-col">
          {/* Summary bar */}
          <div className="px-6 py-4 flex items-center gap-6 border-b border-slate-200 dark:border-gray-600/50 shrink-0">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500 dark:text-gray-400">Attendance rate</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{pct}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="flex gap-5 shrink-0">
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{present.length}</div>
                <div className="text-xs text-slate-500 dark:text-gray-400">Present</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-500 dark:text-red-400">{absent.length}</div>
                <div className="text-xs text-slate-500 dark:text-gray-400">Absent</div>
              </div>
            </div>
          </div>

          {/* Absentees */}
          {absent.length > 0 && (
            <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-600/50 shrink-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Absentees ({absent.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {absent.map((r, i) => (
                  <span key={i} className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs px-3 py-1 rounded-full">
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full roll list */}
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left">Child</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100">
                  <td className="px-6 py-3">{r.name}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.status === "present"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Reports = () => {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [attendanceRes, childrenRes] = await Promise.all([
        api.get("/reports/attendance"),
        api.get("/children"),
      ]);
      setRecords(attendanceRes.data);
      setChildren(childrenRes.data);
    };
    fetchData();

    // Refresh when the tab regains focus (e.g. after submitting attendance in another tab)
    const onVisible = () => { if (document.visibilityState === "visible") fetchData(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const effectiveDate = dateFilter || today;
  const q = searchQuery.toLowerCase().trim();

  // All distinct real classes from the children DB (skip null/empty)
  const allClasses = [...new Set(
    children.map((c) => c.class).filter(Boolean)
  )].sort();

  // Attendance records for the effective date only
  const dayRecords = records.filter((r) => r.date === effectiveDate);

  // Group by class (skip null/empty class)
  const grouped = dayRecords.reduce((acc, r) => {
    if (!r.class) return acc;
    (acc[r.class] = acc[r.class] || []).push(r);
    return acc;
  }, {});

  // Display list: all classes filtered by search
  const displayClasses = allClasses.filter(
    (cls) => !q || cls.toLowerCase().includes(q)
  );

  const presentCount = (recs) => recs.filter((r) => r.status === "present").length;

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 shrink-0">Reports</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search class…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
          />
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

      {/* Class cards */}
      {displayClasses.length === 0 ? (
        <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-6 animate-fade-slide-up">
          <p className="text-slate-500 dark:text-gray-400 text-sm">
            {allClasses.length === 0 ? "No classes found." : "No results match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayClasses.map((cls, idx) => {
            const recs = grouped[cls];

            if (!recs || recs.length === 0) {
              return (
                <div
                  key={cls}
                  className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 border-dashed rounded-2xl p-5 opacity-60 cursor-default animate-fade-slide-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-semibold text-slate-900 dark:text-gray-100">{cls}</span>
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                      Not taken
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-gray-500">No attendance recorded for this date</p>
                </div>
              );
            }

            const present = presentCount(recs);
            const total = recs.length;
            const pct = total > 0 ? Math.round((present / total) * 100) : 0;

            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-5 text-left hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-500 hover:scale-[1.02] transition-all duration-150 animate-fade-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="font-semibold text-slate-900 dark:text-gray-100">{cls}</span>
                  <span className="text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                    {total} record{total !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-gray-400 shrink-0">{pct}% present</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-2">
                  {present} present · {total - present} absent
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Class report modal */}
      {selectedClass && (
        <ClassReportModal
          className={selectedClass}
          records={grouped[selectedClass] || []}
          date={effectiveDate}
          onClose={() => setSelectedClass(null)}
        />
      )}
    </div>
  );
};

export default Reports;
