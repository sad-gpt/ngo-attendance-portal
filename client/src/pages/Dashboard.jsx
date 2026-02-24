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

const StatCard = ({ label, total, subStats, onClick, icon, className = "" }) => {
  const count = useCountUp(total ?? 0);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.03] hover:ring-2 hover:ring-emerald-400/40 transition-all duration-200 cursor-pointer ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-xl">{icon}</span>}
        <p className="text-sm text-slate-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
        {total !== null && total !== undefined ? count : "—"}
      </p>
      {hovered && subStats && (
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

const BACKDROP = "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm";
const MODAL_BOX = "bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-scale-in flex flex-col max-h-[80vh]";
const MODAL_HEADER = "flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-gray-600 shrink-0";
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

const ChildrenModal = ({ onClose }) => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAge, setSelectedAge] = useState(null);

  useEffect(() => {
    api.get("/children").then((res) => {
      setChildren(res.data);
      setLoading(false);
    });
  }, []);

  const grouped = children.reduce((acc, c) => {
    (acc[c.age] = acc[c.age] || []).push(c);
    return acc;
  }, {});
  const ages = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

  return createPortal(
    <div className={BACKDROP} onClick={onClose}>
      <div className={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        <div className={MODAL_HEADER}>
          <div className="flex items-center gap-3">
            {selectedAge !== null && (
              <button
                onClick={() => setSelectedAge(null)}
                className="text-slate-400 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
            )}
            <h3 className="font-semibold text-slate-900 dark:text-gray-100">
              {selectedAge !== null ? `Age ${selectedAge}` : "Children by Age"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">Loading…</p>
          ) : selectedAge !== null ? (
            <table className="w-full text-sm">
              <thead className={TABLE_HEAD}>
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Gender</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {(grouped[selectedAge] || []).map((child) => (
                  <tr key={child.id} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                    <td className="px-6 py-3 font-medium">{child.name}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{child.gender}</td>
                    <td className="px-6 py-3"><StatusBadge status={child.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : ages.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">No children found.</p>
          ) : (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ages.map((age) => {
                const kids = grouped[age];
                const inCount = kids.filter((k) => k.status === "in").length;
                const outCount = kids.filter((k) => k.status === "out").length;
                return (
                  <button
                    key={age}
                    onClick={() => setSelectedAge(age)}
                    className="flex flex-col items-start p-4 bg-slate-50 dark:bg-gray-600/30 border border-slate-200 dark:border-gray-600 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all duration-150 text-left"
                  >
                    <span className="text-lg font-bold text-slate-900 dark:text-gray-100">Age {age}</span>
                    <span className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{kids.length} total</span>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">In: {inCount}</span>
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">Out: {outCount}</span>
                    </div>
                  </button>
                );
              })}
            </div>
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">Loading…</p>
          ) : staff.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">No staff found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className={TABLE_HEAD}>
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                    <td className="px-6 py-3 font-medium">{s.name}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{s.email}</td>
                    <td className="px-6 py-3"><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">No volunteers today.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className={TABLE_HEAD}>
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Reason</th>
                  <th className="px-6 py-3 text-left">Arrived</th>
                  <th className="px-6 py-3 text-left">Departed</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                    <td className="px-6 py-3 font-medium">{e.name}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{e.reason || "—"}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{fmt(e.arrivalTime)}</td>
                    <td className="px-6 py-3">
                      {e.departureTime
                        ? <span className="text-slate-500 dark:text-gray-400">{fmt(e.departureTime)}</span>
                        : <span className="text-amber-600 dark:text-amber-400 font-medium">Still here</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">{dayName}</p>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{dateStr}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Total Children"
          total={stats?.children.total ?? null}
          subStats={stats?.children ? { in: stats.children.in, out: stats.children.out } : null}
          icon="👶"
          onClick={() => setActiveModal("children")}
          className="animate-fade-slide-up animation-delay-100"
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
