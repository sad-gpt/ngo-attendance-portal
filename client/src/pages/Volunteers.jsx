import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = { name: "", email: "", phone: "", role: "" };

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">Volunteers</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Volunteer"}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">New Volunteer</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Role</label>
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Add Volunteer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700/50 rounded-2xl overflow-hidden">
        {volunteers.length === 0 ? (
          <p className="text-gray-400 text-sm p-6">No volunteer records found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.id} className="border-t border-gray-700/50 hover:bg-gray-700/50 text-gray-100">
                  <td className="px-6 py-3">{v.name}</td>
                  <td className="px-6 py-3 text-gray-400">{v.email}</td>
                  <td className="px-6 py-3 text-gray-400">{v.phone}</td>
                  <td className="px-6 py-3 text-gray-400">{v.role}</td>
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
