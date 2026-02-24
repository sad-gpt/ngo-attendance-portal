import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";

const useCountUp = (target, duration = 900) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) return;
    const start = performance.now();
    const endVal = Number(target);

    const step = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setCount(Math.round(endVal * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return count;
};

const StatCard = ({ label, total, subStats, onClick, icon, className = "", persistSubStats = false }) => {
  const count = useCountUp(total ?? 0);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:scale-[1.02] hover:ring-2 hover:ring-emerald-400/40 active:scale-[0.98] transition-all duration-200 cursor-pointer select-none ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-xl">{icon}</span>}
        <p className="text-sm text-slate-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
        {total !== null && total !== undefined ? count : "—"}
      </p>
      {(persistSubStats || hovered) && subStats && (
        <div className="flex gap-3 mt-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
            In: {subStats.in}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
            Out: {subStats.out}
          </span>
        </div>
      )}
    </div>
  );
};

const BACKDROP = "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm";
const MODAL_BOX = "bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg sm:mx-4 animate-scale-in flex flex-col max-h-[85vh] sm:max-h-[80vh]";
const MODAL_HEADER = "flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-gray-600 shrink-0";
const TABLE_HEAD = "bg-slate-50 dark:bg-gray-600/30 text-slate-500 dark:text-gray-400 uppercase text-xs sticky top-0";

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

const ChildrenModal = ({ onClose }) => {
  const [children, setChildren] = useState([]);
  const [timeMap, setTimeMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/children"), api.get("/logbook/active")]).then(([childrenRes, logbookRes]) => {
      setChildren(childrenRes.data);
      const map = {};
      for (const entry of logbookRes.data) {
        if (entry.type === "child") map[entry.personId] = { exitTime: entry.exitTime, returnTime: entry.returnTime };
      }
      setTimeMap(map);
      setLoading(false);
    });
  }, []);

  const inKids = children.filter((c) => c.status === "in");
  const outKids = children.filter((c) => c.status === "out");

  return createPortal(
    <div className={BACKDROP} onClick={onClose}>
      <div className={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        <div className={MODAL_HEADER}>
          <h3 className="font-semibold text-slate-900 dark:text-gray-100">Children</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-gray-100 text-2xl leading-none p-1">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">Loading…</p>
          ) : children.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">No children found.</p>
          ) : (
            <>
              <div className="px-5 pt-4 pb-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  In Campus <span className="ml-1 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">{inKids.length}</span>
                </p>
              </div>
              {inKids.length === 0 ? (
                <p className="text-center text-slate-400 dark:text-gray-500 py-4 text-sm">None in campus.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={TABLE_HEAD}>
                      <tr><th className="px-5 py-3 text-left">Name</th></tr>
                    </thead>
                    <tbody>
                      {inKids.map((child) => (
                        <tr key={child.id} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                          <td className="px-5 py-3 font-medium">{child.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="px-5 pt-5 pb-2 border-t border-slate-200 dark:border-gray-600/50 mt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                  Outside <span className="ml-1 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full">{outKids.length}</span>
                </p>
              </div>
              {outKids.length === 0 ? (
                <p className="text-center text-slate-400 dark:text-gray-500 py-4 text-sm">None outside.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={TABLE_HEAD}>
                      <tr>
                        <th className="px-5 py-3 text-left">Name</th>
                        <th className="px-5 py-3 text-left">Exit</th>
                        <th className="px-5 py-3 text-left">Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outKids.map((child) => (
                        <tr key={child.id} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                          <td className="px-5 py-3 font-medium">{child.name}</td>
                          <td className="px-5 py-3 text-slate-500 dark:text-gray-400">{fmtTime(timeMap[child.id]?.exitTime)}</td>
                          <td className="px-5 py-3">
                            {timeMap[child.id]?.returnTime
                              ? <span className="text-slate-500 dark:text-gray-400">{fmtTime(timeMap[child.id].returnTime)}</span>
                              : <span className="text-amber-600 dark:text-amber-400 font-medium">Still out</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const StaffModal = ({ onClose }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/staff").then((res) => {
      setStaff(res.data);
      setLoading(false);
    });
  }, []);

  return createPortal(
    <div className={BACKDROP} onClick={onClose}>
      <div className={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        <div className={MODAL_HEADER}>
          <h3 className="font-semibold text-slate-900 dark:text-gray-100">Staff</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-gray-100 text-2xl leading-none p-1">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">Loading…</p>
          ) : staff.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">No staff found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={TABLE_HEAD}>
                  <tr>
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                      <td className="px-5 py-3 font-medium">{s.name}</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-gray-400 text-xs">{s.email}</td>
                      <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const VolunteersModal = ({ onClose }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/volunteers-log/today").then((res) => {
      setEntries(res.data);
      setLoading(false);
    });
  }, []);

  const fmt = (ts) =>
    ts ? new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

  return createPortal(
    <div className={BACKDROP} onClick={onClose}>
      <div className={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        <div className={MODAL_HEADER}>
          <h3 className="font-semibold text-slate-900 dark:text-gray-100">Today's Volunteers</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-gray-100 text-2xl leading-none p-1">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">No volunteers today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={TABLE_HEAD}>
                  <tr>
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left">Reason</th>
                    <th className="px-5 py-3 text-left">Arrived</th>
                    <th className="px-5 py-3 text-left">Departed</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                      <td className="px-5 py-3 font-medium">{e.name}</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-gray-400">{e.reason || "—"}</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-gray-400">{fmt(e.arrivalTime)}</td>
                      <td className="px-5 py-3">
                        {e.departureTime
                          ? <span className="text-slate-500 dark:text-gray-400">{fmt(e.departureTime)}</span>
                          : <span className="text-amber-600 dark:text-amber-400 font-medium">Still here</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const now = new Date();
const dayName = now.toLocaleDateString("en-IN", { weekday: "long" });
const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get("/reports/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-page-enter">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 mb-4">Dashboard</h2>

      <div className="text-center mb-8 animate-fade-slide-up animation-delay-100">
        <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">{dayName}</p>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{dateStr}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Total Children"
          total={stats?.children.total ?? null}
          subStats={stats?.children ? { in: stats.children.in, out: stats.children.out } : null}
          icon="👶"
          onClick={() => setActiveModal("children")}
          className="animate-fade-slide-up animation-delay-100"
          persistSubStats
        />
        <StatCard
          label="Staff"
          total={stats?.staff.total ?? null}
          subStats={stats?.staff ? { in: stats.staff.in, out: stats.staff.out } : null}
          icon="👥"
          onClick={() => setActiveModal("staff")}
          className="animate-fade-slide-up animation-delay-200"
        />
        <StatCard
          label="Volunteers Today"
          total={stats?.volunteers.totalToday ?? null}
          icon="🙋"
          onClick={() => setActiveModal("volunteers")}
          className="animate-fade-slide-up animation-delay-300"
        />
      </div>

      {activeModal === "children" && <ChildrenModal onClose={() => setActiveModal(null)} />}
      {activeModal === "staff" && <StaffModal onClose={() => setActiveModal(null)} />}
      {activeModal === "volunteers" && <VolunteersModal onClose={() => setActiveModal(null)} />}
    </div>
  );
};

export default Dashboard;
