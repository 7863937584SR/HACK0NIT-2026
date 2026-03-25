const MODULES = [
  { id: 'message', icon: '📩', name: 'Message Scanner', desc: 'SMS & WhatsApp', glow: 'rgba(59, 130, 246, 0.1)' },
  { id: 'url', icon: '🌐', name: 'URL Scanner', desc: 'Suspicious links', glow: 'rgba(6, 182, 212, 0.1)' },
  { id: 'upi', icon: '💳', name: 'UPI Checker', desc: 'UPI ID verify', glow: 'rgba(168, 85, 247, 0.1)' },
  { id: 'email', icon: '📧', name: 'Email Analyzer', desc: 'Email safety', glow: 'rgba(0, 255, 136, 0.1)' },
  { id: 'voice', icon: '🎙️', name: 'Voice Scan', desc: 'Speak to scan', glow: 'rgba(249, 115, 22, 0.1)' },
  { id: 'news', icon: '📰', name: 'Fake News', desc: 'Verify claims', glow: 'rgba(251, 191, 36, 0.1)' },
  { id: 'bankSms', icon: '🏦', name: 'Bank SMS', desc: 'Bank alerts', glow: 'rgba(59, 130, 246, 0.1)' },
  { id: 'deepfake', icon: '🎥', name: 'Deepfake', desc: 'Media check', glow: 'rgba(255, 51, 102, 0.1)' },
  { id: 'transaction', icon: '💸', name: 'Transaction', desc: 'Payment risk', glow: 'rgba(0, 255, 136, 0.1)' },
];

export default function ModuleGrid({ activeModule, onModuleSelect }) {
  return (
    <section className="modules-section">
      <div className="section-header">
        <h2 className="section-title">🧩 Scanner Modules</h2>
        <span className="section-subtitle">Tap a module to switch scanner mode</span>
      </div>
      <div className="module-grid">
        {MODULES.map((mod) => (
          <div 
            key={mod.id}
            className={`module-card ${activeModule === mod.id ? 'active' : ''}`}
            data-id={mod.id}
            onClick={() => onModuleSelect(mod.id === activeModule ? null : mod.id)}
          >
            <span className="module-icon">{mod.icon}</span>
            <div className="module-name">{mod.name}</div>
            <div className="module-desc">{mod.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
