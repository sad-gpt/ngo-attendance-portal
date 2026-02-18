import { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import api from "../services/api";

const emptyForm = { name: "", className: "", age: "", gender: "" };

const ChildModal = ({ mode, initial, onClose, onSaved }) => {
  const [tab, setTab] = useState("manual");
  const [form, setForm] = useState(initial || emptyForm);
  const [xlsxRows, setXlsxRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef();

  const isEdit = mode === "edit";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h3 className="text-gray-100 font-semibold">{isEdit ? "Edit Child" : "Add Child"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-100 text-xl leading-none">&times;</button>
        </div>

        {!isEdit && (
          <div className="flex border-b border-gray-700">
            {["manual", "excel"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? "text-emerald-400 border-b-2 border-emerald-500"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {t === "manual" ? "Manual Entry" : "Upload Excel"}
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          {(isEdit || tab === "manual") && (
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
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
                <label className="text-xs text-gray-400">Class</label>
                <input
                  required
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value })}
                  className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-gray-400">Age</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs text-gray-400">Gender</label>
                  <select
                    required
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="bg-gray-700 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                {isEdit ? "Update Child" : "Add Child"}
              </button>
            </form>
          )}

          {!isEdit && tab === "excel" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-gray-400">
                Upload an <span className="text-gray-200">.xlsx</span> or{" "}
                <span className="text-gray-200">.xls</span> file. Required columns:{" "}
                <span className="text-gray-200">name, class, age, gender</span>
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                className="text-sm text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />

              {xlsxRows.length > 0 && (
                <>
                  <div className="overflow-x-auto rounded-lg border border-gray-700 max-h-48 overflow-y-auto">
                    <table className="w-full text-xs text-gray-300">
                      <thead className="bg-gray-900 text-gray-400 uppercase">
                        <tr>
                          {["Name", "Class", "Age", "Gender"].map((h) => (
                            <th key={h} className="px-3 py-2 text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {xlsxRows.map((r, i) => (
                          <tr key={i} className="border-t border-gray-700">
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
                    <p className="text-sm text-emerald-400 font-medium">
                      Successfully imported {importResult} of {xlsxRows.length} records.
                    </p>
                  ) : (
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
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
    </div>
  );
};

const Children = () => {
  const [children, setChildren] = useState([]);
  const [modal, setModal] = useState(null);

  const fetchChildren = async () => {
    const res = await api.get("/children");
    setChildren(res.data);
  };

  useEffect(() => { fetchChildren(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-100">Children</h2>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add Child
        </button>
      </div>

      <div className="bg-gray-800 border border-gray-700/50 rounded-2xl overflow-hidden">
        {children.length === 0 ? (
          <p className="text-gray-400 text-sm p-6">No children records found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Class</th>
                <th className="px-6 py-3 text-left">Age</th>
                <th className="px-6 py-3 text-left">Gender</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {children.map((child) => (
                <tr key={child.id} className="border-t border-gray-700/50 hover:bg-gray-700/50 text-gray-100">
                  <td className="px-6 py-3">{child.name}</td>
                  <td className="px-6 py-3 text-gray-400">{child.class}</td>
                  <td className="px-6 py-3 text-gray-400">{child.age}</td>
                  <td className="px-6 py-3 text-gray-400">{child.gender}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() =>
                        setModal({
                          mode: "edit",
                          initial: { ...child, className: child.class },
                        })
                      }
                      className="text-emerald-400 hover:text-emerald-300 text-xs font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
