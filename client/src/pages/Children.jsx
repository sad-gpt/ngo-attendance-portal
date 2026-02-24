import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import api from "../services/api";

const INPUT_CLS = "bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

// ── Add/Edit Child Modal ────────────────────────────────────────────────────
const ChildModal = ({ mode, initial, onClose, onSaved }) => {
  const isEdit = mode === "edit";
  const [step, setStep] = useState(isEdit ? "manual" : "picker");
  const [form, setForm] = useState(initial || { name: "", age: "", gender: "" });
  const [xlsxRows, setXlsxRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef();

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      await api.put(`/children/${initial.id}`, form);
    } else {
      await api.post("/children", form);
    }
    onSaved();
    onClose();
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(new Uint8Array(evt.target.result), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const normalized = rows.map((r) => {
        const lower = {};
        Object.keys(r).forEach((k) => { lower[k.toLowerCase()] = r[k]; });
        return { name: lower.name || "", age: lower.age || "", gender: lower.gender || "" };
      });
      setXlsxRows(normalized);
      setImportResult(null);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    setImporting(true);
    let count = 0;
    for (const row of xlsxRows) {
      try { await api.post("/children", row); count++; } catch {}
    }
    setImportResult(count);
    setImporting(false);
    onSaved();
  };

  const headerTitle = isEdit ? "Edit Child" : step === "picker" ? "Add Child" : step === "manual" ? "Add Manually" : "Upload Excel";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            {!isEdit && step !== "picker" && (
              <button onClick={() => setStep("picker")} className="text-slate-400 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-1">← Back</button>
            )}
            <h3 className="text-slate-900 dark:text-gray-100 font-semibold">{headerTitle}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>
        <div className="p-6">
          {step === "picker" && (
            <div className="flex gap-4">
              <button onClick={() => setStep("manual")} className="flex-1 flex flex-col items-center gap-3 p-6 border-2 border-slate-200 dark:border-gray-600 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:scale-[1.02] transition-all duration-150 text-left group">
                <span className="text-3xl">👤</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-gray-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Add Manually</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Fill in details for one child</p>
                </div>
              </button>
              <button onClick={() => setStep("excel")} className="flex-1 flex flex-col items-center gap-3 p-6 border-2 border-slate-200 dark:border-gray-600 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:scale-[1.02] transition-all duration-150 text-left group">
                <span className="text-3xl">📄</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-gray-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Upload Excel</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Bulk import from .xlsx / .xls</p>
                </div>
              </button>
            </div>
          )}
          {step === "manual" && (
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500 dark:text-gray-400">Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={INPUT_CLS} />
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-slate-500 dark:text-gray-400">Age</label>
                  <input required type="number" min="1" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className={INPUT_CLS} />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-slate-500 dark:text-gray-400">Gender</label>
                  <select required value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={INPUT_CLS}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
                {isEdit ? "Update Child" : "Add Child"}
              </button>
            </form>
          )}
          {step === "excel" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Upload an <span className="text-slate-900 dark:text-gray-200">.xlsx</span> or <span className="text-slate-900 dark:text-gray-200">.xls</span> file. Required columns:{" "}
                <span className="text-slate-900 dark:text-gray-200">name, age, gender</span>
              </p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="text-sm text-slate-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer" />
              {xlsxRows.length > 0 && (
                <>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-gray-600 max-h-48 overflow-y-auto">
                    <table className="w-full text-xs text-slate-600 dark:text-gray-300">
                      <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase">
                        <tr>{["Name", "Age", "Gender"].map((h) => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {xlsxRows.map((r, i) => (
                          <tr key={i} className="border-t border-slate-200 dark:border-gray-600">
                            <td className="px-3 py-1.5">{r.name}</td>
                            <td className="px-3 py-1.5">{r.age}</td>
                            <td className="px-3 py-1.5">{r.gender}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importResult !== null ? (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Successfully imported {importResult} of {xlsxRows.length} records.</p>
                  ) : (
                    <button onClick={handleImport} disabled={importing} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
                      {importing ? "Importing…" : `Import ${xlsxRows.length} Records`}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Child Action Modal ──────────────────────────────────────────────────────
const ChildActionModal = ({ child, onClose, onEdit, onDeleted }) => {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await api.delete(`/children/${child.id}`);
    setDeleting(false);
    onDeleted();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-gray-600">
          <h3 className="text-slate-900 dark:text-gray-100 font-semibold">{child.name}</h3>
          <button onClick={onClose} className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4">
          <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-gray-300 mb-4">
            <span><span className="text-slate-400 dark:text-gray-500">Age: </span>{child.age}</span>
            <span><span className="text-slate-400 dark:text-gray-500">Gender: </span>{child.gender}</span>
          </div>
          {confirming ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Are you sure you want to delete {child.name}?</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirming(false)} className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-gray-500 text-slate-600 dark:text-gray-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={onEdit} className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">Edit</button>
              <button onClick={() => setConfirming(true)} className="flex-1 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Age Delete Dialog ───────────────────────────────────────────────────────
const AgeDeleteDialog = ({ age, count, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    await api.delete(`/children/by-age?age=${age}`);
    setDeleting(false);
    onConfirm();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-gray-600">
          <h3 className="text-slate-900 dark:text-gray-100 font-semibold">Delete Age Group</h3>
          <button onClick={onClose} className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4 flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-gray-300">
            Delete all children aged <span className="font-semibold text-slate-900 dark:text-gray-100">{age}</span>?{" "}
            This will remove all <span className="font-semibold text-red-500">{count}</span> students and their attendance records.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-gray-500 text-slate-600 dark:text-gray-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors">Cancel</button>
            <button onClick={handleConfirm} disabled={deleting} className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {deleting ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Main Children Component ─────────────────────────────────────────────────
const Children = () => {
  const [children, setChildren] = useState([]);
  const [selectedAge, setSelectedAge] = useState(null);
  const [modal, setModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchChildren = async () => {
    const res = await api.get("/children");
    setChildren(res.data);
  };

  useEffect(() => { fetchChildren(); }, []);

  const q = searchQuery.toLowerCase().trim();

  const searchResults = q
    ? children.filter((c) => c.name.toLowerCase().includes(q) || String(c.age).includes(q))
    : [];

  const grouped = children.reduce((acc, child) => {
    (acc[child.age] = acc[child.age] || []).push(child);
    return acc;
  }, {});
  const ages = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

  const ageChildren = selectedAge !== null ? (grouped[selectedAge] || []) : [];

  return (
    <div className="animate-page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          {selectedAge !== null && (
            <button
              onClick={() => setSelectedAge(null)}
              className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 text-sm flex items-center gap-1 transition-colors"
            >
              ← Back
            </button>
          )}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">
            {selectedAge !== null ? `Age ${selectedAge}` : "Children"}
          </h2>
          {selectedAge !== null && (
            <span className="text-xs bg-slate-100 dark:bg-gray-600 text-slate-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {ageChildren.length} {ageChildren.length === 1 ? "student" : "students"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selectedAge === null && (
            <input
              type="text"
              placeholder="Search students…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          )}
          <button
            onClick={() => setModal({ mode: "add" })}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            + Add Child
          </button>
        </div>
      </div>

      {/* Search results */}
      {q && (
        <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up hover:shadow-md transition-shadow">
          {searchResults.length === 0 ? (
            <p className="text-slate-500 dark:text-gray-400 text-sm p-6">No results match your search.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Age</th>
                  <th className="px-6 py-3 text-left">Gender</th>
                  <th className="px-6 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((child) => (
                  <tr key={child.id} onClick={() => setModal({ type: "action", child })} className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100 cursor-pointer">
                    <td className="px-6 py-3 font-medium">{child.name}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{child.age}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{child.gender}</td>
                    <td className="px-6 py-3 text-slate-400 dark:text-gray-500 text-right text-base">⋯</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Age cards grid */}
      {!q && selectedAge === null && (
        <>
          {children.length === 0 ? (
            <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-6 animate-fade-slide-up">
              <p className="text-slate-500 dark:text-gray-400 text-sm">No children records found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {ages.map((age, idx) => {
                const kids = grouped[age] || [];
                return (
                  <div
                    key={age}
                    className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden hover:shadow-md hover:border-emerald-400/50 dark:hover:border-emerald-500/50 transition-all duration-150 animate-fade-slide-up"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <button
                      className="w-full p-5 text-left flex flex-col gap-2"
                      onClick={() => setSelectedAge(age)}
                    >
                      <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{age}</span>
                      <span className="text-xs text-slate-500 dark:text-gray-400">years old</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-gray-100">{kids.length} students</span>
                    </button>
                    <div className="px-4 pb-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setModal({ type: "ageDelete", age, count: kids.length }); }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-100 dark:border-red-900/40 text-red-500 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                        Delete group
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Age group children list */}
      {!q && selectedAge !== null && (
        <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up hover:shadow-md transition-shadow">
          {ageChildren.length === 0 ? (
            <p className="text-slate-500 dark:text-gray-400 text-sm p-6">No children in this age group.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-gray-600/30 text-slate-500 dark:text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Gender</th>
                  <th className="px-6 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {ageChildren.map((child) => (
                  <tr
                    key={child.id}
                    onClick={() => setModal({ type: "action", child })}
                    className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100 cursor-pointer"
                  >
                    <td className="px-6 py-3 font-medium">{child.name}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{child.gender}</td>
                    <td className="px-6 py-3 text-slate-400 dark:text-gray-500 text-right text-base">⋯</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modals */}
      {modal?.mode && (
        <ChildModal
          mode={modal.mode}
          initial={modal.initial}
          onClose={() => setModal(null)}
          onSaved={fetchChildren}
        />
      )}
      {modal?.type === "action" && (
        <ChildActionModal
          child={modal.child}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ mode: "edit", initial: { ...modal.child } })}
          onDeleted={() => { setModal(null); fetchChildren(); if (selectedAge !== null && grouped[selectedAge]?.length <= 1) setSelectedAge(null); }}
        />
      )}
      {modal?.type === "ageDelete" && (
        <AgeDeleteDialog
          age={modal.age}
          count={modal.count}
          onClose={() => setModal(null)}
          onConfirm={() => { setModal(null); fetchChildren(); }}
        />
      )}
    </div>
  );
};

export default Children;
