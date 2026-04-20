import { useState, useEffect, useCallback } from "react";

const API = "https://hotel-checkin-api-g8gwbqcnhsazd9b8.centralindia-01.azurewebsites.net/api/staff-api.php";
const getToken = () => localStorage.getItem("staff_token");

const apiFetch = async (action, method = "GET", body = null, params = {}) => {
  const url = new URL(API);
  url.searchParams.set("action", action);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") url.searchParams.set(k, v);
  });
  const opts = {
    method,
    headers: { "Content-Type": "application/json", "X-Auth-Token": getToken() || "" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url.toString(), opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#F4F6FA;--white:#FFFFFF;--sidebar:#1E2B3A;--sidebar-hover:#28394D;--sidebar-active:#2E4460;
  --border:#E4E8EF;--border2:#D0D7E2;--text:#1A2332;--muted:#64748B;--light:#94A3B8;
  --accent:#2563EB;--accent-light:#EFF6FF;--accent2:#1D4ED8;
  --green:#16A34A;--green-bg:#F0FDF4;--green-border:#BBF7D0;
  --red:#DC2626;--red-bg:#FEF2F2;--red-border:#FECACA;
  --yellow:#D97706;--yellow-bg:#FFFBEB;--yellow-border:#FDE68A;
  --font:'Plus Jakarta Sans',system-ui,sans-serif;
  --radius:12px;--radius-sm:8px;--radius-lg:16px;
  --shadow:0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:0 4px 16px rgba(0,0,0,0.08);--shadow-lg:0 8px 32px rgba(0,0,0,0.12);
}
body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh;font-size:14px}
.login-page{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:var(--white)}
.login-left{background:var(--sidebar);display:flex;flex-direction:column;justify-content:center;padding:60px 56px;position:relative;overflow:hidden}
.login-left::before{content:'';position:absolute;width:400px;height:400px;background:rgba(37,99,235,0.15);border-radius:50%;top:-100px;right:-100px}
.login-left::after{content:'';position:absolute;width:300px;height:300px;background:rgba(37,99,235,0.08);border-radius:50%;bottom:-80px;left:-60px}
.login-brand{display:flex;align-items:center;gap:14px;margin-bottom:48px;position:relative;z-index:1}
.login-brand-icon{width:52px;height:52px;background:var(--accent);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px}
.login-brand-name{font-size:22px;font-weight:800;color:#fff}
.login-brand-sub{font-size:13px;color:rgba(255,255,255,0.5);margin-top:1px}
.login-headline{font-size:34px;font-weight:800;color:#fff;line-height:1.25;margin-bottom:16px;position:relative;z-index:1}
.login-desc{font-size:15px;color:rgba(255,255,255,0.55);line-height:1.7;position:relative;z-index:1}
.login-right{display:flex;align-items:center;justify-content:center;padding:40px}
.login-form-box{width:100%;max-width:400px}
.login-form-title{font-size:28px;font-weight:800;color:var(--text);margin-bottom:6px}
.login-form-sub{font-size:14px;color:var(--muted);margin-bottom:36px}
.layout{display:flex;min-height:100vh}
.sidebar{width:256px;background:var(--sidebar);display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:20}
.sidebar-top{padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:12px}
.sidebar-icon{width:40px;height:40px;background:var(--accent);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.sidebar-title{font-size:15px;font-weight:700;color:#fff}
.sidebar-sub{font-size:11px;color:rgba(255,255,255,0.4);margin-top:1px}
.sidebar-nav{flex:1;padding:16px 12px;overflow-y:auto}
.nav-section-label{font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.3);font-weight:600;padding:0 10px;margin:16px 0 6px}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:13.5px;font-weight:500;cursor:pointer;border:none;background:none;color:rgba(255,255,255,0.55);font-family:var(--font);width:100%;text-align:left;transition:all 0.15s;margin-bottom:2px}
.nav-item:hover{background:var(--sidebar-hover);color:rgba(255,255,255,0.9)}
.nav-item.active{background:var(--sidebar-active);color:#fff;font-weight:600}
.nav-badge{margin-left:auto;background:#EF4444;color:#fff;font-size:11px;font-weight:700;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:0 5px}
.sidebar-footer{padding:16px 12px;border-top:1px solid rgba(255,255,255,0.07)}
.staff-card{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;background:rgba(255,255,255,0.05);margin-bottom:10px}
.staff-avatar{width:36px;height:36px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0}
.staff-name{font-size:13px;font-weight:600;color:#fff}
.staff-role{font-size:11px;color:rgba(255,255,255,0.4);text-transform:capitalize}
.btn-signout{width:100%;padding:9px;border-radius:8px;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.2);color:#FCA5A5;font-size:13px;font-weight:500;cursor:pointer;font-family:var(--font);transition:all 0.15s}
.btn-signout:hover{background:rgba(239,68,68,0.22)}
.main{margin-left:256px;flex:1;display:flex;flex-direction:column;min-height:100vh}
.topbar{background:var(--white);border-bottom:1px solid var(--border);padding:0 28px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:16px;position:sticky;top:0;z-index:10;box-shadow:var(--shadow)}
.page-title{font-size:18px;font-weight:700;color:var(--text)}
.topbar-date{font-size:13px;color:var(--muted)}
.online-pill{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border);font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;display:flex;align-items:center;gap:5px}
.content{padding:28px;flex:1}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
.stat-card{background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:20px 22px;box-shadow:var(--shadow);cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden}
.stat-card:hover{box-shadow:var(--shadow-md);transform:translateY(-1px)}
.stat-icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px}
.stat-label{font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px}
.stat-val{font-size:30px;font-weight:800}
.stat-card.s-total .stat-icon{background:#EFF6FF}.stat-card.s-total .stat-val{color:var(--accent)}
.stat-card.s-pending .stat-icon{background:var(--yellow-bg)}.stat-card.s-pending .stat-val{color:var(--yellow)}
.stat-card.s-approved .stat-icon{background:var(--green-bg)}.stat-card.s-approved .stat-val{color:var(--green)}
.stat-card.s-rejected .stat-icon{background:var(--red-bg)}.stat-card.s-rejected .stat-val{color:var(--red)}
.toolbar{background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;display:flex;align-items:center;gap:12px;margin-bottom:16px;box-shadow:var(--shadow);flex-wrap:wrap}
.search-wrap{flex:1;min-width:220px;position:relative}
.search-wrap input{width:100%;padding:9px 14px 9px 38px;border:1.5px solid var(--border2);border-radius:var(--radius-sm);font-size:13.5px;color:var(--text);font-family:var(--font);outline:none;transition:border-color 0.2s;background:var(--bg)}
.search-wrap input:focus{border-color:var(--accent);background:var(--white)}
.search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted)}
.filter-input{padding:9px 12px;border:1.5px solid var(--border2);border-radius:var(--radius-sm);font-size:13.5px;color:var(--text);font-family:var(--font);outline:none;background:var(--bg);transition:border-color 0.2s}
.filter-input:focus{border-color:var(--accent)}
.tabs-pill{display:flex;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden}
.tab-btn{padding:7px 14px;font-size:13px;font-weight:500;cursor:pointer;border:none;background:none;color:var(--muted);font-family:var(--font);transition:all 0.15s;white-space:nowrap}
.tab-btn.active{background:var(--white);color:var(--accent);font-weight:600;box-shadow:var(--shadow)}
.btn-clear{padding:8px 14px;border-radius:var(--radius-sm);font-size:13px;font-weight:500;cursor:pointer;background:none;border:1.5px solid var(--border2);color:var(--muted);font-family:var(--font);transition:all 0.15s}
.btn-clear:hover{border-color:var(--red);color:var(--red)}
.table-card{background:var(--white);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden}
.table-header{padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:#FAFBFC}
.table-title{font-size:14px;font-weight:700;color:var(--text)}
.table-count{font-size:12px;color:var(--muted);background:var(--bg);padding:3px 10px;border-radius:20px;border:1px solid var(--border)}
table{width:100%;border-collapse:collapse}
thead th{padding:11px 16px;text-align:left;font-size:11.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.06em;background:#FAFBFC;border-bottom:1px solid var(--border);white-space:nowrap}
tbody tr{transition:background 0.12s;cursor:pointer}
tbody tr:not(:last-child){border-bottom:1px solid var(--border)}
tbody tr:hover{background:#F8FAFF}
td{padding:13px 16px;font-size:13.5px;vertical-align:middle}
.req-id{font-family:'Courier New',monospace;font-size:12px;color:var(--accent);font-weight:600}
.guest-name{font-weight:600;color:var(--text)}
.guest-mobile{font-size:12px;color:var(--muted);margin-top:2px}
.room-chip{display:inline-flex;align-items:center;gap:4px;background:var(--green-bg);color:var(--green);border:1px solid var(--green-border);font-size:12px;font-weight:600;padding:2px 8px;border-radius:6px}
.badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600;white-space:nowrap}
.badge.pending{background:var(--yellow-bg);color:var(--yellow);border:1px solid var(--yellow-border)}
.badge.approved{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}
.badge.rejected{background:var(--red-bg);color:var(--red);border:1px solid var(--red-border)}
.badge::before{content:'●';font-size:7px}
.btn{padding:9px 18px;border-radius:var(--radius-sm);font-size:13.5px;font-weight:600;cursor:pointer;border:none;font-family:var(--font);display:inline-flex;align-items:center;gap:6px;transition:all 0.15s}
.btn:disabled{opacity:0.55;cursor:not-allowed}
.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover:not(:disabled){background:var(--accent2)}
.btn-success{background:var(--green-bg);color:var(--green);border:1.5px solid var(--green-border)}
.btn-success:hover:not(:disabled){background:#DCFCE7}
.btn-danger{background:var(--red-bg);color:var(--red);border:1.5px solid var(--red-border)}
.btn-danger:hover:not(:disabled){background:#FEE2E2}
.btn-outline{background:var(--white);color:var(--text);border:1.5px solid var(--border2)}
.btn-outline:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
.btn-sm{padding:6px 12px;font-size:12.5px}
.field{margin-bottom:16px}
.field:last-child{margin-bottom:0}
.field label{display:block;font-size:12px;font-weight:600;color:var(--muted);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.05em}
.field input,.field select,.field textarea{width:100%;padding:10px 13px;border:1.5px solid var(--border2);border-radius:var(--radius-sm);font-size:14px;color:var(--text);font-family:var(--font);outline:none;transition:border-color 0.2s;background:var(--white)}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(37,99,235,0.08)}
.field textarea{resize:vertical;min-height:80px}
.field input.err,.field textarea.err{border-color:var(--red)}
.err-msg{font-size:11.5px;color:var(--red);margin-top:4px}
.overlay{position:fixed;inset:0;background:rgba(15,23,42,0.5);z-index:50;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(3px)}
.modal{background:var(--white);border-radius:20px;width:100%;max-width:700px;max-height:92vh;overflow-y:auto;box-shadow:var(--shadow-lg);border:1px solid var(--border)}
.modal-head{padding:22px 26px 18px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;gap:16px;position:sticky;top:0;background:var(--white);z-index:2}
.modal-title{font-size:19px;font-weight:800;color:var(--text)}
.modal-sub{font-size:12px;color:var(--accent);font-weight:600;font-family:monospace;margin-top:3px}
.btn-close{width:32px;height:32px;border-radius:8px;background:var(--bg);border:1px solid var(--border);color:var(--muted);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s}
.btn-close:hover{background:var(--red-bg);color:var(--red);border-color:var(--red-border)}
.modal-body{padding:22px 26px}
.modal-foot{padding:16px 26px;border-top:1px solid var(--border);display:flex;gap:10px;justify-content:flex-end;background:#FAFBFC;border-radius:0 0 20px 20px}
.section{margin-bottom:24px}
.section-title{font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent);font-weight:700;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--accent-light)}
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.detail-item{display:flex;flex-direction:column;gap:3px}
.detail-label{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.04em}
.detail-val{font-size:14px;font-weight:600;color:var(--text)}
.detail-mono{font-family:monospace;font-size:13px;background:var(--accent-light);color:var(--accent);padding:3px 8px;border-radius:5px;display:inline-block}
.member-item{background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 14px;display:flex;align-items:center;gap:12px;margin-bottom:8px}
.member-av{width:38px;height:38px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0}
.room-assigned{background:var(--green-bg);border:1px solid var(--green-border);border-radius:var(--radius-sm);padding:14px 18px;display:flex;align-items:center;gap:12px}
.rejection-box{background:var(--red-bg);border:1px solid var(--red-border);border-radius:var(--radius-sm);padding:12px 14px;font-size:14px;color:var(--red);line-height:1.6}
.confirm-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.65);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
.confirm-box{background:var(--white);border-radius:18px;padding:30px 28px;max-width:420px;width:100%;box-shadow:var(--shadow-lg);border:1px solid var(--border)}
.confirm-icon{font-size:38px;margin-bottom:14px}
.confirm-title{font-size:19px;font-weight:800;color:var(--text);margin-bottom:8px}
.confirm-desc{font-size:13.5px;color:var(--muted);margin-bottom:20px;line-height:1.6}
.confirm-btns{display:flex;gap:10px}
.empty{text-align:center;padding:64px 20px}
.empty-icon{font-size:52px;margin-bottom:14px}
.empty-title{font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px}
.empty-sub{font-size:13px;color:var(--muted)}
.spinner{width:24px;height:24px;border:3px solid var(--border2);border-top-color:var(--accent);border-radius:50%;animation:spin 0.75s linear infinite;display:inline-block}
.loading-wrap{display:flex;align-items:center;justify-content:center;padding:60px}
@keyframes spin{to{transform:rotate(360deg)}}
.error-banner{background:var(--red-bg);border:1px solid var(--red-border);border-radius:var(--radius-sm);padding:12px 16px;font-size:13px;color:var(--red);margin-bottom:16px;display:flex;align-items:center;gap:8px}
@media(max-width:768px){.login-page{grid-template-columns:1fr}.login-left{display:none}.sidebar{width:220px}.main{margin-left:220px}.stats-grid{grid-template-columns:1fr 1fr}.detail-grid{grid-template-columns:1fr}}
`;

function Badge({ status }) {
  const labels = { pending:"Pending", approved:"Approved", rejected:"Rejected", checked_in:"Checked In", checked_out:"Checked Out" };
  return <span className={`badge ${status}`}>{labels[status] || status}</span>;
}

function Spinner() { return <span className="spinner" />; }

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !pass) { setErr("Please enter email and password"); return; }
    setErr(""); setLoading(true);
    try {
      const data = await apiFetch("login", "POST", { email, password: pass });
      localStorage.setItem("staff_token", data.token);
      localStorage.setItem("staff_user", JSON.stringify(data.staff));
      onLogin(data.staff);
    } catch (e) { setErr(e.message || "Invalid credentials"); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">🏨</div>
          <div>
            <div className="login-brand-name">HotelDesk</div>
            <div className="login-brand-sub">Staff Management System</div>
          </div>
        </div>
        <div className="login-headline">Manage your hotel check-ins with ease</div>
        <div className="login-desc">Review guest requests, assign rooms, approve or reject check-ins — all from one place.</div>
      </div>
      <div className="login-right">
        <div className="login-form-box">
          <div className="login-form-title">Welcome back 👋</div>
          <div className="login-form-sub">Sign in to your staff account</div>
          <div className="field">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="staff@hotel.com" onKeyDown={e => e.key==="Enter" && submit()} className={err?"err":""} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key==="Enter" && submit()} className={err?"err":""} />
          </div>
          {err && <div className="err-msg" style={{marginBottom:14}}>⚠ {err}</div>}
          <button className="btn btn-primary" style={{width:"100%",padding:"12px",fontSize:15,justifyContent:"center",marginTop:4}} onClick={submit} disabled={loading}>
            {loading ? <><Spinner /> Signing in…</> : "Sign In →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ staff, active, onNav, onLogout, pendingCount }) {
  const initials = staff.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const nav = [
    {key:"dashboard",icon:"📊",label:"Dashboard"},
    {key:"pending",icon:"⏳",label:"Pending",badge:pendingCount},
    {key:"approved",icon:"✅",label:"Approved"},
    {key:"rejected",icon:"❌",label:"Rejected"},
    {key:"all",icon:"📋",label:"All Requests"},
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-icon">🏨</div>
        <div><div className="sidebar-title">HotelDesk</div><div className="sidebar-sub">Staff Panel</div></div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {nav.map(n => (
          <button key={n.key} className={`nav-item ${active===n.key?"active":""}`} onClick={()=>onNav(n.key)}>
            <span style={{width:18,textAlign:"center"}}>{n.icon}</span>
            {n.label}
            {n.badge>0 && <span className="nav-badge">{n.badge}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="staff-card">
          <div className="staff-avatar">{initials}</div>
          <div><div className="staff-name">{staff.name}</div><div className="staff-role">{staff.role}</div></div>
        </div>
        <button className="btn-signout" onClick={onLogout}>🚪 Sign Out</button>
      </div>
    </div>
  );
}

function StatsBar({ stats, onFilter }) {
  return (
    <div className="stats-grid">
      {[
        {key:"total",label:"Total",val:stats.total||0,icon:"📁",cls:"s-total"},
        {key:"pending",label:"Pending",val:stats.pending||0,icon:"⏳",cls:"s-pending"},
        {key:"approved",label:"Approved",val:stats.approved||0,icon:"✅",cls:"s-approved"},
        {key:"rejected",label:"Rejected",val:stats.rejected||0,icon:"❌",cls:"s-rejected"},
      ].map(s => (
        <div key={s.key} className={`stat-card ${s.cls}`} onClick={()=>onFilter(s.key==="total"?"":s.key)}>
          <div className="stat-icon">{s.icon}</div>
          <div className="stat-label">{s.label}</div>
          <div className="stat-val">{s.val}</div>
        </div>
      ))}
    </div>
  );
}

function ConfirmDialog({ type, onConfirm, onCancel, loading }) {
  const [roomNum, setRoomNum] = useState("");
  const [checkinTime, setCheckinTime] = useState("");
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const handle = () => {
    if (type==="approve" && !roomNum.trim()) { setErr("Room number is required"); return; }
    if (type==="reject"  && !reason.trim())  { setErr("Rejection reason is required"); return; }
    onConfirm({room_number:roomNum, checkin_time:checkinTime, internal_notes:notes, reason});
  };
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <div className="confirm-icon">{type==="approve"?"✅":"🚫"}</div>
        <div className="confirm-title">{type==="approve"?"Approve Check-in Request":"Reject Check-in Request"}</div>
        <div className="confirm-desc">{type==="approve"?"Assign a room and confirm check-in details.":"Please state the reason for rejecting this request."}</div>
        {type==="approve" && <>
          <div className="field"><label>Room Number <span style={{color:"var(--red)"}}>*</span></label><input value={roomNum} onChange={e=>setRoomNum(e.target.value)} placeholder="e.g. 204" className={err&&!roomNum?"err":""} /></div>
          <div className="field"><label>Actual Check-in Time</label><input type="datetime-local" value={checkinTime} onChange={e=>setCheckinTime(e.target.value)} /></div>
          <div className="field"><label>Internal Notes</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes for reception staff..." /></div>
        </>}
        {type==="reject" && <div className="field"><label>Rejection Reason <span style={{color:"var(--red)"}}>*</span></label><textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain why..." className={err&&!reason?"err":""} /></div>}
        {err && <div className="err-msg" style={{marginBottom:12}}>⚠ {err}</div>}
        <div className="confirm-btns">
          <button className="btn btn-outline" style={{flex:1,justifyContent:"center"}} onClick={onCancel} disabled={loading}>Cancel</button>
          <button className={`btn ${type==="approve"?"btn-success":"btn-danger"}`} style={{flex:1,justifyContent:"center"}} onClick={handle} disabled={loading}>
            {loading?<Spinner />:(type==="approve"?"✓ Approve":"✕ Reject")}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ req, members, onClose, onApprove, onReject }) {
  const [confirm, setConfirm] = useState(null);
  const [actLoading, setActLoading] = useState(false);
  const [actErr, setActErr] = useState("");
 const handleAction = async (data) => {
    setActLoading(true); setActErr("");
    try {
      if (confirm === "approve") await onApprove(req.request_id, data);
      else                       await onReject(req.request_id, data);
      setConfirm(null);
      // Small delay so user sees success before modal closes
      await new Promise(r => setTimeout(r, 500));
      onClose(true);
    } catch(e) {
      setActErr(e.message || "Something went wrong. Please try again.");
      setActLoading(false);
    }
  };
  const rmMap = {standard:"Standard Room", deluxe:"Deluxe Room", suite:"Suite"};
  const tmMap = {car:"Car 🚗", train:"Train 🚂", flight:"Flight ✈️", other:"Other"};
  return (
    <>
      <div className="overlay" onClick={()=>onClose(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <div className="modal-title">Check-in Request Details</div>
              <div className="modal-sub">{req.request_id}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Badge status={req.status} />
              <button className="btn-close" onClick={()=>onClose(false)}>✕</button>
            </div>
          </div>
          <div className="modal-body">
            {actErr && <div className="error-banner">⚠ {actErr}</div>}
            <div className="section">
              <div className="section-title">👤 Primary Guest</div>
              <div className="detail-grid">
                {[["Full Name",req.full_name],["Mobile",req.mobile],["Email",req.email||"Not provided"],["Aadhaar",req.aadhaar_masked]].map(([k,v])=>(
                  <div key={k} className="detail-item">
                    <div className="detail-label">{k}</div>
                    {k==="Aadhaar"
                      ? <div><span className="detail-mono">{v}</span></div>
                      : <div className="detail-val">{v}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div className="section">
              <div className="section-title">🏨 Stay Details</div>
              <div className="detail-grid">
                {[["Room Type",rmMap[req.room_type]||req.room_type],["Total Guests",req.num_guests+" Guest"+(req.num_guests>1?"s":"")],["Check-in",req.checkin_date],["Check-out",req.checkout_date],["From",req.travel_from||"Not specified"],["Travel",tmMap[req.travel_method]||"Not specified"]].map(([k,v])=>(
                  <div key={k} className="detail-item"><div className="detail-label">{k}</div><div className="detail-val">{v}</div></div>
                ))}
              </div>
            </div>
            {req.room_number && (
              <div className="section">
                <div className="section-title">🔑 Room Assignment</div>
                <div className="room-assigned">
                  <div style={{fontSize:32}}>🏠</div>
                  <div>
                    <div style={{fontSize:22,fontWeight:800,color:"var(--green)"}}>Room {req.room_number}</div>
                    {req.actual_checkin_time && <div style={{fontSize:13,color:"var(--muted)",marginTop:2}}>Checked in: {new Date(req.actual_checkin_time).toLocaleString("en-IN")}</div>}
                  </div>
                </div>
              </div>
            )}
            {req.rejection_reason && (
              <div className="section">
                <div className="section-title">🚫 Rejection Reason</div>
                <div className="rejection-box">{req.rejection_reason}</div>
              </div>
            )}
            {members && members.length>0 && (
              <div className="section">
                <div className="section-title">👥 Additional Members ({members.length})</div>
                {members.map((m,i)=>(
                  <div key={i} className="member-item">
                    <div className="member-av">{(m.full_name||"?")[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:14}}>{m.full_name}</div>
                      <div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>
                        <span className="detail-mono" style={{fontSize:11}}>{m.aadhaar_masked}</span>
                        {m.age&&` · Age ${m.age}`}{m.gender&&` · ${m.gender}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {req.internal_notes && (
              <div className="section">
                <div className="section-title">📝 Internal Notes</div>
                <div style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",padding:"12px 14px",fontSize:14,color:"var(--muted)",lineHeight:1.6}}>{req.internal_notes}</div>
              </div>
            )}
            <div style={{fontSize:12,color:"var(--muted)",marginTop:8}}>📅 Submitted: {new Date(req.submitted_at).toLocaleString("en-IN")}</div>
          </div>
          {req.status==="pending" && (
            <div className="modal-foot">
              <button className="btn btn-danger"  onClick={()=>setConfirm("reject")}>✕ Reject Request</button>
              <button className="btn btn-success" onClick={()=>setConfirm("approve")}>✓ Approve & Assign Room</button>
            </div>
          )}
        </div>
      </div>
      {confirm && <ConfirmDialog type={confirm} onConfirm={handleAction} onCancel={()=>setConfirm(null)} loading={actLoading} />}
    </>
  );
}

export default function StaffPanel() {
  const [staff, setStaff] = useState(()=>{ try{return JSON.parse(localStorage.getItem("staff_user"));}catch{return null;} });
  const [page, setPage] = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [selMembers, setSelMembers] = useState([]);
  const [detailLoad, setDetailLoad] = useState(false);

  const statusFilter = ["pending","approved","rejected"].includes(page) ? page : "";

  const loadStats = useCallback(async()=>{
    try{ const d=await apiFetch("stats"); setStats(d.stats||{}); }catch(e){console.error("Stats:",e.message);}
  },[]);

  const loadRequests = useCallback(async()=>{
    setLoading(true); setError("");
    try{
      const d = await apiFetch("requests","GET",null,{status:statusFilter,search,date:dateFilter});
      setRequests(d.requests||[]);
    }catch(e){ setError("Failed to load: "+e.message); setRequests([]); }
    finally{ setLoading(false); }
  },[statusFilter,search,dateFilter]);

  useEffect(()=>{ if(staff){loadStats();loadRequests();} },[staff,loadStats,loadRequests]);

  const viewRequest = async(r)=>{
    setSelected(r); setSelMembers([]); setDetailLoad(true);
    try{
      const d=await apiFetch("request","GET",null,{id:r.request_id});
      setSelected(d.request); setSelMembers(d.members||[]);
    }catch(e){ setSelected({...r}); }
    finally{ setDetailLoad(false); }
  };

  const handleApprove = async(id,data)=>{
    await apiFetch("approve","POST",{room_number:data.room_number,internal_notes:data.internal_notes,checkin_time:data.checkin_time},{id});
    loadRequests(); loadStats();
  };

  const handleReject = async(id,data)=>{
    await apiFetch("reject","POST",{reason:data.reason},{id});
    loadRequests(); loadStats();
  };

  const logout=()=>{ localStorage.removeItem("staff_token"); localStorage.removeItem("staff_user"); setStaff(null); };

  if(!staff) return(<><style>{css}</style><LoginPage onLogin={s=>setStaff(s)} /></>);

  const pageLabels={dashboard:"Dashboard",pending:"Pending Requests",approved:"Approved Requests",rejected:"Rejected Requests",all:"All Requests"};

  return (
    <>
      <style>{css}</style>
      <div className="layout">
        <Sidebar staff={staff} active={page} onNav={p=>{setPage(p);setSearch("");setDateFilter("");}} onLogout={logout} pendingCount={stats.pending||0} />
        <div className="main">
          <div className="topbar">
            <div className="page-title">{pageLabels[page]||"Dashboard"}</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div className="topbar-date">{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
              <div className="online-pill"><span style={{fontSize:8}}>●</span> Live</div>
            </div>
          </div>
          <div className="content">
            {page==="dashboard" && <StatsBar stats={stats} onFilter={f=>setPage(f||"all")} />}
            <div className="toolbar">
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by guest name, mobile or request ID…" />
              </div>
              <input type="date" className="filter-input" value={dateFilter} onChange={e=>setDateFilter(e.target.value)} />
              <div className="tabs-pill">
                {["all","pending","approved","rejected"].map(t=>(
                  <button key={t} className={`tab-btn ${(statusFilter===t||(t==="all"&&!statusFilter))?"active":""}`} onClick={()=>setPage(t==="all"?"dashboard":t)} style={{textTransform:"capitalize"}}>{t}</button>
                ))}
              </div>
              {(search||dateFilter)&&<button className="btn-clear" onClick={()=>{setSearch("");setDateFilter("");}}>✕ Clear</button>}
            </div>
            {error && <div className="error-banner">⚠ {error}<button style={{marginLeft:"auto",background:"none",border:"none",color:"var(--red)",cursor:"pointer",fontWeight:600}} onClick={loadRequests}>Retry</button></div>}
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Check-in Requests</div>
                <div className="table-count">{loading?"Loading…":requests.length+" record"+(requests.length!==1?"s":"")}</div>
              </div>
              {loading ? <div className="loading-wrap"><Spinner /></div>
              : requests.length===0 ? (
                <div className="empty">
                  <div className="empty-icon">📭</div>
                  <div className="empty-title">No requests found</div>
                  <div className="empty-sub">Try adjusting your search or filter criteria</div>
                </div>
              ) : (
                <table>
                  <thead><tr>{["Request ID","Guest","Guests","Room","Check-in","Check-out","Room No.","Status","Action"].map(t=><th key={t}>{t}</th>)}</tr></thead>
                  <tbody>
                    {requests.map(r=>(
                      <tr key={r.request_id} onClick={()=>viewRequest(r)}>
                        <td><span className="req-id">{r.request_id}</span></td>
                        <td><div className="guest-name">{r.full_name}</div><div className="guest-mobile">{r.mobile}</div></td>
                        <td style={{textAlign:"center"}}>{r.num_guests}</td>
                        <td style={{textTransform:"capitalize"}}>{r.room_type}</td>
                        <td>{r.checkin_date}</td>
                        <td>{r.checkout_date}</td>
                        <td>{r.room_number?<span className="room-chip">🏠 {r.room_number}</span>:<span style={{color:"var(--muted)"}}>—</span>}</td>
                        <td><Badge status={r.status} /></td>
                        <td><button className="btn btn-outline btn-sm" onClick={e=>{e.stopPropagation();viewRequest(r);}}>View →</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
      {selected&&!detailLoad&&<DetailModal req={selected} members={selMembers} onClose={(refresh)=>{setSelected(null);if(refresh){loadRequests();loadStats();}}} onApprove={handleApprove} onReject={handleReject} />}
      {detailLoad&&<div className="overlay"><div className="loading-wrap"><Spinner /></div></div>}
    </>
  );
}
