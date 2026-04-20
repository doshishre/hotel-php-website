import { useState, useEffect, useCallback } from "react";

// ─── Config ───────────────────────────────────────────────────
//const API = "http://localhost/hotel-checkin/api/staff-api.php";

const API = "http://hotel-checkin-api-g8gwbqcnhsazd9b8.centralindia-01.azurewebsites.net/api/staff-api.php";

// ─── API Helpers ──────────────────────────────────────────────
const getToken = () => localStorage.getItem("staff_token");

const apiFetch = async (action, method = "GET", body = null, params = {}) => {
  const url = new URL(API);
  url.searchParams.set("action", action);
  Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));

  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": getToken() || "",
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url.toString(), opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

// ─── Mock Data (when no backend) ──────────────────────────────
const MOCK_REQUESTS = [
  { request_id: "CHK-20240418-A1B2C3", full_name: "Rahul Sharma", mobile: "9876543210", email: "rahul@email.com", aadhaar_masked: "XXXX-XXXX-4521", num_guests: 2, room_type: "deluxe", checkin_date: "2026-04-18", checkout_date: "2026-04-20", status: "pending", submitted_at: "2026-04-18T10:30:00", hotel_name: "The Grand Rajputana Palace", room_number: null },
  { request_id: "CHK-20240418-D4E5F6", full_name: "Priya Patel", mobile: "9123456789", email: "priya@email.com", aadhaar_masked: "XXXX-XXXX-7832", num_guests: 1, room_type: "standard", checkin_date: "2026-04-18", checkout_date: "2026-04-19", status: "approved", submitted_at: "2026-04-18T09:15:00", hotel_name: "The Grand Rajputana Palace", room_number: "204" },
  { request_id: "CHK-20240418-G7H8I9", full_name: "Amit Verma", mobile: "9988776655", email: "amit@email.com", aadhaar_masked: "XXXX-XXXX-1234", num_guests: 3, room_type: "suite", checkin_date: "2026-04-19", checkout_date: "2026-04-22", status: "pending", submitted_at: "2026-04-18T11:45:00", hotel_name: "The Grand Rajputana Palace", room_number: null },
  { request_id: "CHK-20240417-J1K2L3", full_name: "Sunita Gupta", mobile: "9012345678", email: "sunita@email.com", aadhaar_masked: "XXXX-XXXX-9876", num_guests: 2, room_type: "standard", checkin_date: "2026-04-17", checkout_date: "2026-04-18", status: "rejected", submitted_at: "2026-04-17T14:20:00", hotel_name: "The Grand Rajputana Palace", room_number: null },
  { request_id: "CHK-20240418-M4N5O6", full_name: "Vikram Singh", mobile: "9765432109", email: "vikram@email.com", aadhaar_masked: "XXXX-XXXX-5678", num_guests: 1, room_type: "deluxe", checkin_date: "2026-04-18", checkout_date: "2026-04-20", status: "pending", submitted_at: "2026-04-18T08:00:00", hotel_name: "The Grand Rajputana Palace", room_number: null },
];

const MOCK_DETAIL = {
  request_id: "CHK-20240418-A1B2C3", full_name: "Rahul Sharma", mobile: "9876543210",
  email: "rahul@email.com", aadhaar_masked: "XXXX-XXXX-4521", num_guests: 2,
  room_type: "deluxe", checkin_date: "2026-04-18", checkout_date: "2026-04-20",
  travel_from: "Delhi", travel_method: "train", status: "pending",
  submitted_at: "2026-04-18T10:30:00", hotel_name: "The Grand Rajputana Palace",
  room_number: null, internal_notes: null, rejection_reason: null,
  id_proof_path: null, photo_path: null,
};

const MOCK_MEMBERS = [
  { member_index: 2, full_name: "Neha Sharma", aadhaar_masked: "XXXX-XXXX-8821", age: 28, gender: "female" },
];

const MOCK_STATS = { total: 12, pending: 5, approved: 6, rejected: 1, today: 3 };

