import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";

const today = new Date().toISOString().split("T")[0];

const INPUT_CLS = "bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

// ── Attendance Confirm Modal ──────────────────────────────────────────────────
const AttendanceConfirmModal = ({ records, people, date, onCancel, onConfirm }) => {
  const absentees = records.filter((r) => r.status === "absent");
  const presentCount = records.filter((r) => r.status === "present").length;
  const peopleMap = people.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg sm:mx-4 flex flex-col max-h-[85vh] sm:max-h-[80vh]">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-600">
          <h3 className="font-bold text-slate-900 dark:text-gray-100 text-lg">Confirm Attendance</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{date}</p>
        </div>
        <div className="px-6 py-3 flex gap-8 border-b border-slate-200 dark:border-gray-600/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</div>
            <div className="text-xs text-slate-500 dark:text-gray-400">Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500 dark:text-red-400">{absentees.length}</div>
            <div className="text-xs text-slate-500 dark:text-gray-400">Absent</div>
          </div>
        </div>
        {absentees.length > 0 ? (
          <div className="overflow-y-auto flex-1">
            <p className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">Absentees</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-gray-700/80 text-slate-500 dark:text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-2 text-left">Name</th>
                    <th className="px-6 py-2 text-left">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {absentees.map((r) => {
                    const idVal = r.childId ?? r.staffId;
                    const person = peopleMap[idVal];
                    return (
                      <tr key={idVal} className="border-t border-slate-200 dark:border-gray-600/50 text-slate-900 dark:text-gray-100">
                        <td className="px-6 py-2.5 font-medium">{person?.name ?? "—"}</td>
                        <td className="px-6 py-2.5 text-slate-500 dark:text-gray-400 text-xs">{r.reason || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="px-6 py-4 text-sm text-slate-500 dark:text-gray-400">All marked present.</p>
        )}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-gray-600/50 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(records)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            Confirm &amp; Submit
          </button>
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
  const [pendingRecords, setPendingRecords] = useState(null);

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
    setPendingRecords(records);
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
          {/* Mobile card view */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-gray-600/50">
            {people.map((p) => {
              const status = statuses[p.id] || "present";
              return (
                <div key={p.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-gray-100 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">{p.age || p.email || "—"}</p>
                    {status === "absent" && (
                      <input
                        type="text"
                        placeholder="Reason for absence…"
                        value={reasons[p.id] || ""}
                        onChange={(e) => setReasons((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        className="mt-2 bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => toggleStatus(p.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      status === "present"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200"
                        : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200"
                    }`}
                  >
                    {status === "present" ? "Present" : "Absent"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
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
          </div>

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
      {pendingRecords && (
        <AttendanceConfirmModal
          records={pendingRecords}
          people={people}
          date={date}
          onCancel={() => setPendingRecords(null)}
          onConfirm={(records) => {
            setPendingRecords(null);
            onSubmit(records);
          }}
        />
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

  const fetchChildren = async () => {
    const res = await api.get("/children");
    setChildren(res.data.sort((a, b) => a.age - b.age));
  };

  const fetchStaff = async () => {
    const res = await api.get("/staff");
    setStaff(res.data);
  };

  useEffect(() => {
    fetchChildren();
    fetchStaff();
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

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Attendance</h2>

      <AttendanceSection
        title="Student Attendance"
        people={children}
        idKey="childId"
        date={childrenDate}
        onDateChange={setChildrenDate}
        onSubmit={handleChildrenSubmit}
        successMsg={childrenSuccess}
      />

      <AttendanceSection
        title="Staff Attendance"
        people={staff}
        idKey="staffId"
        date={staffDate}
        onDateChange={setStaffDate}
        onSubmit={handleStaffSubmit}
        successMsg={staffSuccess}
      />
    </div>
  );
};

export default Attendance;
