import { useEffect, useState } from "react";
import api from "../services/api";

const todayStr = new Date().toISOString().slice(0, 10);

const INPUT_CLS = "bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

const fmtTime = (ts) =>
  ts ? new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

// ── Main Reports Component ────────────────────────────────────────────────────
const Reports = () => {
  const [tab, setTab] = useState("children");
  const [date, setDate] = useState(todayStr);

  // Children tab
  const [childrenData, setChildrenData] = useState([]);
  const [staffDataForChildren, setStaffDataForChildren] = useState([]);
  const [logbookData, setLogbookData] = useState([]);

  // Staff tab
  const [staffData, setStaffData] = useState([]);

  // Volunteers tab
  const [volData, setVolData] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (tab === "children") {
      Promise.all([
        api.get(`/reports/attendance/children?date=${date}`),
        api.get(`/reports/attendance/staff?date=${date}`),
        api.get(`/logbook?date=${date}`),
      ]).then(([c, s, l]) => {
        setChildrenData(c.data);
        setStaffDataForChildren(s.data);
        setLogbookData(l.data);
        setLoading(false);
      });
    } else if (tab === "staff") {
      api.get(`/reports/attendance/staff?date=${date}`).then((r) => { setStaffData(r.data); setLoading(false); });
    } else {
      api.get(`/reports/volunteers-log?date=${date}`).then((r) => { setVolData(r.data); setLoading(false); });
    }
  }, [tab, date]);

  // Logbook map keyed by "child-{id}" or "staff-{id}" — take most recent (entries are id DESC)
  const logbookMap = logbookData.reduce((acc, e) => {
    const key = `${e.type}-${e.personId}`;
    if (!acc[key]) acc[key] = e;
    return acc;
  }, {});

  // Children stats
  const totalChildren = childrenData.length;
  const presentChildren = childrenData.filter((c) => c.status === "present").length;
  const absentChildren = childrenData.filter((c) => c.status === "absent").length;
  const notMarkedChildren = totalChildren - presentChildren - absentChildren;

  // Staff stats (staff tab)
  const presentStaff = staffData.filter((s) => s.status === "present").length;
  const absentStaff = staffData.filter((s) => s.status === "absent").length;

  // Absentee sections (children tab)
  const studentAbsentees = childrenData.filter((c) => c.status === "absent");
  const staffAbsentees = staffDataForChildren.filter((s) => s.status === "absent");

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
          {/* ── Children Tab ── */}
          {tab === "children" && (
            <div className="flex flex-col gap-6">
              {/* Summary bar */}
              <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up">
                {totalChildren > 0 && (
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-600/50 flex items-center gap-6 flex-wrap">
                    <span className="text-sm text-slate-600 dark:text-gray-300 font-medium">{totalChildren} students</span>
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{presentChildren} present</span>
                    <span className="text-sm text-red-500 dark:text-red-400 font-semibold">{absentChildren} absent</span>
                    <span className="text-sm text-slate-400 dark:text-gray-500">{notMarkedChildren} not marked</span>
                  </div>
                )}
                {childrenData.length === 0 ? (
                  <p className="text-slate-500 dark:text-gray-400 text-sm p-6">No children records found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Name</th>
                          <th className="px-6 py-3 text-left">Age</th>
                          <th className="px-6 py-3 text-left">Gender</th>
                          <th className="px-6 py-3 text-left">Status</th>
                          <th className="px-6 py-3 text-left">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {childrenData.map((c) => (
                          <tr key={c.childId} className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100">
                            <td className="px-6 py-3 font-medium">{c.name}</td>
                            <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{c.age}</td>
                            <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{c.gender || "—"}</td>
                            <td className="px-6 py-3">
                              {c.status ? (
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                  c.status === "present"
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                    : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                }`}>
                                  {c.status}
                                </span>
                              ) : (
                                <span className="text-slate-400 dark:text-gray-500 text-xs">Not marked</span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-slate-500 dark:text-gray-400 text-xs">{c.reason || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Student Absentees with logbook times */}
              {studentAbsentees.length > 0 && (
                <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-600/50">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                      Student Absentees
                      <span className="ml-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-2 py-0.5 rounded-full">{studentAbsentees.length}</span>
                    </h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Reason</th>
                        <th className="px-6 py-3 text-left">Exit Time</th>
                        <th className="px-6 py-3 text-left">Return Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentAbsentees.map((c) => {
                        const entry = logbookMap[`child-${c.childId}`];
                        return (
                          <tr key={c.childId} className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100">
                            <td className="px-6 py-3 font-medium">{c.name}</td>
                            <td className="px-6 py-3 text-slate-500 dark:text-gray-400 text-xs">{entry?.reason || "—"}</td>
                            <td className="px-6 py-3 text-slate-500 dark:text-gray-400 text-xs">{entry ? fmtTime(entry.exitTime) : "—"}</td>
                            <td className="px-6 py-3 text-xs">
                              {entry
                                ? entry.returnTime
                                  ? <span className="text-slate-500 dark:text-gray-400">{fmtTime(entry.returnTime)}</span>
                                  : <span className="text-amber-600 dark:text-amber-400 font-medium">Still out</span>
                                : <span className="text-slate-400 dark:text-gray-500">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Staff Absentees with logbook times */}
              {staffAbsentees.length > 0 && (
                <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-600/50">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-200">
                      Staff Absentees
                      <span className="ml-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-2 py-0.5 rounded-full">{staffAbsentees.length}</span>
                    </h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Reason</th>
                        <th className="px-6 py-3 text-left">Exit Time</th>
                        <th className="px-6 py-3 text-left">Return Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffAbsentees.map((s) => {
                        const entry = logbookMap[`staff-${s.staffId}`];
                        return (
                          <tr key={s.staffId} className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100">
                            <td className="px-6 py-3 font-medium">{s.name}</td>
                            <td className="px-6 py-3 text-slate-500 dark:text-gray-400 text-xs">{entry?.reason || "—"}</td>
                            <td className="px-6 py-3 text-slate-500 dark:text-gray-400 text-xs">{entry ? fmtTime(entry.exitTime) : "—"}</td>
                            <td className="px-6 py-3 text-xs">
                              {entry
                                ? entry.returnTime
                                  ? <span className="text-slate-500 dark:text-gray-400">{fmtTime(entry.returnTime)}</span>
                                  : <span className="text-amber-600 dark:text-amber-400 font-medium">Still out</span>
                                : <span className="text-slate-400 dark:text-gray-500">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Staff Tab ── */}
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

          {/* ── Volunteers Tab ── */}
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
