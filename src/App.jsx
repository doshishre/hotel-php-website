import { useState, useEffect, useCallback, useRef } from "react";
import { submitCheckinRequest } from './api/checkin';

// ─── Utilities ───────────────────────────────────────────────────────────────

const validateAadhaar = (v = "") => /^\d{12}$/.test(v.replace(/\D/g, ""));
const validateMobile = (v = "") => /^[6-9]\d{9}$/.test(v.replace(/\D/g, ""));
const validateEmail = (v = "") => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const maskAadhaar = (v = "") => {
  const c = v.replace(/\D/g, "");
  if (!c) return "";
  if (c.length <= 4) return c;
  return "●●●● ●●●● " + c.slice(-4);
};

const HOTELS = {
  "hotel-demo-001": {
    name: "The Grand Rajputana Palace",
    address: "MI Road, Jaipur, Rajasthan 302001",
    contact: "+91-141-2345678",
    initials: "GR",
    accent: "#8B4513",
  },
  "hotel-demo-002": {
    name: "Seaside Retreat & Spa",
    address: "42 Marine Drive, Mumbai 400020",
    contact: "+91-22-9876543",
    initials: "SR",
    accent: "#1A6B8A",
  },
  default: {
    name: "Hotel Premier",
    address: "123 Main Street, New Delhi 110001",
    contact: "+91-11-1234567",
    initials: "HP",
    accent: "#2D6A4F",
  },
};

