import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = { name: "", email: "", phone: "", role: "" };

const VolunteerProfileModal = ({ volunteer, onClose, onRefresh }) => {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...volunteer });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    await api.put(`/volunteers/${volunteer.id}`, form);
    onRefresh();
    onClose();
  };

  const handleDelete = async () => {
    await api.delete(`/volunteers/${volunteer.id}`);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5 animate-scale-in">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100">Volunteer Profile</h3>
          <button onClick={onClose} className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>

        <div className="flex flex-col gap-4">
          {[
            { label: "Name", key: "name" },
            { label: "Email", key: "email" },
            { label: "Phone", key: "phone" },
            { label: "Role", key: "role" },
          ].map(({ label, key }) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 dark:text-gray-400">{label}</span>
              {editMode ? (
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <span className="text-slate-900 dark:text-gray-100 text-sm">{volunteer[key]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-gray-600">
          <div>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 dark:text-red-400">Are you sure?</span>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="bg-slate-200 dark:bg-gray-600 hover:bg-slate-300 dark:hover:bg-gray-500 text-slate-700 dark:text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={() => { setEditMode(false); setForm({ ...volunteer }); }}
                  className="bg-slate-200 dark:bg-gray-600 hover:bg-slate-300 dark:hover:bg-gray-500 text-slate-700 dark:text-gray-200 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);

  const fetchVolunteers = async () => {
    const res = await api.get("/volunteers");
    setVolunteers(res.data);
  };

  useEffect(() => { fetchVolunteers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/volunteers", form);
    setForm(emptyForm);
    setShowForm(false);
    fetchVolunteers();
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {selected && (
        <VolunteerProfileModal
          volunteer={selected}
          onClose={() => setSelected(null)}
          onRefresh={fetchVolunteers}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Volunteers</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
        >
          {showForm ? "Cancel" : "+ Add Volunteer"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-6 animate-fade-slide-up animation-delay-100">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-gray-300 mb-4">New Volunteer</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 dark:text-gray-400">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 dark:text-gray-400">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 dark:text-gray-400">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 dark:text-gray-400">Role</label>
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                Add Volunteer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up animation-delay-200">
        {volunteers.length === 0 ? (
          <p className="text-slate-500 dark:text-gray-400 text-sm p-6">No volunteer records found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100 cursor-pointer"
                >
                  <td className="px-6 py-3">{v.name}</td>
                  <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{v.email}</td>
                  <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{v.phone}</td>
                  <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{v.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Volunteers;
