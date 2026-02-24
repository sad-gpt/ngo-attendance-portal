import { useState } from "react";
import api from "../services/api";

const INPUT_CLS = "bg-white dark:bg-gray-600 border border-slate-300 dark:border-gray-500 text-slate-900 dark:text-gray-100 placeholder-slate-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full";

const Settings = () => {
  // Change Password
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwMsg, setPwMsg] = useState(null); // { type: "success"|"error", text }
  const [pwLoading, setPwLoading] = useState(false);

  // Create Admin
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "" });
  const [adminMsg, setAdminMsg] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState(null);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      await api.post("/auth/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ type: "success", text: "Password updated successfully." });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwMsg({ type: "error", text: err.response?.data?.message || "Failed to update password." });
    } finally {
      setPwLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminMsg(null);
    setCreatedAdmin(null);
    try {
      const res = await api.post("/auth/create-admin", adminForm);
      setAdminMsg({ type: "success", text: "Admin account created successfully." });
      setCreatedAdmin({ ...res.data.user, password: adminForm.password });
      setAdminForm({ name: "", email: "", password: "" });
    } catch (err) {
      setAdminMsg({ type: "error", text: err.response?.data?.message || "Failed to create admin." });
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100">Settings</h2>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
        <h3 className="text-base font-semibold text-slate-800 dark:text-gray-100 mb-1">Change Password</h3>
        <p className="text-xs text-slate-500 dark:text-gray-400 mb-5">Update your admin account password.</p>

        {pwMsg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
            pwMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50 text-red-600 dark:text-red-400"
          }`}>
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className={INPUT_CLS}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              required
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              className={INPUT_CLS}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              className={INPUT_CLS}
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Add Admin */}
      <div className="bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600/50 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
        <h3 className="text-base font-semibold text-slate-800 dark:text-gray-100 mb-1">Add Admin</h3>
        <p className="text-xs text-slate-500 dark:text-gray-400 mb-5">Create a new admin account with full access.</p>

        {adminMsg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
            adminMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50 text-red-600 dark:text-red-400"
          }`}>
            {adminMsg.text}
          </div>
        )}

        {createdAdmin && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm border bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700/50">
            <p className="font-semibold text-teal-700 dark:text-teal-400 mb-1">New admin credentials:</p>
            <p className="text-teal-700 dark:text-teal-300">Email: <span className="font-mono font-medium">{createdAdmin.email}</span></p>
            <p className="text-teal-700 dark:text-teal-300">Password: <span className="font-mono font-medium">{createdAdmin.password}</span></p>
            <p className="text-xs text-teal-600 dark:text-teal-500 mt-1">Save these credentials — the password will not be shown again.</p>
          </div>
        )}

        <form onSubmit={handleCreateAdmin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              required
              value={adminForm.name}
              onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
              className={INPUT_CLS}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={adminForm.email}
              onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              className={INPUT_CLS}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={adminForm.password}
              onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
              className={INPUT_CLS}
              placeholder="Set a password"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={adminLoading}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {adminLoading ? "Creating…" : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