// ─── Styles ───────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0F1117;
  --surface: #1A1D27;
  --surface2: #22263A;
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.12);
  --text: #E8EAF0;
  --muted: #6B7280;
  --accent: #6C63FF;
  --accent2: #8B84FF;
  --gold: #F59E0B;
  --green: #10B981;
  --red: #EF4444;
  --yellow: #F59E0B;
  --font: 'Outfit', sans-serif;
  --mono: 'JetBrains Mono', monospace;
  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 4px 24px rgba(0,0,0,0.4);
}

body { font-family: var(--font); background: var(--bg); color: var(--text); min-height: 100vh; }

/* ── Login ── */
.login-wrap {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at 20% 50%, rgba(108,99,255,0.15) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.08) 0%, transparent 50%),
              var(--bg);
}
.login-card {
  background: var(--surface); border: 1px solid var(--border2); border-radius: 20px;
  padding: 48px 40px; width: 100%; max-width: 420px; box-shadow: var(--shadow);
}
.login-logo { font-size: 32px; margin-bottom: 8px; }
.login-title { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
.login-sub { font-size: 14px; color: var(--muted); margin-bottom: 36px; }

/* ── Layout ── */
.layout { display: flex; min-height: 100vh; }
.sidebar {
  width: 240px; background: var(--surface); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; flex-shrink: 0; position: fixed;
  top: 0; left: 0; height: 100vh; z-index: 10;
}
.sidebar-logo {
  padding: 24px 20px 20px; border-bottom: 1px solid var(--border);
  font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 10px;
}
.sidebar-logo-icon {
  width: 34px; height: 34px; background: var(--accent); border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  border-radius: var(--radius-sm); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; color: var(--muted); border: none; background: none;
  width: 100%; text-align: left;
}
.nav-item:hover { background: var(--surface2); color: var(--text); }
.nav-item.active { background: rgba(108,99,255,0.15); color: var(--accent2); }
.nav-badge {
  margin-left: auto; background: var(--accent); color: #fff; font-size: 11px;
  font-weight: 600; padding: 2px 7px; border-radius: 20px; min-width: 20px; text-align: center;
}
.sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--border); }
.staff-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.staff-avatar {
  width: 36px; height: 36px; border-radius: 50%; background: var(--accent);
  display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700;
}
.staff-name { font-size: 13px; font-weight: 600; }
.staff-role { font-size: 11px; color: var(--muted); text-transform: capitalize; }
.btn-logout {
  width: 100%; padding: 8px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
  border-radius: var(--radius-sm); color: var(--red); font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: var(--font); transition: all 0.15s;
}
.btn-logout:hover { background: rgba(239,68,68,0.2); }

.main { margin-left: 240px; flex: 1; display: flex; flex-direction: column; }
.topbar {
  padding: 16px 28px; border-bottom: 1px solid var(--border); background: var(--surface);
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  position: sticky; top: 0; z-index: 5;
}
.page-title { font-size: 18px; font-weight: 700; }
.content { padding: 28px; flex: 1; }

/* ── Stats ── */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
.stat-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 20px; position: relative; overflow: hidden;
}
.stat-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
}
.stat-card.pending::before { background: var(--yellow); }
.stat-card.approved::before { background: var(--green); }
.stat-card.rejected::before { background: var(--red); }
.stat-card.total::before { background: var(--accent); }
.stat-label { font-size: 12px; color: var(--muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
.stat-val { font-size: 32px; font-weight: 700; font-family: var(--mono); }
.stat-val.pending { color: var(--yellow); }
.stat-val.approved { color: var(--green); }
.stat-val.rejected { color: var(--red); }
.stat-val.total { color: var(--accent2); }

/* ── Filters ── */
.filters {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
}
.search-box {
  flex: 1; min-width: 200px; position: relative;
}
.search-box input {
  width: 100%; padding: 10px 14px 10px 38px; background: var(--surface);
  border: 1px solid var(--border2); border-radius: var(--radius-sm);
  color: var(--text); font-size: 14px; font-family: var(--font); outline: none;
  transition: border-color 0.2s;
}
.search-box input:focus { border-color: var(--accent); }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 16px; }
.filter-select {
  padding: 10px 14px; background: var(--surface); border: 1px solid var(--border2);
  border-radius: var(--radius-sm); color: var(--text); font-size: 14px;
  font-family: var(--font); outline: none; cursor: pointer;
}
.filter-select:focus { border-color: var(--accent); }

/* ── Tab pills ── */
.tabs { display: flex; gap: 6px; background: var(--surface2); padding: 4px; border-radius: 10px; }
.tab {
  padding: 7px 16px; border-radius: 7px; font-size: 13px; font-weight: 500;
  cursor: pointer; border: none; background: none; color: var(--muted);
  font-family: var(--font); transition: all 0.15s; white-space: nowrap;
}
.tab.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }

