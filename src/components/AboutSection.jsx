export default function AboutSection() {
  return (
    <div className="about-section animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">🛡️ About Digital Bandhu</h2>
      </div>

      {/* How it works */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
          🧠 How Sentinel AI Works
        </h3>
        <div className="how-it-works-grid">
          {[
            { step: '1', icon: '📥', title: 'Input', desc: 'Paste any message, URL, UPI ID, email — or speak using voice input' },
            { step: '2', icon: '🔍', title: 'Auto-Detect', desc: 'AI auto-detects input type and routes to the right scanner module' },
            { step: '3', icon: '🧠', title: 'Multi-Layer Analysis', desc: 'Keyword detection, regex patterns, behavioral signals, combo analysis' },
            { step: '4', icon: '📊', title: 'Risk Score', desc: 'Generates a 0-99 fraud risk score with color-coded severity level' },
            { step: '5', icon: '💡', title: 'Explainable AI', desc: 'Shows exactly WHY something is risky with detailed signal breakdown' },
            { step: '6', icon: '🚨', title: 'Action Advice', desc: 'Provides clear, actionable safety advice specific to the threat type' },
          ].map((item, i) => (
            <div key={i} className="how-step">
              <div className="how-step-number">{item.step}</div>
              <div className="how-step-icon">{item.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
          ⚡ Key Features
        </h3>
        <div className="features-grid">
          {[
            { icon: '🔒', title: 'Offline-First', desc: '100% client-side processing. No data leaves your device.' },
            { icon: '🎤', title: 'Voice Input', desc: 'Speak in English or Hindi to scan suspicious messages.' },
            { icon: '🧩', title: '9 Scanner Modules', desc: 'SMS, URL, UPI, Email, Voice, News, Bank SMS, Deepfake, Transaction.' },
            { icon: '🔍', title: 'Explainable AI', desc: 'Every score comes with detailed reasons — no black box.' },
            { icon: '🇮🇳', title: 'India-Focused', desc: 'Trained on Indian scam patterns: UPI, SBI, KYC, Aadhaar, PAN.' },
            { icon: '⚡', title: 'Instant Analysis', desc: 'Real-time scoring with combo signal detection and behavioral analysis.' },
          ].map((feat, i) => (
            <div key={i} style={{ 
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              padding: '12px', background: 'rgba(255,255,255,0.02)',
              borderRadius: 'var(--radius-md)'
            }}>
              <span style={{ fontSize: '22px', flexShrink: 0 }}>{feat.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{feat.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{feat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
          🔌 Integration Options
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { icon: '💬', title: 'WhatsApp Bot', desc: 'Forward suspicious messages to our WhatsApp bot for instant analysis. Coming soon!', status: '🔜 Coming Soon' },
            { icon: '🧩', title: 'Chrome Extension', desc: 'Auto-scan URLs and emails directly in your browser. Coming soon!', status: '🔜 Coming Soon' },
            { icon: '📱', title: 'Mobile App', desc: 'Native Android app with notification scanning. Coming soon!', status: '🔜 Coming Soon' },
            { icon: '🌐', title: 'Web App', desc: 'Full-featured web application — you are using it now!', status: '✅ Active' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px', background: 'rgba(255,255,255,0.02)',
              borderRadius: 'var(--radius-md)', gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </div>
              <span style={{ 
                fontSize: '11px', fontWeight: 600, flexShrink: 0,
                color: item.status.includes('Active') ? 'var(--neon-green)' : 'var(--text-muted)'
              }}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Team / Credits */}
      <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
          🛡️ Digital Bandhu — Sentinel AI v2.0
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Built for India 🇮🇳 • Protecting citizens from digital fraud<br/>
          "Not just detection — it's explainable AI for citizens"
        </p>
      </div>
    </div>
  );
}
