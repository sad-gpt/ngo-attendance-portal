import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";

const INPUT_CLS = "bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

const emptyForm = { name: "", age: "", email: "" };

const StatusBadge = ({ status }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
    status === "in"
      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
  }`}>
    {status === "in" ? "In Campus" : "Outside"}
  </span>
);

const StaffProfileModal = ({ member, onClose, onRefresh }) => {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: member.name, age: member.age ?? "", email: member.email });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    try {
      await api.put(`/staff/${member.id}`, form);
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    await api.delete(`/staff/${member.id}`);
    onRefresh();
    onClose();
  };

  const handleStatusToggle = async () => {
    setTogglingStatus(true);
    const newStatus = member.status === "in" ? "out" : "in";
    await api.put(`/staff/${member.id}/status`, { status: newStatus });
    setTogglingStatus(false);
    onRefresh();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:mx-4 p-6 flex flex-col gap-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100">Staff Profile</h3>
          <button onClick={onClose} className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>

        <div className="flex flex-col gap-4">
          {[{ label: "Name", key: "name" }, { label: "Age", key: "age", type: "number" }, { label: "Email", key: "email", type: "email" }].map(({ label, key, type }) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 dark:text-gray-400">{label}</span>
              {editMode ? (
                <input
                  type={type || "text"}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={INPUT_CLS}
                />
              ) : (
                <span className="text-slate-900 dark:text-gray-100 text-sm">{member[key] || "—"}</span>
              )}
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 dark:text-gray-400">Status</span>
            <div className="flex items-center gap-3">
              <StatusBadge status={member.status} />
              <button
                onClick={handleStatusToggle}
                disabled={togglingStatus}
                className="text-xs text-slate-500 dark:text-gray-400 underline hover:text-slate-700 dark:hover:text-gray-200 disabled:opacity-50"
              >
                {togglingStatus ? "Updating…" : member.status === "in" ? "Mark as Outside" : "Mark as In Campus"}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-600">
          <div>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">Delete</button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 dark:text-red-400">Are you sure?</span>
                <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150">Yes, Delete</button>
                <button onClick={() => setConfirmDelete(false)} className="bg-slate-200 dark:bg-gray-600 hover:bg-slate-300 dark:hover:bg-gray-500 text-slate-700 dark:text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg">Cancel</button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button onClick={() => { setEditMode(false); setForm({ name: member.name, age: member.age ?? "", email: member.email }); setError(""); }} className="bg-slate-200 dark:bg-gray-600 hover:bg-slate-300 dark:hover:bg-gray-500 text-slate-700 dark:text-gray-200 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150">Cancel</button>
                <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150">Save</button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150">Edit</button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const fetchStaff = async () => {
    const res = await api.get("/staff");
    setStaff(res.data);
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/staff", form);
      setForm(emptyForm);
      setShowForm(false);
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add staff member");
    }
  };

  const q = searchQuery.toLowerCase().trim();
  const filtered = q
    ? staff.filter((s) => s.name.toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q))
    : staff;

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {selected && (
        <StaffProfileModal
          member={selected}
          onClose={() => setSelected(null)}
          onRefresh={fetchStaff}
        />
      )}

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 shrink-0">Staff</h2>
        <input
          type="text"
          placeholder="Search name or email…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-xs bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={() => { setShowForm((v) => !v); setError(""); }}
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
        >
          {showForm ? "Cancel" : "+ Add Staff"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-6 animate-fade-slide-up animation-delay-100">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-gray-300 mb-4">New Staff Member</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 dark:text-gray-400">Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT_CLS} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 dark:text-gray-400">Age</label>
              <input type="number" min="1" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className={INPUT_CLS} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 dark:text-gray-400">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={INPUT_CLS} />
            </div>
            <div className="sm:col-span-3 flex flex-col gap-2">
              {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
              <button type="submit" className="w-fit bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
                Add Staff Member
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up animation-delay-200">
        {staff.length === 0 ? (
          <p className="text-slate-500 dark:text-gray-400 text-sm p-6">No staff records found.</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 dark:text-gray-400 text-sm p-6">No results match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Age</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100 cursor-pointer"
                  >
                    <td className="px-6 py-3 font-medium">{s.name}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{s.email}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{s.age || "—"}</td>
                    <td className="px-6 py-3"><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Staff;