/* ── Table ── */
.table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
thead th {
  padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600;
  color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em;
  border-bottom: 1px solid var(--border); background: var(--surface2);
}
tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; cursor: pointer; }
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: var(--surface2); }
td { padding: 14px 16px; font-size: 14px; }
.req-id { font-family: var(--mono); font-size: 12px; color: var(--accent2); font-weight: 500; }
.guest-name { font-weight: 600; }
.guest-mobile { font-size: 12px; color: var(--muted); margin-top: 2px; }

/* ── Status badges ── */
.badge {
  display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px;
  border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.02em;
}
.badge.pending  { background: rgba(245,158,11,0.15); color: #F59E0B; }
.badge.approved { background: rgba(16,185,129,0.15); color: #10B981; }
.badge.rejected { background: rgba(239,68,68,0.15);  color: #EF4444; }
.badge::before { content: '●'; font-size: 8px; }

/* ── Buttons ── */
.btn {
  padding: 9px 18px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600;
  cursor: pointer; border: none; font-family: var(--font); transition: all 0.15s;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent2); transform: translateY(-1px); }
.btn-success { background: rgba(16,185,129,0.15); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }
.btn-success:hover { background: rgba(16,185,129,0.25); }
.btn-danger  { background: rgba(239,68,68,0.15);  color: var(--red);   border: 1px solid rgba(239,68,68,0.3); }
.btn-danger:hover  { background: rgba(239,68,68,0.25); }
.btn-ghost  { background: var(--surface2); color: var(--text); border: 1px solid var(--border2); }
.btn-ghost:hover { border-color: var(--accent); color: var(--accent2); }
.btn-sm { padding: 6px 12px; font-size: 12px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

/* ── Form fields ── */
.field { margin-bottom: 18px; }
.field label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
.field input, .field select, .field textarea {
  width: 100%; padding: 10px 14px; background: var(--surface2);
  border: 1px solid var(--border2); border-radius: var(--radius-sm);
  color: var(--text); font-size: 14px; font-family: var(--font); outline: none;
  transition: border-color 0.2s;
}
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--accent); }
.field textarea { resize: vertical; min-height: 80px; }
.field select { cursor: pointer; appearance: none; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 50;
  display: flex; align-items: center; justify-content: center; padding: 20px;
  backdrop-filter: blur(4px);
}
.modal {
  background: var(--surface); border: 1px solid var(--border2); border-radius: 20px;
  width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
}
.modal-header {
  padding: 24px 28px 20px; border-bottom: 1px solid var(--border);
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; position: sticky; top: 0; background: var(--surface); z-index: 1;
}
.modal-title { font-size: 20px; font-weight: 700; }
.modal-sub { font-size: 13px; color: var(--muted); margin-top: 2px; }
.btn-close { background: var(--surface2); border: 1px solid var(--border2); color: var(--muted); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.modal-body { padding: 24px 28px; }
.modal-footer { padding: 20px 28px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }

/* ── Detail sections ── */
.detail-section { margin-bottom: 24px; }
.detail-section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent2); font-weight: 700; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-row { display: flex; flex-direction: column; gap: 3px; }
.detail-label { font-size: 11px; color: var(--muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
.detail-val { font-size: 14px; font-weight: 500; }
.detail-val.mono { font-family: var(--mono); font-size: 13px; color: var(--accent2); }
.member-row { background: var(--surface2); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 14px; }
.member-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }

/* ── Confirm dialog ── */
.confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
.confirm-box { background: var(--surface); border: 1px solid var(--border2); border-radius: 16px; padding: 28px; max-width: 400px; width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,0.6); }
.confirm-icon { font-size: 36px; margin-bottom: 14px; }
.confirm-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.confirm-msg { font-size: 14px; color: var(--muted); margin-bottom: 24px; line-height: 1.6; }
.confirm-btns { display: flex; gap: 10px; }

/* ── Empty / Loading ── */
.empty { text-align: center; padding: 60px 20px; color: var(--muted); }
.empty-icon { font-size: 48px; margin-bottom: 14px; }
.loading { display: flex; align-items: center; justify-content: center; padding: 60px; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Input error ── */
.input-error { font-size: 12px; color: var(--red); margin-top: 4px; }

@media (max-width: 768px) {
  .sidebar { width: 200px; }
  .main { margin-left: 200px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .detail-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .sidebar { display: none; }
  .main { margin-left: 0; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
`;

// ─── Login Page ───────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("admin@hotel.com");
  const [pass, setPass] = useState("Admin@1234");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(""); setLoading(true);
    try {
      const data = await apiFetch("login", "POST", { email, password: pass });
      localStorage.setItem("staff_token", data.token);
      localStorage.setItem("staff_user", JSON.stringify(data.staff));
      onLogin(data.staff);
    } catch (e) {
      // Mock login for demo
      if (email === "admin@hotel.com" && pass === "Admin@1234") {
        const mockStaff = { id: 1, name: "Admin User", email, role: "admin" };
        localStorage.setItem("staff_token", "mock-token-123");
        localStorage.setItem("staff_user", JSON.stringify(mockStaff));
        onLogin(mockStaff);
      } else {
        setErr(e.message || "Invalid credentials");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">🏨</div>
        <div className="login-title">Staff Portal</div>
        <div className="login-sub">Hotel Check-in Management System</div>

        <div className="field">
          <label>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="staff@hotel.com" onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        {err && <div className="input-error" style={{ marginBottom: 16 }}>⚠ {err}</div>}
        <button className="btn btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15, justifyContent: "center" }} onClick={submit} disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in…</> : "Sign In →"}
        </button>
        <div style={{ marginTop: 16, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
          Demo: admin@hotel.com / Admin@1234
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ staff, active, onNav, onLogout, pendingCount }) {
  const initials = staff.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const nav = [
    { key: "dashboard", icon: "▦", label: "Dashboard" },
    { key: "pending",   icon: "⏳", label: "Pending",  badge: pendingCount },
    { key: "approved",  icon: "✓",  label: "Approved" },
    { key: "rejected",  icon: "✕",  label: "Rejected" },
    { key: "all",       icon: "☰",  label: "All Requests" },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏨</div>
        <div>
          <div style={{ fontSize: 14 }}>Staff Panel</div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>Reception</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {nav.map(n => (
          <button key={n.key} className={`nav-item ${active === n.key ? "active" : ""}`} onClick={() => onNav(n.key)}>
            <span style={{ fontSize: 15 }}>{n.icon}</span>
            {n.label}
            {n.badge > 0 && <span className="nav-badge">{n.badge}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="staff-info">
          <div className="staff-avatar">{initials}</div>
          <div>
            <div className="staff-name">{staff.name}</div>
            <div className="staff-role">{staff.role}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout}>Sign Out</button>
      </div>
    </div>
  );
}

// ─── Stats Cards ──────────────────────────────────────────────
function StatsBar({ stats }) {
  return (
    <div className="stats-grid">
      {[
        { key: "total",    label: "Total Requests", val: stats.total    || 0 },
        { key: "pending",  label: "Pending",         val: stats.pending  || 0 },
        { key: "approved", label: "Approved",         val: stats.approved || 0 },
        { key: "rejected", label: "Rejected",         val: stats.rejected || 0 },
      ].map(s => (
        <div key={s.key} className={`stat-card ${s.key}`}>
          <div className="stat-label">{s.label}</div>
          <div className={`stat-val ${s.key}`}>{s.val}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────
function Badge({ status }) {
  return <span className={`badge ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

// ─── Request Table ────────────────────────────────────────────
function RequestTable({ requests, onView, loading }) {
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!requests.length) return (
    <div className="empty">
      <div className="empty-icon">📋</div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No requests found</div>
      <div style={{ fontSize: 14 }}>Try adjusting your filters</div>
    </div>
  );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Guest</th>
            <th>Guests</th>
            <th>Room Type</th>
            <th>Check-in</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.request_id} onClick={() => onView(r)}>
              <td><div className="req-id">{r.request_id}</div></td>
              <td>
                <div className="guest-name">{r.full_name}</div>
                <div className="guest-mobile">{r.mobile}</div>
              </td>
              <td>{r.num_guests}</td>
              <td style={{ textTransform: "capitalize" }}>{r.room_type}</td>
              <td style={{ fontFamily: "var(--mono)", fontSize: 13 }}>{r.checkin_date}</td>
              <td><Badge status={r.status} /></td>
              <td>
                <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); onView(r); }}>View →</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────
function ConfirmDialog({ type, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState("");
  const [roomNum, setRoomNum] = useState("");
  const [checkinTime, setCheckinTime] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");

  const handle = () => {
    if (type === "approve" && !roomNum.trim()) { setErr("Room number is required"); return; }
    if (type === "reject"  && !reason.trim())  { setErr("Rejection reason is required"); return; }
    onConfirm({ room_number: roomNum, reason, checkin_time: checkinTime, internal_notes: notes });
  };

  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div className="confirm-icon">{type === "approve" ? "✅" : "❌"}</div>
        <div className="confirm-title">{type === "approve" ? "Approve Request" : "Reject Request"}</div>
        <div className="confirm-msg">
          {type === "approve"
            ? "Fill in the room details to approve this check-in request."
            : "Please provide a reason for rejecting this request."}
        </div>
        {type === "approve" && (
          <>
            <div className="field">
              <label>Room Number <span style={{ color: "var(--red)" }}>*</span></label>
              <input value={roomNum} onChange={e => setRoomNum(e.target.value)} placeholder="e.g. 204" />
            </div>
            <div className="field">
              <label>Check-in Time</label>
              <input type="datetime-local" value={checkinTime} onChange={e => setCheckinTime(e.target.value)} />
            </div>
            <div className="field">
              <label>Internal Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes for staff..." />
            </div>
          </>
        )}
        {type === "reject" && (
          <div className="field">
            <label>Rejection Reason <span style={{ color: "var(--red)" }}>*</span></label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why this request is being rejected..." />
          </div>
        )}
        {err && <div className="input-error" style={{ marginBottom: 12 }}>⚠ {err}</div>}
        <div className="confirm-btns">
          <button className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
          <button
            className={`btn ${type === "approve" ? "btn-success" : "btn-danger"}`}
            style={{ flex: 1, justifyContent: "center" }}
            onClick={handle}
            disabled={loading}
          >
            {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : (type === "approve" ? "✓ Approve" : "✕ Reject")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────
function DetailModal({ req, members, onClose, onApprove, onReject }) {
  const [confirm, setConfirm] = useState(null); // 'approve' | 'reject'
  const [actLoading, setActLoading] = useState(false);

  const handleAction = async (data) => {
    setActLoading(true);
    try {
      if (confirm === "approve") await onApprove(req.request_id, data);
      else                       await onReject(req.request_id, data);
      setConfirm(null);
      onClose();
    } catch (e) {
      alert("Error: " + e.message);
    } finally { setActLoading(false); }
  };

  const rmMap = { standard: "Standard", deluxe: "Deluxe", suite: "Suite" };
  const tmMap = { car: "Car 🚗", train: "Train 🚂", flight: "Flight ✈️", other: "Other" };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <div className="modal-title">Check-in Request</div>
              <div className="modal-sub" style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent2)" }}>{req.request_id}</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Badge status={req.status} />
              <button className="btn-close" onClick={onClose}>✕</button>
            </div>
          </div>

          <div className="modal-body">
            {/* Primary Guest */}
            <div className="detail-section">
              <div className="detail-section-title">Primary Guest</div>
              <div className="detail-grid">
                <div className="detail-row"><div className="detail-label">Full Name</div><div className="detail-val">{req.full_name}</div></div>
                <div className="detail-row"><div className="detail-label">Mobile</div><div className="detail-val">{req.mobile}</div></div>
                <div className="detail-row"><div className="detail-label">Email</div><div className="detail-val">{req.email || "—"}</div></div>
                <div className="detail-row"><div className="detail-label">Aadhaar</div><div className="detail-val mono">{req.aadhaar_masked}</div></div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="detail-section">
              <div className="detail-section-title">Stay Details</div>
              <div className="detail-grid">
                <div className="detail-row"><div className="detail-label">Room Type</div><div className="detail-val">{rmMap[req.room_type] || req.room_type}</div></div>
                <div className="detail-row"><div className="detail-label">Guests</div><div className="detail-val">{req.num_guests}</div></div>
                <div className="detail-row"><div className="detail-label">Check-in</div><div className="detail-val mono" style={{ fontSize: 13 }}>{req.checkin_date}</div></div>
                <div className="detail-row"><div className="detail-label">Check-out</div><div className="detail-val mono" style={{ fontSize: 13 }}>{req.checkout_date}</div></div>
                <div className="detail-row"><div className="detail-label">Travel From</div><div className="detail-val">{req.travel_from || "—"}</div></div>
                <div className="detail-row"><div className="detail-label">Travel Mode</div><div className="detail-val">{tmMap[req.travel_method] || req.travel_method || "—"}</div></div>
              </div>
            </div>

            {/* Assigned Room (if approved) */}
            {req.room_number && (
              <div className="detail-section">
                <div className="detail-section-title">Assignment</div>
                <div className="detail-grid">
                  <div className="detail-row"><div className="detail-label">Room Number</div><div className="detail-val" style={{ fontSize: 20, fontWeight: 700, color: "var(--green)" }}>🏠 {req.room_number}</div></div>
                  {req.actual_checkin_time && <div className="detail-row"><div className="detail-label">Check-in Time</div><div className="detail-val mono" style={{ fontSize: 12 }}>{req.actual_checkin_time}</div></div>}
                </div>
              </div>
            )}

            {/* Rejection reason */}
            {req.rejection_reason && (
              <div className="detail-section">
                <div className="detail-section-title">Rejection Reason</div>
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "var(--radius-sm)", padding: "12px 14px", fontSize: 14, color: "var(--red)" }}>
                  {req.rejection_reason}
                </div>
              </div>
            )}

            {/* Members */}
            {members && members.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">Additional Members ({members.length})</div>
                {members.map((m, i) => (
                  <div key={i} className="member-row">
                    <div className="member-avatar">{m.full_name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.full_name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {m.aadhaar_masked} {m.age ? `· Age ${m.age}` : ""} {m.gender ? `· ${m.gender}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            {req.internal_notes && (
              <div className="detail-section">
                <div className="detail-section-title">Internal Notes</div>
                <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>{req.internal_notes}</div>
              </div>
            )}

            {/* Submitted */}
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
              Submitted: {new Date(req.submitted_at).toLocaleString("en-IN")}
            </div>
          </div>

          {req.status === "pending" && (
            <div className="modal-footer">
              <button className="btn btn-danger"  onClick={() => setConfirm("reject")}>✕ Reject</button>
              <button className="btn btn-success" onClick={() => setConfirm("approve")}>✓ Approve</button>
            </div>
          )}
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          type={confirm}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          loading={actLoading}
        />
      )}
    </>
  );
}

// ─── Main App ─────────────────────────────────────────────────
export default function StaffPanel() {
  const [staff, setStaff] = useState(() => {
    try { return JSON.parse(localStorage.getItem("staff_user")); } catch { return null; }
  });
  const [page, setPage]         = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [stats, setStats]       = useState(MOCK_STATS);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [selMembers, setSelMembers] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const statusFilter = ["pending","approved","rejected"].includes(page) ? page : "";

  const loadStats = useCallback(async () => {
    try {
      const d = await apiFetch("stats");
      setStats(d.stats);
    } catch { setStats(MOCK_STATS); }
  }, []);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const d = await apiFetch("requests", "GET", null, { status: statusFilter, search, date: dateFilter });
      setRequests(d.requests);
    } catch {
      // Use mock data filtered
      let filtered = MOCK_REQUESTS;
      if (statusFilter) filtered = filtered.filter(r => r.status === statusFilter);
      if (search) filtered = filtered.filter(r =>
        r.full_name.toLowerCase().includes(search.toLowerCase()) ||
        r.mobile.includes(search) ||
        r.request_id.toLowerCase().includes(search.toLowerCase())
      );
      setRequests(filtered);
    } finally { setLoading(false); }
  }, [statusFilter, search, dateFilter]);

  useEffect(() => {
    if (staff) { loadStats(); loadRequests(); }
  }, [staff, loadStats, loadRequests]);

  const viewRequest = async (r) => {
    setSelected(r); setSelMembers([]); setDetailLoading(true);
    try {
      const d = await apiFetch("request", "GET", null, { id: r.request_id });
      setSelected(d.request);
      setSelMembers(d.members || []);
    } catch {
      setSelected({ ...MOCK_DETAIL, ...r });
      setSelMembers(r.num_guests > 1 ? MOCK_MEMBERS : []);
    } finally { setDetailLoading(false); }
  };

  const handleApprove = async (id, data) => {
    await apiFetch("approve", "POST", { room_number: data.room_number, internal_notes: data.internal_notes, checkin_time: data.checkin_time }, { id });
    loadRequests(); loadStats();
  };

  const handleReject = async (id, data) => {
    await apiFetch("reject", "POST", { reason: data.reason }, { id });
    loadRequests(); loadStats();
  };

  const logout = () => {
    localStorage.removeItem("staff_token");
    localStorage.removeItem("staff_user");
    setStaff(null);
  };

  if (!staff) return (
    <>
      <style>{css}</style>
      <LoginPage onLogin={s => setStaff(s)} />
    </>
  );

  const pageTitle = {
    dashboard: "Dashboard",
    pending:   "Pending Requests",
    approved:  "Approved Requests",
    rejected:  "Rejected Requests",
    all:       "All Requests",
  }[page] || "Dashboard";

  return (
    <>
      <style>{css}</style>
      <div className="layout">
        <Sidebar
          staff={staff}
          active={page}
          onNav={setPage}
          onLogout={logout}
          pendingCount={stats.pending || 0}
        />

        <div className="main">
          <div className="topbar">
            <div className="page-title">{pageTitle}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </div>
              <div style={{ background: "rgba(16,185,129,0.15)", color: "var(--green)", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
                ● Online
              </div>
            </div>
          </div>

          <div className="content">
            {page === "dashboard" && <StatsBar stats={stats} />}

            {/* Tabs for dashboard */}
            {page === "dashboard" && (
              <div className="tabs" style={{ marginBottom: 20, display: "inline-flex" }}>
                {["all","pending","approved","rejected"].map(t => (
                  <button key={t} className={`tab ${statusFilter === t || (t === "all" && !statusFilter) ? "active" : ""}`}
                    onClick={() => setPage(t === "all" ? "dashboard" : t)}
                    style={{ textTransform: "capitalize" }}
                  >{t}</button>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="filters">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, mobile or request ID…"
                />
              </div>
              <input
                type="date"
                className="filter-select"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                style={{ padding: "10px 14px" }}
              />
              {(search || dateFilter) && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setDateFilter(""); }}>Clear</button>
              )}
            </div>

            <RequestTable
              requests={requests}
              onView={viewRequest}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {selected && !detailLoading && (
        <DetailModal
          req={selected}
          members={selMembers}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {detailLoading && (
        <div className="modal-overlay">
          <div className="loading"><div className="spinner" /></div>
        </div>
      )}
    </>
  );
}