const today = () => new Date().toISOString().split("T")[0];
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #C9A84C;
    --gold-light: #F0D98C;
    --ink: #1C1410;
    --smoke: #F7F5F2;
    --mist: #EDE9E3;
    --steel: #6B6560;
    --error: #C0392B;
    --success: #27AE60;
    --white: #FFFFFF;
    --shadow: 0 2px 20px rgba(0,0,0,0.08);
    --shadow-lg: 0 8px 40px rgba(0,0,0,0.12);
    --radius: 16px;
    --radius-sm: 10px;
    --font-display: 'Cormorant Garamond', Georgia, serif;
    --font-body: 'DM Sans', sans-serif;
  }

  html { font-size: 16px; -webkit-text-size-adjust: 100%; }

  body {
    font-family: var(--font-body);
    background: var(--smoke);
    color: var(--ink);
    min-height: 100vh;
    line-height: 1.6;
  }

  .app {
    max-width: 680px;
    margin: 0 auto;
    padding: 0 0 80px;
  }

  /* ─ Hotel Header ─────────────────────── */
  .hotel-header {
    background: var(--white);
    border-bottom: 1px solid var(--mist);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  }

  .hotel-banner {
    padding: 20px 24px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .hotel-logo {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    color: var(--white);
    flex-shrink: 0;
    letter-spacing: 1px;
  }

  .hotel-info { flex: 1; min-width: 0; }

  .hotel-name {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hotel-address {
    font-size: 12px;
    color: var(--steel);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hotel-contact {
    font-size: 11px;
    color: var(--gold);
    margin-top: 2px;
  }

  .checkin-badge {
    background: var(--smoke);
    padding: 6px 24px;
    font-size: 11px;
    color: var(--steel);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
    border-top: 1px solid var(--mist);
  }

  /* ─ Progress Steps ─────────────────────── */
  .progress-bar {
    background: var(--white);
    padding: 16px 24px;
    border-bottom: 1px solid var(--mist);
  }

  .steps {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .step-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .step-item:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 14px;
    left: 50%;
    right: -50%;
    height: 2px;
    background: var(--mist);
    z-index: 0;
  }

  .step-item.done:not(:last-child)::after,
  .step-item.active:not(:last-child)::after {
    background: var(--gold);
  }

  .step-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--mist);
    border: 2px solid var(--mist);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--steel);
    z-index: 1;
    transition: all 0.3s;
  }

  .step-item.active .step-dot {
    background: var(--gold);
    border-color: var(--gold);
    color: var(--white);
  }

  .step-item.done .step-dot {
    background: var(--gold);
    border-color: var(--gold);
    color: var(--white);
  }

  .step-label {
    font-size: 10px;
    color: var(--steel);
    margin-top: 4px;
    text-align: center;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .step-item.active .step-label { color: var(--gold); }

  /* ─ Form Body ─────────────────────── */
  .form-body {
    padding: 24px 16px;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 4px;
  }

  .section-sub {
    font-size: 13px;
    color: var(--steel);
    margin-bottom: 24px;
  }

  /* ─ Cards ─────────────────────── */
  .card {
    background: var(--white);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: var(--shadow);
    border: 1px solid rgba(0,0,0,0.04);
  }

  .card-title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--gold);
    font-weight: 600;
    margin-bottom: 16px;
  }

  /* ─ Form Fields ─────────────────────── */
  .field {
    margin-bottom: 16px;
  }

  .field:last-child { margin-bottom: 0; }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--steel);
    margin-bottom: 6px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .req { color: var(--error); }

  input, select, textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid var(--mist);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 15px;
    color: var(--ink);
    background: var(--smoke);
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
  }

  input:focus, select:focus, textarea:focus {
    border-color: var(--gold);
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.15);
  }

  input.error, select.error {
    border-color: var(--error);
    background: #FFF5F5;
  }

  .error-msg {
    font-size: 11px;
    color: var(--error);
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .aadhaar-display {
    font-family: 'Courier New', monospace;
    font-size: 16px;
    letter-spacing: 0.1em;
    color: var(--steel);
    margin-top: 4px;
    padding: 8px 14px;
    background: var(--mist);
    border-radius: 8px;
    font-weight: 600;
  }

  select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B6560' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
    cursor: pointer;
  }

  /* ─ File Upload ─────────────────────── */
  .file-zone {
    border: 2px dashed var(--mist);
    border-radius: var(--radius-sm);
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--smoke);
    position: relative;
  }

  .file-zone:hover, .file-zone.drag { border-color: var(--gold); background: #FBF8F0; }

  .file-zone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    background: none;
  }

  .file-icon { font-size: 28px; margin-bottom: 6px; }

  .file-label {
    font-size: 13px;
    color: var(--steel);
    pointer-events: none;
  }

  .file-label strong { color: var(--gold); }

  .file-selected {
    font-size: 12px;
    color: var(--success);
    margin-top: 6px;
    font-weight: 500;
  }

  .file-error {
    font-size: 12px;
    color: var(--error);
    margin-top: 6px;
  }

  /* ─ Member Card ─────────────────────── */
  .member-card {
    background: var(--smoke);
    border: 1.5px solid var(--mist);
    border-radius: var(--radius-sm);
    padding: 16px;
    margin-bottom: 12px;
  }

  .member-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .member-num {
    font-size: 12px;
    font-weight: 700;
    color: var(--gold);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .btn-remove {
    background: none;
    border: none;
    color: var(--error);
    cursor: pointer;
    font-size: 13px;
    font-family: var(--font-body);
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 500;
    transition: background 0.2s;
  }
  .btn-remove:hover { background: #FFECEC; }

  /* ─ Buttons ─────────────────────── */
  .btn-primary {
    width: 100%;
    padding: 15px;
    background: var(--gold);
    color: var(--white);
    border: none;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-primary:hover:not(:disabled) { background: #B8953E; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(201,168,76,0.4); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-secondary {
    width: 100%;
    padding: 14px;
    background: var(--white);
    color: var(--ink);
    border: 1.5px solid var(--mist);
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary:hover { border-color: var(--gold); color: var(--gold); }

  .btn-add {
    width: 100%;
    padding: 12px;
    background: none;
    border: 1.5px dashed var(--gold);
    border-radius: var(--radius-sm);
    color: var(--gold);
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .btn-add:hover { background: #FBF8F0; }

  .btn-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 8px;
  }

  /* ─ Review Section ─────────────────────── */
  .review-block {
    background: var(--white);
    border-radius: var(--radius-sm);
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: var(--shadow);
  }

  .review-heading {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--gold);
    font-weight: 700;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--mist);
  }

  .review-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 13px;
    padding: 4px 0;
  }

  .review-key { color: var(--steel); min-width: 120px; }

  .review-val {
    color: var(--ink);
    font-weight: 500;
    text-align: right;
    flex: 1;
  }

  /* ─ Success Screen ─────────────────────── */
  .success-screen {
    padding: 40px 24px;
    text-align: center;
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .success-icon {
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, var(--gold), #E8C65A);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin: 0 auto 24px;
    box-shadow: 0 8px 24px rgba(201,168,76,0.35);
  }

  .success-title {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 12px;
    line-height: 1.2;
  }

  .success-msg {
    font-size: 15px;
    color: var(--steel);
    max-width: 300px;
    margin: 0 auto 24px;
    line-height: 1.7;
  }

  .request-id-box {
    background: var(--white);
    border: 1.5px solid var(--mist);
    border-radius: var(--radius-sm);
    padding: 14px 24px;
    display: inline-block;
    margin-bottom: 32px;
  }

  .request-id-label { font-size: 11px; color: var(--steel); text-transform: uppercase; letter-spacing: 0.08em; }

  .request-id-val {
    font-family: 'Courier New', monospace;
    font-size: 20px;
    font-weight: 700;
    color: var(--gold);
    margin-top: 2px;
    letter-spacing: 0.08em;
  }

  /* ─ Skeleton ─────────────────────── */
  .skeleton {
    background: linear-gradient(90deg, var(--mist) 25%, #E8E4DC 50%, var(--mist) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ─ Navigation ─────────────────────── */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--white);
    border-top: 1px solid var(--mist);
    padding: 12px 16px;
    max-width: 680px;
    margin: 0 auto;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  }

  .hint-text {
    font-size: 11px;
    color: var(--steel);
    text-align: center;
    margin-top: 10px;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 480px) {
    .field-row { grid-template-columns: 1fr; }
    .hotel-name { font-size: 17px; }
    .section-title { font-size: 21px; }
    .bottom-nav { left: 0; right: 0; transform: none; }
  }
`;

// ─── Sub-components ──────────────────────────────────────────────────────────

function HotelHeader({ hotel, loading }) {
  if (loading) {
    return (
      <div className="hotel-header">
        <div className="hotel-banner">
          <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 18, width: "70%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 12, width: "50%" }} />
          </div>
        </div>
        <div className="checkin-badge">Loading hotel information…</div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="hotel-header">
        <div className="hotel-banner" style={{ justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "var(--error)", padding: "8px 0" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontWeight: 600 }}>Invalid QR Code or Hotel not found</div>
            <div style={{ fontSize: 13, color: "var(--steel)", marginTop: 4 }}>Please scan a valid hotel QR code.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-header">
      <div className="hotel-banner">
        <div className="hotel-logo" style={{ background: `linear-gradient(135deg, ${hotel.accent}, ${hotel.accent}CC)` }}>
          {hotel.initials}
        </div>
        <div className="hotel-info">
          <div className="hotel-name">{hotel.name}</div>
          <div className="hotel-address">📍 {hotel.address}</div>
          {hotel.contact && <div className="hotel-contact">📞 {hotel.contact}</div>}
        </div>
      </div>
      <div className="checkin-badge">✦ Guest Self Check-in Portal</div>
    </div>
  );
}

function StepProgress({ current }) {
  const steps = ["Guest Info", "Stay Details", "Members", "Review"];
  return (
    <div className="progress-bar">
      <div className="steps">
        {steps.map((label, i) => (
          <div key={i} className={`step-item ${i < current ? "done" : i === current ? "active" : ""}`}>
            <div className="step-dot">{i < current ? "✓" : i + 1}</div>
            <div className="step-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FileUpload({ label, name, onChange, accept = ".jpg,.jpeg,.png,.pdf", optional = false }) {
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);

  const handle = (f) => {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { setErr("File must be under 2MB"); return; }
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(f.type)) { setErr("Only JPG, PNG, PDF allowed"); return; }
    setErr("");
    setFile(f);
    onChange(f);
  };

  return (
    <div className="field">
      <label>{label} {optional && <span style={{ color: "var(--steel)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span>}</label>
      <div className={`file-zone ${drag ? "drag" : ""}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      >
        <input type="file" accept={accept} onChange={e => handle(e.target.files[0])} />
        <div className="file-icon">{file ? "📎" : "📁"}</div>
        {file
          ? <div className="file-selected">✓ {file.name}</div>
          : <div className="file-label">Drop file or <strong>browse</strong><br /><span style={{ fontSize: 11, opacity: 0.7 }}>JPG, PNG, PDF · max 2MB</span></div>
        }
      </div>
      {err && <div className="file-error">⚠ {err}</div>}
    </div>
  );
}

function AadhaarField({ value, onChange, error, label = "Aadhaar Number" }) {
  const [raw, setRaw] = useState(value || "");
  const [focused, setFocused] = useState(false);

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
    setRaw(digits);
    onChange(digits);
  };

  return (
    <div className="field">
      <label>{label} <span className="req">*</span></label>
      <input
        type={focused ? "text" : "password"}
        inputMode="numeric"
        value={focused ? raw : raw}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Enter 12-digit Aadhaar"
        maxLength={12}
        className={error ? "error" : ""}
        autoComplete="off"
      />
      {raw.length > 0 && !focused && (
        <div className="aadhaar-display">{maskAadhaar(raw)}</div>
      )}
      {error && <div className="error-msg">⚠ {error}</div>}
      {!error && <div style={{ fontSize: 11, color: "var(--steel)", marginTop: 4 }}>🔒 Encrypted before transmission</div>}
    </div>
  );
}

// ─── Step 1: Guest Info ──────────────────────────────────────────────────────

function Step1({ data, onChange, errors }) {
  return (
    <div>
      <div className="section-title">Guest Information</div>
      <div className="section-sub">Please enter your personal details</div>

      <div className="card">
        <div className="card-title">Primary Guest</div>

        <div className="field">
          <label>Full Name <span className="req">*</span></label>
          <input
            type="text"
            value={data.fullName}
            onChange={e => onChange("fullName", e.target.value)}
            placeholder="As on Aadhaar card"
            className={errors.fullName ? "error" : ""}
          />
          {errors.fullName && <div className="error-msg">⚠ {errors.fullName}</div>}
        </div>

        <div className="field">
          <label>Mobile Number <span className="req">*</span></label>
          <input
            type="tel"
            inputMode="numeric"
            value={data.mobile}
            onChange={e => onChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile number"
            className={errors.mobile ? "error" : ""}
          />
          {errors.mobile && <div className="error-msg">⚠ {errors.mobile}</div>}
        </div>

        <div className="field">
          <label>Email Address <span style={{ color: "var(--steel)", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 11 }}>— optional</span></label>
          <input
            type="email"
            value={data.email}
            onChange={e => onChange("email", e.target.value)}
            placeholder="your@email.com"
            className={errors.email ? "error" : ""}
          />
          {errors.email && <div className="error-msg">⚠ {errors.email}</div>}
        </div>

        <AadhaarField
          value={data.aadhaar}
          onChange={v => onChange("aadhaar", v)}
          error={errors.aadhaar}
        />
      </div>

      <div className="card">
        <div className="card-title">Documents</div>
        <FileUpload
          label="ID Proof"
          name="idProof"
          onChange={f => onChange("idProof", f)}
        />
        <FileUpload
          label="Your Photo"
          name="photo"
          onChange={f => onChange("photo", f)}
          optional
        />
      </div>
    </div>
  );
}

// ─── Step 2: Stay Details ────────────────────────────────────────────────────

function Step2({ data, onChange, errors }) {
  return (
    <div>
      <div className="section-title">Stay Details</div>
      <div className="section-sub">Tell us about your visit</div>

      <div className="card">
        <div className="card-title">Accommodation</div>

        <div className="field-row">
          <div className="field">
            <label>Guests <span className="req">*</span></label>
            <select value={data.numGuests} onChange={e => onChange("numGuests", +e.target.value)}>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? "Guest" : "Guests"}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Room Type <span className="req">*</span></label>
            <select value={data.roomType} onChange={e => onChange("roomType", e.target.value)}>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Check-in Date <span className="req">*</span></label>
            <input
              type="date"
              value={data.checkinDate}
              min={today()}
              onChange={e => onChange("checkinDate", e.target.value)}
              className={errors.checkinDate ? "error" : ""}
            />
            {errors.checkinDate && <div className="error-msg">⚠ {errors.checkinDate}</div>}
          </div>
          <div className="field">
            <label>Check-out Date <span className="req">*</span></label>
            <input
              type="date"
              value={data.checkoutDate}
              min={data.checkinDate || tomorrow()}
              onChange={e => onChange("checkoutDate", e.target.value)}
              className={errors.checkoutDate ? "error" : ""}
            />
            {errors.checkoutDate && <div className="error-msg">⚠ {errors.checkoutDate}</div>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Travel Information</div>

        <div className="field">
          <label>Travelling From</label>
          <input
            type="text"
            value={data.travelFrom}
            onChange={e => onChange("travelFrom", e.target.value)}
            placeholder="City, State"
          />
        </div>

        <div className="field">
          <label>Mode of Travel</label>
          <select value={data.travelMethod} onChange={e => onChange("travelMethod", e.target.value)}>
            <option value="car">🚗 Car</option>
            <option value="train">🚂 Train</option>
            <option value="flight">✈️ Flight</option>
            <option value="other">🛺 Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Members ─────────────────────────────────────────────────────────

function Step3({ numGuests, members, onChange }) {
  const required = numGuests - 1; // primary guest is step 1

  const addMember = () => {
    if (members.length >= 9) return;
    onChange([...members, { fullName: "", aadhaar: "", age: "", gender: "", photo: null }]);
  };

  const removeMember = (i) => {
    onChange(members.filter((_, idx) => idx !== i));
  };

  const updateMember = (i, field, val) => {
    const updated = [...members];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };

  if (numGuests <= 1) {
    return (
      <div>
        <div className="section-title">Additional Members</div>
        <div className="section-sub">You selected 1 guest — no additional members needed.</div>
        <div className="card" style={{ textAlign: "center", padding: "32px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
          <div style={{ color: "var(--steel)", fontSize: 14 }}>Solo traveller — you're all set!</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-title">Additional Members</div>
      <div className="section-sub">
        {required} more guest{required > 1 ? "s" : ""} required based on your selection
      </div>

      {members.map((m, i) => (
        <div key={i} className="card">
          <div className="member-header">
            <div className="member-num">Guest {i + 2}</div>
            <button className="btn-remove" onClick={() => removeMember(i)}>Remove</button>
          </div>

          <div className="field">
            <label>Full Name <span className="req">*</span></label>
            <input
              type="text"
              value={m.fullName}
              onChange={e => updateMember(i, "fullName", e.target.value)}
              placeholder="As on Aadhaar"
            />
          </div>

          <AadhaarField
            value={m.aadhaar}
            onChange={v => updateMember(i, "aadhaar", v)}
            label={`Aadhaar — Guest ${i + 2}`}
          />

          <div className="field-row">
            <div className="field">
              <label>Age</label>
              <input
                type="number"
                inputMode="numeric"
                value={m.age}
                onChange={e => updateMember(i, "age", e.target.value)}
                placeholder="Age"
                min="0"
                max="120"
              />
            </div>
            <div className="field">
              <label>Gender</label>
              <select value={m.gender} onChange={e => updateMember(i, "gender", e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <FileUpload
            label={`Photo — Guest ${i + 2}`}
            name={`member_${i}_photo`}
            onChange={f => updateMember(i, "photo", f)}
            optional
          />
        </div>
      ))}

      {members.length < numGuests - 1 && (
        <button className="btn-add" onClick={addMember}>
          + Add Guest {members.length + 2}
        </button>
      )}

      {members.length < required && (
        <div style={{ fontSize: 12, color: "var(--error)", textAlign: "center", marginTop: 8 }}>
          ⚠ {required - members.length} more guest{required - members.length > 1 ? "s" : ""} still required
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Review ──────────────────────────────────────────────────────────

function Step4({ guest, stay, members, hotel }) {
  const roomLabels = { standard: "Standard", deluxe: "Deluxe", suite: "Suite" };
  const travelLabels = { car: "Car 🚗", train: "Train 🚂", flight: "Flight ✈️", other: "Other 🛺" };

  return (
    <div>
      <div className="section-title">Review & Submit</div>
      <div className="section-sub">Please confirm your details before submitting</div>

      <div className="review-block">
        <div className="review-heading">Hotel</div>
        <div className="review-row">
          <div className="review-key">Property</div>
          <div className="review-val">{hotel?.name}</div>
        </div>
      </div>

      <div className="review-block">
        <div className="review-heading">Primary Guest</div>
        {[
          ["Name", guest.fullName],
          ["Mobile", guest.mobile],
          ["Email", guest.email || "—"],
          ["Aadhaar", maskAadhaar(guest.aadhaar)],
        ].map(([k, v]) => (
          <div className="review-row" key={k}>
            <div className="review-key">{k}</div>
            <div className="review-val" style={{ fontFamily: k === "Aadhaar" ? "monospace" : "inherit" }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="review-block">
        <div className="review-heading">Stay Details</div>
        {[
          ["Room Type", roomLabels[stay.roomType]],
          ["No. of Guests", stay.numGuests],
          ["Check-in", stay.checkinDate],
          ["Check-out", stay.checkoutDate],
          ["Travel From", stay.travelFrom || "—"],
          ["Travel Mode", travelLabels[stay.travelMethod] || "—"],
        ].map(([k, v]) => (
          <div className="review-row" key={k}>
            <div className="review-key">{k}</div>
            <div className="review-val">{v}</div>
          </div>
        ))}
      </div>

      {members.length > 0 && (
        <div className="review-block">
          <div className="review-heading">Additional Members ({members.length})</div>
          {members.map((m, i) => (
            <div key={i} style={{ marginBottom: i < members.length - 1 ? 12 : 0, paddingBottom: i < members.length - 1 ? 12 : 0, borderBottom: i < members.length - 1 ? "1px solid var(--mist)" : "none" }}>
              <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700, marginBottom: 6 }}>GUEST {i + 2}</div>
              <div className="review-row">
                <div className="review-key">Name</div>
                <div className="review-val">{m.fullName || "—"}</div>
              </div>
              <div className="review-row">
                <div className="review-key">Aadhaar</div>
                <div className="review-val" style={{ fontFamily: "monospace" }}>{maskAadhaar(m.aadhaar)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "#FBF8F0", border: "1px solid #E8D9A0", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: 12, color: "#7A6520", lineHeight: 1.6 }}>
        🔒 Your Aadhaar details are encrypted before transmission and never stored in plain text. By submitting, you consent to sharing your details with the hotel for check-in purposes.
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function HotelCheckin() {
  // Simulate hotelId from URL
  const hotelId = "hotel-demo-001";

  const [hotel, setHotel] = useState(null);
  const [hotelLoading, setHotelLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const [guest, setGuest] = useState({ fullName: "", mobile: "", email: "", aadhaar: "", idProof: null, photo: null });
  const [stay, setStay] = useState({ numGuests: 1, roomType: "standard", checkinDate: today(), checkoutDate: tomorrow(), travelFrom: "", travelMethod: "car" });
  const [members, setMembers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setHotelLoading(true);
    setTimeout(() => {
      setHotel(HOTELS[hotelId] || HOTELS.default);
      setHotelLoading(false);
    }, 900);
  }, [hotelId]);

  const updateGuest = (k, v) => setGuest(g => ({ ...g, [k]: v }));
  const updateStay  = (k, v) => {
    setStay(s => ({ ...s, [k]: v }));
    if (k === "numGuests") setMembers([]);
  };

  const validateStep = () => {
    const errs = {};

    if (step === 0) {
      if (!guest.fullName.trim()) errs.fullName = "Full name is required";
      if (!validateMobile(guest.mobile)) errs.mobile = "Enter a valid 10-digit Indian mobile number";
      if (!validateEmail(guest.email)) errs.email = "Enter a valid email";
      if (!validateAadhaar(guest.aadhaar)) errs.aadhaar = "Aadhaar must be exactly 12 digits";
    }

    if (step === 1) {
      if (!stay.checkinDate) errs.checkinDate = "Check-in date required";
      if (!stay.checkoutDate) errs.checkoutDate = "Check-out date required";
      if (stay.checkoutDate && stay.checkinDate && stay.checkoutDate <= stay.checkinDate)
        errs.checkoutDate = "Check-out must be after check-in";
    }

    if (step === 2) {
      const required = stay.numGuests - 1;
      if (members.length < required) {
        errs.members = `Add ${required - members.length} more member(s)`;
      }
      members.forEach((m, i) => {
        if (!m.fullName.trim()) errs[`m${i}_name`] = "Name required";
        if (!validateAadhaar(m.aadhaar)) errs[`m${i}_aadhaar`] = "Valid Aadhaar required";
      });
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const back = () => {
    setErrors({});
    setStep(s => s - 1);
  };

const submit = async () => {
    if (!validateStep()) return;   // ← correct name
    setSubmitting(true);
    try {
      const payload = {
        hotelId: hotelId,
        primaryGuest: {
          fullName: guest.fullName,
          mobile:   guest.mobile,
          email:    guest.email,
          aadhaar:  guest.aadhaar,
        },
        stayDetails: {
          numGuests:    stay.numGuests,
          roomType:     stay.roomType,
          checkinDate:  stay.checkinDate,
          checkoutDate: stay.checkoutDate,
          travelFrom:   stay.travelFrom,
          travelMethod: stay.travelMethod,
        },
        members: members.map(m => ({
          fullName: m.fullName,
          aadhaar:  m.aadhaar,
          age:      m.age,
          gender:   m.gender,
        })),
      };

      const result = await submitCheckinRequest(payload);
      setSubmitted({ requestId: result.requestId });

    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
};

  if (submitted) {
    return (
      <>
        <style>{css}</style>
        <div className="app">
          <HotelHeader hotel={hotel} loading={false} />
          <div className="success-screen">
            <div className="success-icon">✓</div>
            <div className="success-title">Request Submitted!</div>
            <div className="success-msg">
              Your check-in request has been submitted successfully. Please wait for hotel approval.
            </div>
            <div className="request-id-box">
              <div className="request-id-label">Your Request ID</div>
              <div className="request-id-val">{submitted.requestId}</div>
            </div>
            <div style={{ fontSize: 13, color: "var(--steel)", maxWidth: 280, lineHeight: 1.7 }}>
              Please show this ID to the front desk upon arrival. You may receive an SMS/email once approved.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <HotelHeader hotel={hotel} loading={hotelLoading} />

        {!hotelLoading && hotel && (
          <>
            <StepProgress current={step} />

            <div className="form-body">
              {step === 0 && <Step1 data={guest} onChange={updateGuest} errors={errors} />}
              {step === 1 && <Step2 data={stay} onChange={updateStay} errors={errors} />}
              {step === 2 && <Step3 numGuests={stay.numGuests} members={members} onChange={setMembers} />}
              {step === 3 && <Step4 guest={guest} stay={stay} members={members} hotel={hotel} />}
            </div>

            <div className="bottom-nav">
              {Object.keys(errors).length > 0 && (
                <div style={{ fontSize: 12, color: "var(--error)", marginBottom: 8, textAlign: "center" }}>
                  ⚠ Please fix the errors above before continuing
                </div>
              )}

              {step < 3 ? (
                <div className={`btn-row ${step === 0 ? "" : ""}`}>
                  {step > 0 && (
                    <button className="btn-secondary" onClick={back}>← Back</button>
                  )}
                  <button
                    className="btn-primary"
                    style={{ gridColumn: step === 0 ? "1 / -1" : "auto" }}
                    onClick={next}
                  >
                    Continue →
                  </button>
                </div>
              ) : (
                <div className="btn-row">
                  <button className="btn-secondary" onClick={back}>← Back</button>
                  <button className="btn-primary" onClick={submit} disabled={submitting}>
                    {submitting ? <><div className="spinner" /> Submitting…</> : "Submit Request ✓"}
                  </button>
                </div>
              )}

              <div className="hint-text">
                Step {step + 1} of 4 · {["Guest Info", "Stay Details", "Members", "Review"][step]}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
