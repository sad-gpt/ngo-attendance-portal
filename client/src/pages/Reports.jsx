import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";

const todayStr = new Date().toISOString().slice(0, 10);

const INPUT_CLS = "bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

const fmtTime = (ts) =>
  ts ? new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

// ── Age Detail Modal ─────────────────────────────────────────────────────────
const AgeDetailModal = ({ age, date, onClose }) => {
  const [children, setChildren] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/children"),
      api.get(`/reports/attendance/children?date=${date}`),
    ]).then(([c, a]) => {
      const ageKids = c.data.filter((k) => String(k.age) === String(age));
      setChildren(ageKids);
      const map = {};
      a.data.forEach(() => {}); // The age summary doesn't have child-level details
      // Re-fetch child-level data
      api.get("/attendance/children").then((all) => {
        all.data
          .filter((r) => r.date === date)
          .forEach((r) => { map[r.childId] = { status: r.status, reason: r.reason }; });
        setAttendanceMap(map);
        setLoading(false);
      });
    });
  }, [age, date]);

  const ageKids = children;
  const present = ageKids.filter((k) => attendanceMap[k.id]?.status === "present").length;
  const absent = ageKids.filter((k) => attendanceMap[k.id]?.status === "absent").length;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-2xl w-full max-w-xl mx-4 animate-scale-in flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-gray-600 shrink-0">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-gray-100">Age {age} — {date}</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{ageKids.length} students</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>
        {!loading && (
          <div className="px-6 py-3 flex gap-6 border-b border-slate-200 dark:border-gray-600/50 shrink-0">
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{present}</div>
              <div className="text-xs text-slate-500 dark:text-gray-400">Present</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-500 dark:text-red-400">{absent}</div>
              <div className="text-xs text-slate-500 dark:text-gray-400">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-slate-400 dark:text-gray-500">{ageKids.length - present - absent}</div>
              <div className="text-xs text-slate-500 dark:text-gray-400">Not marked</div>
            </div>
          </div>
        )}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">Loading…</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-gray-600/30 text-slate-500 dark:text-gray-400 uppercase text-xs sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Gender</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {ageKids.map((k) => {
                  const rec = attendanceMap[k.id];
                  return (
                    <tr key={k.id} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                      <td className="px-6 py-3 font-medium">{k.name}</td>
                      <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{k.gender}</td>
                      <td className="px-6 py-3">
                        {rec ? (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            rec.status === "present"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                          }`}>
                            {rec.status}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-500 text-xs">Not marked</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-slate-500 dark:text-gray-400 text-xs">{rec?.reason || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main Reports Component ────────────────────────────────────────────────────
const Reports = () => {
  const [tab, setTab] = useState("children");
  const [date, setDate] = useState(todayStr);

  // Children tab data
  const [ageGroups, setAgeGroups] = useState([]);
  const [selectedAge, setSelectedAge] = useState(null);

  // Staff tab data
  const [staffData, setStaffData] = useState([]);

  // Volunteers tab data
  const [volData, setVolData] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (tab === "children") {
      api.get(`/reports/attendance/children?date=${date}`).then((r) => { setAgeGroups(r.data); setLoading(false); });
    } else if (tab === "staff") {
      api.get(`/reports/attendance/staff?date=${date}`).then((r) => { setStaffData(r.data); setLoading(false); });
    } else {
      api.get(`/reports/volunteers-log?date=${date}`).then((r) => { setVolData(r.data); setLoading(false); });
    }
  }, [tab, date]);

  const presentStaff = staffData.filter((s) => s.status === "present").length;
  const absentStaff = staffData.filter((s) => s.status === "absent").length;

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 shrink-0">Reports</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs text-slate-500 dark:text-gray-400">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INPUT_CLS} />
          {date !== todayStr && (
            <button onClick={() => setDate(todayStr)} className="text-xs text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 underline">Today</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-gray-700 rounded-xl p-1 w-fit">
        {["children", "staff", "volunteers"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              tab === t
                ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm"
                : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-8 text-center">
          <p className="text-slate-400 dark:text-gray-500 text-sm">Loading…</p>
        </div>
      ) : (
        <>
          {/* Children Tab */}
          {tab === "children" && (
            <>
              {ageGroups.length === 0 ? (
                <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-6">
                  <p className="text-slate-500 dark:text-gray-400 text-sm">No children records found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ageGroups.map((g, idx) => (
                    <button
                      key={g.age}
                      onClick={() => setSelectedAge(g.age)}
                      className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-5 text-left hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-500 hover:scale-[1.02] transition-all duration-150 animate-fade-slide-up"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-semibold text-slate-900 dark:text-gray-100">Age {g.age}</span>
                        <span className="text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-600 px-2 py-0.5 rounded-full">{g.total} students</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-slate-100 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${g.percentage}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-gray-400 shrink-0">{g.percentage}%</span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-gray-500">
                        {g.present} present · {g.absent} absent · {g.total - g.present - g.absent} not marked
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {selectedAge !== null && (
                <AgeDetailModal age={selectedAge} date={date} onClose={() => setSelectedAge(null)} />
              )}
            </>
          )}

          {/* Staff Tab */}
          {tab === "staff" && (
            <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up">
              {staffData.length > 0 && (
                <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-600/50 flex items-center gap-6 flex-wrap">
                  <span className="text-sm text-slate-600 dark:text-gray-300 font-medium">{staffData.length} staff members</span>
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{presentStaff} present</span>
                  <span className="text-sm text-red-500 dark:text-red-400 font-semibold">{absentStaff} absent</span>
                  <span className="text-sm text-slate-400 dark:text-gray-500">{staffData.length - presentStaff - absentStaff} not marked</span>
                </div>
              )}
              {staffData.length === 0 ? (
                <p className="text-slate-500 dark:text-gray-400 text-sm p-6">No staff records found.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffData.map((s) => (
                      <tr key={s.staffId} className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100">
                        <td className="px-6 py-3 font-medium">{s.name}</td>
                        <td className="px-6 py-3">
                          {s.status ? (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              s.status === "present"
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                            }`}>
                              {s.status}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-gray-500 text-xs">Not marked</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-slate-500 dark:text-gray-400 text-xs">{s.reason || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Volunteers Tab */}
          {tab === "volunteers" && (
            <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up">
              {volData.length > 0 && (
                <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-600/50">
                  <span className="text-sm text-slate-600 dark:text-gray-300 font-medium">{volData.length} volunteer{volData.length !== 1 ? "s" : ""} on {date}</span>
                </div>
              )}
              {volData.length === 0 ? (
                <p className="text-slate-500 dark:text-gray-400 text-sm p-6">No volunteers recorded for this date.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Reason</th>
                      <th className="px-6 py-3 text-left">Arrived</th>
                      <th className="px-6 py-3 text-left">Departed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volData.map((v) => (
                      <tr key={v.id} className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100">
                        <td className="px-6 py-3 font-medium">{v.name}</td>
                        <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{v.reason || "—"}</td>
                        <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{fmtTime(v.arrivalTime)}</td>
                        <td className="px-6 py-3">
                          {v.departureTime
                            ? <span className="text-slate-500 dark:text-gray-400">{fmtTime(v.departureTime)}</span>
                            : <span className="text-amber-600 dark:text-amber-400 font-medium">Still present</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
