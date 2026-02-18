import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import api from "../services/api";

const emptyForm = { name: "", className: "", age: "", gender: "" };

const ChildModal = ({ mode, initial, onClose, onSaved }) => {
  const isEdit = mode === "edit";
  const [step, setStep] = useState(isEdit ? "manual" : "picker");
  const [form, setForm] = useState(initial || emptyForm);
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
        return {
          name: lower.name || "",
          className: lower.class || "",
          age: lower.age || "",
          gender: lower.gender || "",
        };
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
      try {
        await api.post("/children", row);
        count++;
      } catch {}
    }
    setImportResult(count);
    setImporting(false);
    onSaved();
  };

  const headerTitle = isEdit
    ? "Edit Child"
    : step === "picker"
    ? "Add Child"
    : step === "manual"
    ? "Add Manually"
    : "Upload Excel";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            {!isEdit && step !== "picker" && (
              <button
                onClick={() => setStep("picker")}
                className="text-slate-400 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>
            )}
            <h3 className="text-slate-900 dark:text-gray-100 font-semibold">{headerTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-100 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {/* Step: Picker */}
          {step === "picker" && (
            <div className="flex gap-4">
              <button
                onClick={() => setStep("manual")}
                className="flex-1 flex flex-col items-center gap-3 p-6 border-2 border-slate-200 dark:border-gray-600 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:scale-[1.02] transition-all duration-150 text-left group"
              >
                <span className="text-3xl">👤</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-gray-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Add Manually</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Fill in details for one child</p>
                </div>
              </button>
              <button
                onClick={() => setStep("excel")}
                className="flex-1 flex flex-col items-center gap-3 p-6 border-2 border-slate-200 dark:border-gray-600 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:scale-[1.02] transition-all duration-150 text-left group"
              >
                <span className="text-3xl">📄</span>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-gray-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Upload Excel</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Bulk import from .xlsx / .xls</p>
                </div>
              </button>
            </div>
          )}

          {/* Step: Manual Form */}
          {step === "manual" && (
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
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
                <label className="text-xs text-slate-500 dark:text-gray-400">Class</label>
                <input
                  required
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value })}
                  className="bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-slate-500 dark:text-gray-400">Age</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-slate-500 dark:text-gray-400">Gender</label>
                  <select
                    required
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isEdit ? "Update Child" : "Add Child"}
              </button>
            </form>
          )}

          {/* Step: Excel Upload */}
          {step === "excel" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Upload an <span className="text-slate-900 dark:text-gray-200">.xlsx</span> or{" "}
                <span className="text-slate-900 dark:text-gray-200">.xls</span> file. Required columns:{" "}
                <span className="text-slate-900 dark:text-gray-200">name, class, age, gender</span>
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                className="text-sm text-slate-600 dark:text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
              />
              {xlsxRows.length > 0 && (
                <>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-gray-600 max-h-48 overflow-y-auto">
                    <table className="w-full text-xs text-slate-600 dark:text-gray-300">
                      <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase">
                        <tr>
                          {["Name", "Class", "Age", "Gender"].map((h) => (
                            <th key={h} className="px-3 py-2 text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {xlsxRows.map((r, i) => (
                          <tr key={i} className="border-t border-slate-200 dark:border-gray-600">
                            <td className="px-3 py-1.5">{r.name}</td>
                            <td className="px-3 py-1.5">{r.className}</td>
                            <td className="px-3 py-1.5">{r.age}</td>
                            <td className="px-3 py-1.5">{r.gender}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importResult !== null ? (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      Successfully imported {importResult} of {xlsxRows.length} records.
                    </p>
                  ) : (
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                    >
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

const Children = () => {
  const [children, setChildren] = useState([]);
  const [modal, setModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClass, setExpandedClass] = useState(null);

  const fetchChildren = async () => {
    const res = await api.get("/children");
    setChildren(res.data);
  };

  useEffect(() => { fetchChildren(); }, []);

  const q = searchQuery.toLowerCase().trim();

  // Flat search results (when query exists)
  const searchResults = q
    ? children.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.class || "").toLowerCase().includes(q)
      )
    : [];

  // Group children by class (for accordion view)
  const grouped = children.reduce((acc, child) => {
    const key = child.class || "Unclassified";
    (acc[key] = acc[key] || []).push(child);
    return acc;
  }, {});

  const classNames = Object.keys(grouped).sort();

  const toggleClass = (cls) =>
    setExpandedClass((prev) => (prev === cls ? null : cls));

  const openEdit = (child) =>
    setModal({ mode: "edit", initial: { ...child, className: child.class } });

  return (
    <div className="animate-page-enter">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 shrink-0">Children</h2>
        <input
          type="text"
          placeholder="Search class or student…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 max-w-xs bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={() => setModal({ mode: "add" })}
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
        >
          + Add Child
        </button>
      </div>

      {children.length === 0 ? (
        <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-6 animate-fade-slide-up">
          <p className="text-slate-500 dark:text-gray-400 text-sm">No children records found.</p>
        </div>
      ) : q ? (
        /* ── Search results view ── */
        <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up hover:shadow-md transition-shadow">
          {searchResults.length === 0 ? (
            <p className="text-slate-500 dark:text-gray-400 text-sm p-6">No results match your search.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-gray-600/50 text-slate-500 dark:text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Class</th>
                  <th className="px-6 py-3 text-left">Age</th>
                  <th className="px-6 py-3 text-left">Gender</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((child) => (
                  <tr
                    key={child.id}
                    onClick={() => openEdit(child)}
                    className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100 cursor-pointer"
                  >
                    <td className="px-6 py-3 font-medium">{child.name}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{child.class}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{child.age}</td>
                    <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{child.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* ── Class accordion view ── */
        <div className="flex flex-col gap-3">
          {classNames.map((cls, idx) => {
            const isOpen = expandedClass === cls;
            const students = grouped[cls] || [];

            return (
              <div
                key={cls}
                className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl overflow-hidden animate-fade-slide-up hover:shadow-md transition-shadow"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <button
                  onClick={() => toggleClass(cls)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-gray-600/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900 dark:text-gray-100">{cls}</span>
                    <span className="text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                      {students.length} {students.length === 1 ? "student" : "students"}
                    </span>
                  </div>
                  <span
                    className="text-slate-400 dark:text-gray-400 text-sm"
                    style={{ display: "inline-block", transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    ▶
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200 dark:border-gray-600/50">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-gray-600/30 text-slate-500 dark:text-gray-400 uppercase text-xs">
                        <tr>
                          <th className="px-6 py-3 text-left">Name</th>
                          <th className="px-6 py-3 text-left">Age</th>
                          <th className="px-6 py-3 text-left">Gender</th>
                          <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((child) => (
                          <tr
                            key={child.id}
                            className="border-t border-slate-200 dark:border-gray-600/50 hover:bg-slate-50 dark:hover:bg-gray-600/20 text-slate-900 dark:text-gray-100"
                          >
                            <td className="px-6 py-3">{child.name}</td>
                            <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{child.age}</td>
                            <td className="px-6 py-3 text-slate-500 dark:text-gray-400">{child.gender}</td>
                            <td className="px-6 py-3">
                              <button
                                onClick={() => openEdit(child)}
                                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-medium"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ChildModal
          mode={modal.mode}
          initial={modal.initial}
          onClose={() => setModal(null)}
          onSaved={fetchChildren}
        />
      )}
    </div>
  );
};

export default Children;
