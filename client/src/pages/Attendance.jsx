import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";

const today = new Date().toISOString().split("T")[0];

const INPUT_CLS = "bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

const StatusBadge = ({ status }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
    status === "in"
      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
  }`}>
    {status === "in" ? "In Campus" : "Outside"}
  </span>
);

const fmtTime = (ts) =>
  ts ? new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

// ── Logbook Panel ────────────────────────────────────────────────────────────
const LogbookPanel = ({ onClose }) => {
  const [tab, setTab] = useState("children");
  const [children, setChildren] = useState([]);
  const [staff, setStaff] = useState([]);
  const [activeEntries, setActiveEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [exitForm, setExitForm] = useState(null); // { personId, type, name }
  const [exitReason, setExitReason] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    const [c, s, active] = await Promise.all([
      api.get("/children"),
      api.get("/staff"),
      api.get("/logbook/active"),
    ]);
    setChildren(c.data);
    setStaff(s.data);
    setActiveEntries(active.data);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const activeMap = activeEntries.reduce((acc, e) => {
    acc[`${e.type}-${e.personId}`] = e;
    return acc;
  }, {});

  const q = searchQuery.toLowerCase().trim();
  const people = (tab === "children" ? children : staff).filter((p) =>
    !q || p.name.toLowerCase().includes(q)
  );

  const handleMarkOut = async () => {
    if (!exitForm) return;
    setLoading(true);
    await api.post("/logbook", {
      personId: exitForm.personId,
      type: exitForm.type,
      reason: exitReason || null,
      exitTime: new Date().toISOString(),
    });
    setLoading(false);
    setExitForm(null);
    setExitReason("");
    fetchAll();
  };

  const handleMarkReturn = async (entry) => {
    setLoading(true);
    await api.put(`/logbook/${entry.id}/return`, { returnTime: new Date().toISOString() });
    setLoading(false);
    fetchAll();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl mx-auto flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-gray-600 shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-gray-100 text-lg">Logbook</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>

        {/* Tabs + Search */}
        <div className="px-6 pt-4 pb-3 flex items-center gap-4 border-b border-slate-200 dark:border-gray-600/50 shrink-0 flex-wrap">
          <div className="flex gap-1 bg-slate-100 dark:bg-gray-700 rounded-xl p-1">
            {["children", "staff"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSearchQuery(""); setExitForm(null); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  tab === t
                    ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
                }`}
              >
                {t === "children" ? "Students" : "Staff"}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Exit form */}
        {exitForm && (
          <div className="px-6 py-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/50 shrink-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-gray-100 mb-2">
              Mark <span className="text-amber-600 dark:text-amber-400">{exitForm.name}</span> as going outside
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Reason (optional)"
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
                className={`flex-1 ${INPUT_CLS}`}
              />
              <button onClick={handleMarkOut} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
                {loading ? "…" : "Confirm Exit"}
              </button>
              <button onClick={() => { setExitForm(null); setExitReason(""); }} className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 text-sm px-2">Cancel</button>
            </div>
          </div>
        )}

        {/* People list */}
        <div className="overflow-y-auto flex-1">
          {people.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">No records found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-gray-700/80 text-slate-500 dark:text-gray-400 uppercase text-xs sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => {
                  const key = `${tab === "children" ? "child" : "staff"}-${person.id}`;
                  const activeEntry = activeMap[key];
                  return (
                    <tr key={person.id} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100 hover:bg-slate-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-3 font-medium">{person.name}</td>
                      <td className="px-6 py-3"><StatusBadge status={person.status} /></td>
                      <td className="px-6 py-3 text-right">
                        {person.status === "in" ? (
                          <button
                            onClick={() => setExitForm({ personId: person.id, type: tab === "children" ? "child" : "staff", name: person.name })}
                            className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/40 px-3 py-1 rounded-lg font-medium transition-colors"
                          >
                            Mark Going Out
                          </button>
                        ) : activeEntry ? (
                          <button
                            onClick={() => handleMarkReturn(activeEntry)}
                            disabled={loading}
                            className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            Mark Returned
                          </button>
                        ) : null}
                      </td>
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

// ── Attendance Section Helper ─────────────────────────────────────────────────
const AttendanceSection = ({ title, people, idKey, date, onDateChange, onSubmit, successMsg }) => {
  const [statuses, setStatuses] = useState({});
  const [reasons, setReasons] = useState({});

  useEffect(() => {
    const init = {};
    people.forEach((p) => { init[p.id] = "present"; });
    setStatuses(init);
    setReasons({});
  }, [people]);

  const toggleStatus = (id) => {
    setStatuses((prev) => ({ ...prev, [id]: prev[id] === "present" ? "absent" : "present" }));
  };

  const handleSubmit = () => {
    const records = people.map((p) => ({
      [idKey]: p.id,
      date,
      status: statuses[p.id] || "present",
      reason: statuses[p.id] === "absent" ? (reasons[p.id] || null) : null,
    }));
    onSubmit(records);
  };

  return (
    <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up hover:shadow-md transition-shadow duration-200">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-600/50 flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-gray-300">{title}</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-gray-400">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className={INPUT_CLS}
          />
        </div>
      </div>

      {successMsg && (
        <div className="mx-6 mt-4 bg-green-100 dark:bg-emerald-900/40 border border-green-200 dark:border-emerald-700/50 text-green-700 dark:text-emerald-400 text-sm px-4 py-3 rounded-xl">
          {successMsg}
        </div>
      )}

      {people.length === 0 ? (
        <p className="text-slate-500 dark:text-gray-400 text-sm p-6">No records found.</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Age / Info</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-left">Reason (if absent)</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => {
                const status = statuses[p.id] || "present";
                return (
                  <tr key={p.id} className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100">
                    <td className="px-6 py-3 font-medium">{p.name}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{p.age || p.email || "—"}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => toggleStatus(p.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          status === "present"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200"
                        }`}
                      >
                        {status === "present" ? "Present" : "Absent"}
                      </button>
                    </td>
                    <td className="px-6 py-3">
                      {status === "absent" && (
                        <input
                          type="text"
                          placeholder="Enter reason…"
                          value={reasons[p.id] || ""}
                          onChange={(e) => setReasons((prev) => ({ ...prev, [p.id]: e.target.value }))}
                          className="bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full max-w-xs"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-slate-200 dark:border-gray-600/50 flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              Submit Attendance
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ── Main Attendance Component ─────────────────────────────────────────────────
const Attendance = () => {
  const [children, setChildren] = useState([]);
  const [staff, setStaff] = useState([]);
  const [childrenDate, setChildrenDate] = useState(today);
  const [staffDate, setStaffDate] = useState(today);
  const [childrenSuccess, setChildrenSuccess] = useState("");
  const [staffSuccess, setStaffSuccess] = useState("");

  // Volunteer log
  const [volForm, setVolForm] = useState({ name: "", reason: "" });
  const [volEntries, setVolEntries] = useState([]);
  const [showLogbook, setShowLogbook] = useState(false);

  const fetchChildren = async () => {
    const res = await api.get("/children");
    setChildren(res.data.sort((a, b) => a.age - b.age));
  };

  const fetchStaff = async () => {
    const res = await api.get("/staff");
    setStaff(res.data);
  };

  const fetchVolEntries = async () => {
    const res = await api.get("/volunteers-log/today");
    setVolEntries(res.data);
  };

  useEffect(() => {
    fetchChildren();
    fetchStaff();
    fetchVolEntries();
  }, []);

  const handleChildrenSubmit = async (records) => {
    await api.post("/attendance/children/mark", { records });
    setChildrenSuccess(`Attendance submitted for ${childrenDate} — ${records.filter((r) => r.status === "present").length} present, ${records.filter((r) => r.status === "absent").length} absent.`);
    setTimeout(() => setChildrenSuccess(""), 4000);
  };

  const handleStaffSubmit = async (records) => {
    await api.post("/attendance/staff/mark", { records });
    setStaffSuccess(`Staff attendance submitted for ${staffDate}.`);
    setTimeout(() => setStaffSuccess(""), 4000);
  };

  const handleVolArrival = async (e) => {
    e.preventDefault();
    if (!volForm.name.trim()) return;
    await api.post("/volunteers-log", { ...volForm, arrivalTime: new Date().toISOString() });
    setVolForm({ name: "", reason: "" });
    fetchVolEntries();
  };

  const handleVolDeparture = async (id) => {
    await api.put(`/volunteers-log/${id}/departure`, { departureTime: new Date().toISOString() });
    fetchVolEntries();
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter pb-24">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Attendance</h2>

      {/* Section 1 — Student Attendance */}
      <AttendanceSection
        title="Student Attendance"
        people={children}
        idKey="childId"
        date={childrenDate}
        onDateChange={setChildrenDate}
        onSubmit={handleChildrenSubmit}
        successMsg={childrenSuccess}
      />

      {/* Section 2 — Staff Attendance */}
      <AttendanceSection
        title="Staff Attendance"
        people={staff}
        idKey="staffId"
        date={staffDate}
        onDateChange={setStaffDate}
        onSubmit={handleStaffSubmit}
        successMsg={staffSuccess}
      />

      {/* Section 3 — Volunteer Log */}
      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-6 animate-fade-slide-up hover:shadow-md transition-shadow duration-200">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-gray-300 mb-4">Volunteer Log</h3>
        <form onSubmit={handleVolArrival} className="flex gap-3 flex-wrap mb-5">
          <input
            required
            placeholder="Volunteer name"
            value={volForm.name}
            onChange={(e) => setVolForm({ ...volForm, name: e.target.value })}
            className={`flex-1 min-w-[160px] ${INPUT_CLS}`}
          />
          <input
            placeholder="Reason / purpose"
            value={volForm.reason}
            onChange={(e) => setVolForm({ ...volForm, reason: e.target.value })}
            className={`flex-1 min-w-[160px] ${INPUT_CLS}`}
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
            Log Arrival
          </button>
        </form>

        {volEntries.length > 0 && (
          <div className="border border-slate-200 dark:border-gray-600 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-gray-600/30 text-slate-500 dark:text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-left">Arrived</th>
                  <th className="px-4 py-3 text-left">Departed</th>
                  <th className="px-4 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {volEntries.map((e) => (
                  <tr key={e.id} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                    <td className="px-4 py-3 font-medium">{e.name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{e.reason || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{fmtTime(e.arrivalTime)}</td>
                    <td className="px-4 py-3">
                      {e.departureTime
                        ? <span className="text-slate-500 dark:text-gray-400">{fmtTime(e.departureTime)}</span>
                        : <span className="text-amber-600 dark:text-amber-400 font-medium">Still here</span>}
                    </td>
                    <td className="px-4 py-3">
                      {!e.departureTime && (
                        <button
                          onClick={() => handleVolDeparture(e.id)}
                          className="text-xs text-slate-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 underline transition-colors"
                        >
                          Log Departure
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fixed LOG button */}
      <button
        onClick={() => setShowLogbook(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 dark:bg-gray-100 text-white dark:text-slate-900 font-bold text-sm px-6 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-150 flex items-center gap-2"
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
        LOG
      </button>

      {showLogbook && <LogbookPanel onClose={() => setShowLogbook(false)} />}
    </div>
  );
};

export default Attendance;
