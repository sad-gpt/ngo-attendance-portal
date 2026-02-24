import { useEffect, useState, useCallback } from "react";
import api from "../services/api";

const INPUT_CLS = "bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

const fmtTime = (ts) =>
  ts ? new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

const toLocalDT = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const nowLocalDT = () => toLocalDT(new Date());

// ── Person Log Tab (Students / Staff) ─────────────────────────────────────────
const PersonLogTab = ({ type }) => {
  const [people, setPeople] = useState([]);
  const [todayEntries, setTodayEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [exitForm, setExitForm] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const fetchAll = useCallback(async () => {
    const endpoint = type === "child" ? "/children" : "/staff";
    const [peopleRes, logRes] = await Promise.all([
      api.get(endpoint),
      api.get(`/logbook?date=${today}`),
    ]);
    setPeople(peopleRes.data);
    setTodayEntries(logRes.data.filter((e) => e.type === type));
  }, [type, today]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const entryMap = todayEntries.reduce((acc, e) => {
    if (!acc[e.personId]) acc[e.personId] = e;
    return acc;
  }, {});

  const filtered = people.filter((p) =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleMarkOut = async () => {
    if (!exitForm) return;
    setLoading(true);
    try {
      await api.post("/logbook", {
        personId: exitForm.personId,
        type,
        reason: exitForm.reason || null,
        exitTime: exitForm.exitTime ? new Date(exitForm.exitTime).toISOString() : new Date().toISOString(),
      });
      setExitForm(null);
      await fetchAll();
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editEntry) return;
    setLoading(true);
    try {
      await api.put(`/logbook/${editEntry.id}`, {
        exitTime: editEntry.exitTime ? new Date(editEntry.exitTime).toISOString() : null,
        returnTime: editEntry.returnTime ? new Date(editEntry.returnTime).toISOString() : null,
        reason: editEntry.reason || null,
      });
      setEditEntry(null);
      await fetchAll();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReturned = async (entry) => {
    setLoading(true);
    try {
      await api.put(`/logbook/${entry.id}`, {
        exitTime: entry.exitTime,
        returnTime: new Date().toISOString(),
        reason: entry.reason,
      });
      await fetchAll();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entry) => {
    setLoading(true);
    try {
      await api.delete(`/logbook/${entry.id}`);
      await fetchAll();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-gray-600/50">
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full sm:max-w-sm ${INPUT_CLS}`}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">No records found.</p>
      ) : (
        <>
          {/* ── Mobile card view ── */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-gray-600/50">
            {filtered.map((person) => {
              const entry = entryMap[person.id];
              const isExitOpen = exitForm?.personId === person.id;
              const isEditOpen = editEntry && entry && editEntry.id === entry.id;

              return (
                <div key={person.id} className="p-4 space-y-3">
                  {/* Name + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-gray-100 text-sm">{person.name}</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                      person.status === "in"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    }`}>
                      {person.status === "in" ? "In Campus" : "Outside"}
                    </span>
                  </div>

                  {/* Times + Reason */}
                  {entry && (
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500 dark:text-gray-400">
                      <span>Exit: {fmtTime(entry.exitTime)}</span>
                      <span>
                        Return:{" "}
                        {entry.returnTime
                          ? fmtTime(entry.returnTime)
                          : <span className="text-amber-600 dark:text-amber-400 font-medium">Still out</span>}
                      </span>
                      {entry.reason && <span>Reason: {entry.reason}</span>}
                    </div>
                  )}

                  {/* Exit form */}
                  {isExitOpen ? (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-500 dark:text-gray-400">Exit Time</label>
                          <input
                            type="datetime-local"
                            value={exitForm.exitTime}
                            onChange={(e) => setExitForm({ ...exitForm, exitTime: e.target.value })}
                            className={INPUT_CLS}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-500 dark:text-gray-400">Reason</label>
                          <input
                            type="text"
                            placeholder="Optional"
                            value={exitForm.reason}
                            onChange={(e) => setExitForm({ ...exitForm, reason: e.target.value })}
                            className={INPUT_CLS}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleMarkOut} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                          Confirm Exit
                        </button>
                        <button onClick={() => setExitForm(null)} className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 text-xs px-2">
                          Cancel
                        </button>
                      </div>
                    </div>

                  /* Edit form */
                  ) : isEditOpen ? (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-500 dark:text-gray-400">Exit Time</label>
                          <input type="datetime-local" value={editEntry.exitTime} onChange={(e) => setEditEntry({ ...editEntry, exitTime: e.target.value })} className={INPUT_CLS} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-500 dark:text-gray-400">Return Time</label>
                          <input type="datetime-local" value={editEntry.returnTime} onChange={(e) => setEditEntry({ ...editEntry, returnTime: e.target.value })} className={INPUT_CLS} />
                        </div>
                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label className="text-xs text-slate-500 dark:text-gray-400">Reason</label>
                          <input type="text" value={editEntry.reason} onChange={(e) => setEditEntry({ ...editEntry, reason: e.target.value })} className={INPUT_CLS} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleEditSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Save</button>
                        <button onClick={() => setEditEntry(null)} className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 text-xs px-2">Cancel</button>
                      </div>
                    </div>

                  /* Actions */
                  ) : person.status === "in" ? (
                    <button
                      onClick={() => { setEditEntry(null); setExitForm({ personId: person.id, name: person.name, exitTime: nowLocalDT(), reason: "" }); }}
                      className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/40 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      Mark Going Out
                    </button>
                  ) : entry ? (
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => { setExitForm(null); setEditEntry({ id: entry.id, exitTime: toLocalDT(entry.exitTime), returnTime: toLocalDT(entry.returnTime), reason: entry.reason || "" }); }}
                        className="text-xs bg-slate-100 dark:bg-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-500 px-2.5 py-1 rounded-lg font-medium transition-colors"
                      >
                        Edit
                      </button>
                      {!entry.returnTime && (
                        <button onClick={() => handleMarkReturned(entry)} disabled={loading} className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap">
                          Mark Returned
                        </button>
                      )}
                      <button onClick={() => handleDelete(entry)} disabled={loading} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50">
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* ── Desktop table view ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-gray-600/30 text-slate-500 dark:text-gray-400 uppercase text-xs sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Exit Time</th>
                  <th className="px-6 py-3 text-left">Return Time</th>
                  <th className="px-6 py-3 text-left">Reason</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((person) => {
                  const entry = entryMap[person.id];
                  const isExitOpen = exitForm?.personId === person.id;
                  const isEditOpen = editEntry && entry && editEntry.id === entry.id;

                  return (
                    <tr
                      key={person.id}
                      className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100"
                    >
                      <td className="px-6 py-3 font-medium align-top">{person.name}</td>
                      <td className="px-6 py-3 align-top">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          person.status === "in"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        }`}>
                          {person.status === "in" ? "In Campus" : "Outside"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-500 dark:text-gray-400 align-top">
                        {entry ? fmtTime(entry.exitTime) : "—"}
                      </td>
                      <td className="px-6 py-3 align-top">
                        {entry
                          ? entry.returnTime
                            ? <span className="text-slate-500 dark:text-gray-400">{fmtTime(entry.returnTime)}</span>
                            : <span className="text-amber-600 dark:text-amber-400 font-medium">Still out</span>
                          : <span className="text-slate-400 dark:text-gray-500">—</span>}
                      </td>
                      <td className="px-6 py-3 text-slate-500 dark:text-gray-400 text-xs align-top">
                        {entry?.reason || "—"}
                      </td>
                      <td className="px-6 py-3 align-top">
                        {isExitOpen ? (
                          <div className="flex flex-col gap-2 min-w-[320px]">
                            <div className="flex gap-2 flex-wrap">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-slate-500 dark:text-gray-400">Exit Time</label>
                                <input type="datetime-local" value={exitForm.exitTime} onChange={(e) => setExitForm({ ...exitForm, exitTime: e.target.value })} className={INPUT_CLS} />
                              </div>
                              <div className="flex flex-col gap-1 flex-1">
                                <label className="text-xs text-slate-500 dark:text-gray-400">Reason</label>
                                <input type="text" placeholder="Optional" value={exitForm.reason} onChange={(e) => setExitForm({ ...exitForm, reason: e.target.value })} className={INPUT_CLS} />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={handleMarkOut} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Confirm Exit</button>
                              <button onClick={() => setExitForm(null)} className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 text-xs px-2">Cancel</button>
                            </div>
                          </div>
                        ) : isEditOpen ? (
                          <div className="flex flex-col gap-2 min-w-[360px]">
                            <div className="flex gap-2 flex-wrap">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-slate-500 dark:text-gray-400">Exit Time</label>
                                <input type="datetime-local" value={editEntry.exitTime} onChange={(e) => setEditEntry({ ...editEntry, exitTime: e.target.value })} className={INPUT_CLS} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-slate-500 dark:text-gray-400">Return Time</label>
                                <input type="datetime-local" value={editEntry.returnTime} onChange={(e) => setEditEntry({ ...editEntry, returnTime: e.target.value })} className={INPUT_CLS} />
                              </div>
                              <div className="flex flex-col gap-1 flex-1">
                                <label className="text-xs text-slate-500 dark:text-gray-400">Reason</label>
                                <input type="text" value={editEntry.reason} onChange={(e) => setEditEntry({ ...editEntry, reason: e.target.value })} className={INPUT_CLS} />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={handleEditSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Save</button>
                              <button onClick={() => setEditEntry(null)} className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 text-xs px-2">Cancel</button>
                            </div>
                          </div>
                        ) : person.status === "in" ? (
                          <button
                            onClick={() => { setEditEntry(null); setExitForm({ personId: person.id, name: person.name, exitTime: nowLocalDT(), reason: "" }); }}
                            className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/40 px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap"
                          >
                            Mark Going Out
                          </button>
                        ) : entry ? (
                          <div className="flex gap-1.5 flex-wrap">
                            <button
                              onClick={() => { setExitForm(null); setEditEntry({ id: entry.id, exitTime: toLocalDT(entry.exitTime), returnTime: toLocalDT(entry.returnTime), reason: entry.reason || "" }); }}
                              className="text-xs bg-slate-100 dark:bg-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-500 px-2.5 py-1 rounded-lg font-medium transition-colors"
                            >
                              Edit
                            </button>
                            {!entry.returnTime && (
                              <button onClick={() => handleMarkReturned(entry)} disabled={loading} className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap">
                                Mark Returned
                              </button>
                            )}
                            <button onClick={() => handleDelete(entry)} disabled={loading} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50">
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// ── Volunteers Tab ─────────────────────────────────────────────────────────────
const VolunteersTab = () => {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [addForm, setAddForm] = useState({ name: "", reason: "", arrivalTime: nowLocalDT() });
  const [editRow, setEditRow] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    const res = await api.get("/volunteers-log/today");
    setEntries(res.data);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = entries.filter((e) =>
    !search.trim() || e.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleAdd = async (ev) => {
    ev.preventDefault();
    if (!addForm.name.trim()) return;
    setLoading(true);
    try {
      await api.post("/volunteers-log", {
        name: addForm.name,
        reason: addForm.reason || null,
        arrivalTime: addForm.arrivalTime ? new Date(addForm.arrivalTime).toISOString() : new Date().toISOString(),
      });
      setAddForm({ name: "", reason: "", arrivalTime: nowLocalDT() });
      await fetchAll();
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editRow) return;
    setLoading(true);
    try {
      await api.put(`/volunteers-log/${editRow.id}`, {
        name: editRow.name,
        reason: editRow.reason || null,
        arrivalTime: editRow.arrivalTime ? new Date(editRow.arrivalTime).toISOString() : new Date().toISOString(),
        departureTime: editRow.departureTime ? new Date(editRow.departureTime).toISOString() : null,
      });
      setEditRow(null);
      await fetchAll();
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDeparted = async (entry) => {
    setLoading(true);
    try {
      await api.put(`/volunteers-log/${entry.id}/departure`, { departureTime: new Date().toISOString() });
      await fetchAll();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/volunteers-log/${id}`);
      await fetchAll();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-slide-up">
      {/* Add form */}
      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-gray-300 mb-4">Log Volunteer Arrival</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 dark:text-gray-400">Name</label>
            <input
              required
              placeholder="Volunteer name"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className={INPUT_CLS}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 dark:text-gray-400">Reason / Purpose</label>
            <input
              placeholder="Optional"
              value={addForm.reason}
              onChange={(e) => setAddForm({ ...addForm, reason: e.target.value })}
              className={INPUT_CLS}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 dark:text-gray-400">Arrival Time</label>
            <input
              type="datetime-local"
              value={addForm.arrivalTime}
              onChange={(e) => setAddForm({ ...addForm, arrivalTime: e.target.value })}
              className={INPUT_CLS}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              Log Arrival
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-gray-600/50">
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full sm:max-w-sm ${INPUT_CLS}`}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-gray-500 py-8 text-sm">No volunteers logged today.</p>
        ) : (
          <>
            {/* ── Mobile card view ── */}
            <div className="md:hidden divide-y divide-slate-200 dark:divide-gray-600/50">
              {filtered.map((entry) => {
                const isEditOpen = editRow?.id === entry.id;
                return (
                  <div key={entry.id} className="p-4 space-y-3">
                    {/* Name + departure status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-gray-100 text-sm block">{entry.name}</span>
                        {entry.reason && <span className="text-xs text-slate-500 dark:text-gray-400">{entry.reason}</span>}
                      </div>
                      <div className="text-xs text-right shrink-0">
                        {entry.departureTime
                          ? <span className="text-slate-500 dark:text-gray-400">{fmtTime(entry.departureTime)}</span>
                          : <span className="text-amber-600 dark:text-amber-400 font-medium">Still here</span>}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-gray-500">Arrived: {fmtTime(entry.arrivalTime)}</div>

                    {isEditOpen ? (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 dark:text-gray-400">Name</label>
                            <input type="text" value={editRow.name} onChange={(e) => setEditRow({ ...editRow, name: e.target.value })} className={INPUT_CLS} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 dark:text-gray-400">Reason</label>
                            <input type="text" value={editRow.reason} onChange={(e) => setEditRow({ ...editRow, reason: e.target.value })} className={INPUT_CLS} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 dark:text-gray-400">Arrival Time</label>
                            <input type="datetime-local" value={editRow.arrivalTime} onChange={(e) => setEditRow({ ...editRow, arrivalTime: e.target.value })} className={INPUT_CLS} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-500 dark:text-gray-400">Departure Time</label>
                            <input type="datetime-local" value={editRow.departureTime} onChange={(e) => setEditRow({ ...editRow, departureTime: e.target.value })} className={INPUT_CLS} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleEditSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Save</button>
                          <button onClick={() => setEditRow(null)} className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 text-xs px-2">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => setEditRow({ id: entry.id, name: entry.name, reason: entry.reason || "", arrivalTime: toLocalDT(entry.arrivalTime), departureTime: toLocalDT(entry.departureTime) })}
                          className="text-xs bg-slate-100 dark:bg-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-500 px-2.5 py-1 rounded-lg font-medium transition-colors"
                        >
                          Edit
                        </button>
                        {!entry.departureTime && (
                          <button onClick={() => handleMarkDeparted(entry)} disabled={loading} className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap">
                            Mark Departed
                          </button>
                        )}
                        <button onClick={() => handleDelete(entry.id)} disabled={loading} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table view ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-gray-600/30 text-slate-500 dark:text-gray-400 uppercase text-xs sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Reason</th>
                    <th className="px-6 py-3 text-left">Arrived</th>
                    <th className="px-6 py-3 text-left">Departed</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry) => {
                    const isEditOpen = editRow?.id === entry.id;
                    return (
                      <tr key={entry.id} className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100">
                        <td className="px-6 py-3 font-medium align-top">{entry.name}</td>
                        <td className="px-6 py-3 text-slate-500 dark:text-gray-400 text-xs align-top">{entry.reason || "—"}</td>
                        <td className="px-6 py-3 text-slate-500 dark:text-gray-400 align-top">{fmtTime(entry.arrivalTime)}</td>
                        <td className="px-6 py-3 align-top">
                          {entry.departureTime
                            ? <span className="text-slate-500 dark:text-gray-400">{fmtTime(entry.departureTime)}</span>
                            : <span className="text-amber-600 dark:text-amber-400 font-medium">Still here</span>}
                        </td>
                        <td className="px-6 py-3 align-top">
                          {isEditOpen ? (
                            <div className="flex flex-col gap-2 min-w-[400px]">
                              <div className="flex gap-2 flex-wrap">
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs text-slate-500 dark:text-gray-400">Name</label>
                                  <input type="text" value={editRow.name} onChange={(e) => setEditRow({ ...editRow, name: e.target.value })} className={INPUT_CLS} />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                  <label className="text-xs text-slate-500 dark:text-gray-400">Reason</label>
                                  <input type="text" value={editRow.reason} onChange={(e) => setEditRow({ ...editRow, reason: e.target.value })} className={INPUT_CLS} />
                                </div>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs text-slate-500 dark:text-gray-400">Arrival Time</label>
                                  <input type="datetime-local" value={editRow.arrivalTime} onChange={(e) => setEditRow({ ...editRow, arrivalTime: e.target.value })} className={INPUT_CLS} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-xs text-slate-500 dark:text-gray-400">Departure Time</label>
                                  <input type="datetime-local" value={editRow.departureTime} onChange={(e) => setEditRow({ ...editRow, departureTime: e.target.value })} className={INPUT_CLS} />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={handleEditSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">Save</button>
                                <button onClick={() => setEditRow(null)} className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 text-xs px-2">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-1.5 flex-wrap">
                              <button
                                onClick={() => setEditRow({ id: entry.id, name: entry.name, reason: entry.reason || "", arrivalTime: toLocalDT(entry.arrivalTime), departureTime: toLocalDT(entry.departureTime) })}
                                className="text-xs bg-slate-100 dark:bg-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-500 px-2.5 py-1 rounded-lg font-medium transition-colors"
                              >
                                Edit
                              </button>
                              {!entry.departureTime && (
                                <button onClick={() => handleMarkDeparted(entry)} disabled={loading} className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40 px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap">
                                  Mark Departed
                                </button>
                              )}
                              <button onClick={() => handleDelete(entry.id)} disabled={loading} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40 px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50">
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main Log Page ─────────────────────────────────────────────────────────────
const Log = () => {
  const [tab, setTab] = useState("students");

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Log</h2>

      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 bg-slate-100 dark:bg-gray-700 rounded-xl p-1 w-fit">
          {["students", "staff", "volunteers"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
                tab === t
                  ? "bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {tab === "students" && <PersonLogTab type="child" />}
      {tab === "staff" && <PersonLogTab type="staff" />}
      {tab === "volunteers" && <VolunteersTab />}
    </div>
  );
};

export default Log;
