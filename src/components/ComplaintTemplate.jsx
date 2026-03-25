import { useState } from 'react';

const FRAUD_TYPES = [
  { id: 'upi', label: 'UPI / Payment Fraud', icon: '💳' },
  { id: 'otp', label: 'OTP / Banking Fraud', icon: '🏦' },
  { id: 'job', label: 'Fake Job Offer', icon: '💼' },
  { id: 'investment', label: 'Investment / Trading Scam', icon: '📈' },
  { id: 'lottery', label: 'Lottery / Prize Scam', icon: '🎁' },
  { id: 'loan', label: 'Loan / Credit Fraud', icon: '💰' },
  { id: 'romance', label: 'Romance / Social Media Scam', icon: '❤️' },
  { id: 'impersonation', label: 'Government / Bank Impersonation', icon: '🏛️' },
  { id: 'deepfake', label: 'Deepfake / AI Fraud', icon: '🎥' },
  { id: 'ecommerce', label: 'E-commerce / Delivery Scam', icon: '📦' },
  { id: 'other', label: 'Other Cyber Crime', icon: '🚨' },
];

const REPORTING_LINKS = {
  upi: [
    { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', note: 'File official FIR-level complaint' },
    { label: 'NPCI UPI Dispute', url: 'https://www.npci.org.in/what-we-do/upi/dispute-redressal-mechanism', note: 'Raise UPI transaction dispute' },
    { label: 'RBI Complaint', url: 'https://cms.rbi.org.in', note: 'Escalate to RBI Banking Ombudsman' },
  ],
  otp: [
    { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', note: 'File FIR for banking fraud' },
    { label: 'RBI Ombudsman', url: 'https://cms.rbi.org.in', note: 'Banking fraud complaint to RBI' },
    { label: 'Your Bank Helpline', url: 'https://www.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=2009', note: 'Call your bank immediately to freeze account' },
  ],
  job: [
    { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', note: 'File complaint for job fraud' },
    { label: 'Ministry of Labour Portal', url: 'https://labour.gov.in', note: 'Report fake job offers' },
    { label: 'TRAI DND', url: 'https://trai.gov.in/consumers/do-not-disturb', note: 'Block spam calls/SMS' },
  ],
  investment: [
    { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', note: 'File FIR for investment fraud' },
    { label: 'SEBI SCORES', url: 'https://scores.sebi.gov.in', note: 'Report fake trading/investment schemes' },
    { label: 'RBI Complaint', url: 'https://cms.rbi.org.in', note: 'Report illegal forex/crypto scams' },
  ],
  lottery: [
    { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', note: 'File complaint for lottery fraud' },
  ],
  loan: [
    { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', note: 'File complaint for loan fraud' },
    { label: 'RBI Complaint', url: 'https://cms.rbi.org.in', note: 'Report illegal lending apps' },
  ],
  romance: [
    { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', note: 'Report romance/social media scam' },
  ],
  impersonation: [
    { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', note: 'Report impersonation fraud' },
    { label: 'RBI Ombudsman', url: 'https://cms.rbi.org.in', note: 'If impersonating bank/RBI' },
  ],
  deepfake: [
    { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', note: 'Report AI/deepfake harassment' },
    { label: 'IT Act Section 66C/66D', url: 'https://cybercrime.gov.in', note: 'Identity theft via deepfake' },
  ],
  ecommerce: [
    { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', note: 'Report e-commerce fraud' },
    { label: 'Consumer Forum', url: 'https://consumerhelpline.gov.in', note: 'National Consumer Helpline — 1800-11-4000' },
  ],
  other: [
    { label: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in', note: 'All types of cyber crime' },
    { label: 'Call 1930 (24×7)', url: 'tel:1930', note: 'National Cyber Crime Helpline — immediate help' },
  ],
};

function generateTemplate(data) {
  const { name, date, amount, platform, fraudType, description, scammerDetails } = data;
  const typeLabel = FRAUD_TYPES.find(f => f.id === fraudType)?.label || 'Cyber Fraud';
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return `TO,
The Cyber Crime Officer,
National Cyber Crime Reporting Portal / Local Police Station

SUBJECT: Complaint regarding ${typeLabel} — Request for FIR Registration

Respected Sir/Madam,

I, ${name || '[Your Full Name]'}, am writing to formally report an incident of ${typeLabel} that I became a victim of${date ? ` on ${date}` : ''}.

INCIDENT DETAILS:
─────────────────
• Type of Fraud    : ${typeLabel}
• Date of Incident : ${date || '[Date of Incident]'}
• Platform Used    : ${platform || '[Platform/App/Website used by scammer]'}
• Amount Lost      : ${amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '[Amount in ₹]'}

DESCRIPTION OF INCIDENT:
─────────────────────────
${description || '[Provide full description: how you were contacted, what was promised, how money was transferred, etc.]'}

SCAMMER'S DETAILS (if available):
───────────────────────────────────
${scammerDetails || '[Phone number / UPI ID / Email / Username / Account number used by fraudster]'}

RELIEF REQUESTED:
─────────────────
1. Register this complaint as an FIR under relevant sections of IT Act 2000 and IPC.
2. Trace and recover the fraudulently transferred amount of ${amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '[amount]'}.
3. Investigate and take appropriate legal action against the accused.
4. Freeze the bank account / UPI ID used by the fraudster.

DOCUMENTS ENCLOSED:
────────────────────
□ Screenshot(s) of the fraudulent message/communication
□ Bank statement / UPI transaction proof
□ Any other evidence (call recordings, email threads, etc.)

I hereby declare that the information provided above is true and correct to the best of my knowledge.

Yours sincerely,
${name || '[Your Full Name]'}
Date: ${today}
Contact: [Your Phone Number]
Address: [Your Full Address]

─────────────────────────────────────────
IMPORTANT: IMMEDIATELY CALL 1930 (Cyber Crime Helpline, available 24×7)
File online FIR at: https://cybercrime.gov.in
─────────────────────────────────────────`;
}

export default function ComplaintTemplate({ user }) {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '', date: '', amount: '', platform: '',
    fraudType: '', description: '', scammerDetails: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const template = formData.fraudType ? generateTemplate(formData) : '';
  const links = REPORTING_LINKS[formData.fraudType] || REPORTING_LINKS.other;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(template).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const saveComplaintToDb = async () => {
    if (!user || user.isGuest) return;
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:3001/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        })
      });
      if (res.ok) {
        setSavedStatus('success');
      } else {
        setSavedStatus('error');
      }
    } catch {
      setSavedStatus('error');
    }
    setIsSaving(false);
  };

  return (
    <div className="complaint-section animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">📋 Fraud Complaint Generator</h2>
        <span className="section-subtitle">For victims — create FIR-ready complaint</span>
      </div>

      {/* Warning banner */}
      <div className="complaint-warning">
        <span style={{ fontSize: '20px' }}>🚨</span>
        <div>
          <strong>If you were just scammed — call 1930 immediately (24×7)</strong>
          <div style={{ fontSize: '12px', marginTop: '2px', opacity: 0.8 }}>
            Early reporting increases chances of money recovery. Then file online at cybercrime.gov.in
          </div>
        </div>
        <a href="tel:1930" className="call-btn">📞 Call 1930</a>
      </div>

      {/* Step 1 — Fraud Type */}
      {step === 1 && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Select the type of fraud you experienced:
          </p>
          <div className="fraud-type-grid">
            {FRAUD_TYPES.map(type => (
              <button
                key={type.id}
                className={`fraud-type-btn ${formData.fraudType === type.id ? 'active' : ''}`}
                onClick={() => { setFormData(p => ({ ...p, fraudType: type.id })); setStep(2); }}
              >
                <span style={{ fontSize: '22px' }}>{type.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Fill Details */}
      {step === 2 && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <button
              onClick={() => setStep(1)}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '5px 12px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
            >
              ← Back
            </button>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              {FRAUD_TYPES.find(f => f.id === formData.fraudType)?.icon}{' '}
              {FRAUD_TYPES.find(f => f.id === formData.fraudType)?.label}
            </span>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Your Full Name</label>
              <input className="form-input" name="name" placeholder="e.g., Rajesh Kumar" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Incident</label>
              <input className="form-input" type="date" name="date" value={formData.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Amount Lost (₹)</label>
              <input className="form-input" type="number" name="amount" placeholder="e.g., 25000" value={formData.amount} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Platform / App Used</label>
              <input className="form-input" name="platform" placeholder="e.g., WhatsApp, GPay, Instagram" value={formData.platform} onChange={handleChange} />
            </div>
            <div className="form-group full">
              <label className="form-label">Scammer's Details (phone / UPI / account)</label>
              <input className="form-input" name="scammerDetails" placeholder="e.g., 9876543210, xyz@paytm, or Bank Account No." value={formData.scammerDetails} onChange={handleChange} />
            </div>
            <div className="form-group full">
              <label className="form-label">Describe what happened</label>
              <textarea
                className="form-input"
                name="description"
                rows={4}
                placeholder="Explain how you were contacted, what was promised, how money was transferred, what happened after..."
                value={formData.description}
                onChange={handleChange}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <button
            className="scan-btn"
            style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
            onClick={() => setStep(3)}
          >
            Generate Complaint Template ⚡
          </button>
        </div>
      )}

      {/* Step 3 — Generated Template + Links */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setStep(2)}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '8px 14px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}
            >
              ← Edit Details
            </button>
            <button
              onClick={copyToClipboard}
              className="scan-btn"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {copied ? '✅ Copied!' : '📋 Copy Complaint Template'}
            </button>
          </div>
          
          {user && !user.isGuest && (
            <button
              onClick={saveComplaintToDb}
              disabled={isSaving || savedStatus === 'success'}
              style={{ 
                background: savedStatus === 'success' ? 'var(--green-dim)' : 'var(--bg-3)', 
                border: `1px solid ${savedStatus === 'success' ? 'var(--green)' : 'var(--blue)'}`, 
                borderRadius: 'var(--r-sm)', padding: '10px 14px', 
                color: savedStatus === 'success' ? 'var(--green)' : 'var(--blue)', 
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                transition: 'all 0.2s', width: '100%'
              }}
            >
              {isSaving ? 'Saving...' : savedStatus === 'success' ? '✅ Saved securely to your account' : '💾 Save Record to Dashboard'}
            </button>
          )}

          {/* Template preview */}
          <div className="glass-card" style={{ padding: '0' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                📄 Complaint Template (FIR-ready)
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Edit fields and re-generate if needed</span>
            </div>
            <pre
              style={{
                padding: '20px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '400px',
                overflowY: 'auto',
                background: 'transparent',
                border: 'none',
                margin: 0,
              }}
            >
              {template}
            </pre>
          </div>

          {/* Official reporting links */}
          <div className="glass-card" style={{ padding: '18px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
              🔗 Official Reporting Portals for {FRAUD_TYPES.find(f => f.id === formData.fraudType)?.label}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="report-link-card"
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{link.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{link.note}</div>
                  </div>
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>→</span>
                </a>
              ))}
              {/* Always show the main helpline */}
              {formData.fraudType !== 'other' && (
                <a href="tel:1930" className="report-link-card" style={{ borderColor: 'rgba(244,63,94,0.25)', background: 'var(--red-dim)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--red)' }}>📞 Call 1930 — Cyber Crime Helpline</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Available 24×7 — Call FIRST for fund recovery</div>
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--red)' }}>→</span>
                </a>
              )}
            </div>
          </div>

          {/* Steps after filing */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              ✅ What to do after filing complaint
            </p>
            {[
              'Keep the complaint/acknowledgment number for follow-up',
              'Note down the police station FIR number if assigned',
              'Continue to follow up every 7 days if no action taken',
              'Contact your bank to reverse/freeze the fraudulent transaction',
              'Preserve all evidence: screenshots, call records, transaction IDs',
              'Do NOT pay any "recovery agent" — that is another scam',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>{i+1}.</span>
                {step}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
