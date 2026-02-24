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
      const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
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

const StatCard = ({ label, value, className = "", onClick, icon }) => {
  const count = useCountUp(value ?? 0);
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-6 hover:shadow-lg hover:scale-[1.03] hover:ring-2 hover:ring-emerald-400/40 transition-all duration-200 ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-xl">{icon}</span>}
        <p className="text-sm text-slate-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
        {value !== null && value !== undefined ? count : "—"}
      </p>
    </div>
  );
};

/* ── Modal shell classes ── */
const BACKDROP = "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm";
const MODAL_BOX = "bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-scale-in flex flex-col max-h-[80vh]";
const MODAL_HEADER = "flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-gray-600 shrink-0";
const TABLE_HEAD = "bg-slate-50 dark:bg-gray-600/30 text-slate-500 dark:text-gray-400 uppercase text-xs sticky top-0";

const ChildrenModal = ({ onClose }) => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    api.get("/children").then((res) => {
      setChildren(res.data);
      setLoading(false);
    });
  }, []);

  const grouped = children.reduce((acc, child) => {
    const key = child.class || "Unclassified";
    (acc[key] = acc[key] || []).push(child);
    return acc;
  }, {});
  const classes = Object.keys(grouped).sort();

  return createPortal(
    <div className={BACKDROP} onClick={onClose}>
      <div className={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        <div className={MODAL_HEADER}>
          <div className="flex items-center gap-3">
            {selectedClass && (
              <button
                onClick={() => setSelectedClass(null)}
                className="text-slate-400 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
            )}
            <h3 className="font-semibold text-slate-900 dark:text-gray-100">
              {selectedClass ? `Class: ${selectedClass}` : "Children by Class"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">Loading…</p>
          ) : selectedClass ? (
            <table className="w-full text-sm">
              <thead className={TABLE_HEAD}>
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Age</th>
                  <th className="px-6 py-3 text-left">Gender</th>
                </tr>
              </thead>
              <tbody>
                {(grouped[selectedClass] || []).map((child) => (
                  <tr key={child.id} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                    <td className="px-6 py-3 font-medium">{child.name}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{child.age}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{child.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead className={TABLE_HEAD}>
                <tr>
                  <th className="px-6 py-3 text-left">Class</th>
                  <th className="px-6 py-3 text-left">Students</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100 hover:bg-slate-50 dark:hover:bg-gray-600/20 cursor-pointer"
                  >
                    <td className="px-6 py-3 font-medium">{cls}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{grouped[cls].length}</td>
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
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/volunteers").then((res) => {
      setVolunteers(res.data);
      setLoading(false);
    });
  }, []);

  return createPortal(
    <div className={BACKDROP} onClick={onClose}>
      <div className={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        <div className={MODAL_HEADER}>
          <h3 className="font-semibold text-slate-900 dark:text-gray-100">Volunteers</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">Loading…</p>
          ) : volunteers.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">No volunteers found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className={TABLE_HEAD}>
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((v) => (
                  <tr key={v.id} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                    <td className="px-6 py-3 font-medium">{v.name}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{v.role}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{v.email}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{v.phone}</td>
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

const AttendanceModal = ({ onClose }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    api.get("/attendance/today").then((res) => {
      setRecords(res.data);
      setLoading(false);
    });
  }, []);

  const grouped = records.reduce((acc, r) => {
    const key = r.class || "Unclassified";
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});
  const classes = Object.keys(grouped).sort();

  return createPortal(
    <div className={BACKDROP} onClick={onClose}>
      <div className={MODAL_BOX} onClick={(e) => e.stopPropagation()}>
        <div className={MODAL_HEADER}>
          <div className="flex items-center gap-3">
            {selectedClass && (
              <button
                onClick={() => setSelectedClass(null)}
                className="text-slate-400 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
            )}
            <h3 className="font-semibold text-slate-900 dark:text-gray-100">
              {selectedClass ? `Present in ${selectedClass}` : "Today's Attendance"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">Loading…</p>
          ) : records.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">No attendance marked for today.</p>
          ) : selectedClass ? (
            <table className="w-full text-sm">
              <thead className={TABLE_HEAD}>
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                </tr>
              </thead>
              <tbody>
                {(grouped[selectedClass] || []).map((r) => (
                  <tr key={r.childId} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                    <td className="px-6 py-3 font-medium">{r.childName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead className={TABLE_HEAD}>
                <tr>
                  <th className="px-6 py-3 text-left">Class</th>
                  <th className="px-6 py-3 text-left">Present</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100 hover:bg-slate-50 dark:hover:bg-gray-600/20 cursor-pointer"
                  >
                    <td className="px-6 py-3 font-medium">{cls}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{grouped[cls].length}</td>
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
  const [stats, setStats] = useState({ totalChildren: null, totalVolunteers: null, attendanceToday: null });
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get("/reports/dashboard-stats");
      setStats(res.data);
    };
    fetchStats();
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
          value={stats.totalChildren}
          icon="👶"
          onClick={() => setActiveModal("children")}
          className="animate-fade-slide-up animation-delay-100"
        />
        <StatCard
          label="Total Volunteers"
          value={stats.totalVolunteers}
          icon="🙋"
          onClick={() => setActiveModal("volunteers")}
          className="animate-fade-slide-up animation-delay-200"
        />
        <StatCard
          label="Present Today"
          value={stats.attendanceToday}
          icon="✅"
          onClick={() => setActiveModal("attendance")}
          className="animate-fade-slide-up animation-delay-300"
        />
      </div>

      {activeModal === "children"   && <ChildrenModal   onClose={() => setActiveModal(null)} />}
      {activeModal === "volunteers" && <VolunteersModal  onClose={() => setActiveModal(null)} />}
      {activeModal === "attendance" && <AttendanceModal  onClose={() => setActiveModal(null)} />}
    </div>
  );
};

export default Dashboard;
