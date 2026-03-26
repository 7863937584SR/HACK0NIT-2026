import { useState, useEffect } from 'react';
import { getModuleName } from '../engine/fraudEngine';
import audioAlerts from '../engine/audioAlerts';

export default function ResultCard({ result, onClose, onReportFraud }) {
  const [showReasons, setShowReasons] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [muted, setMuted] = useState(() => localStorage.getItem('db-mute') === 'true');

  const levelClass = result.level.toLowerCase();
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Animate score ring 
  useEffect(() => {
    let current = 0;
    const target = result.score;
    const step = Math.max(target / 50, 0.5);
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      setAnimatedScore(Math.round(current));
    }, 20);
    return () => clearInterval(interval);
  }, [result.score]);

  // Play audio alert when result appears
  useEffect(() => {
    if (!muted) {
      // Small delay so the animation starts first
      const t = setTimeout(() => audioAlerts.playForLevel(result.level), 400);
      return () => clearTimeout(t);
    }
  }, [result.level, muted]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    audioAlerts.setEnabled(!next);
    localStorage.setItem('db-mute', String(next));
  };

  const levelLabels = {
    Safe: '✅ SAFE',
    Medium: '⚠️ MEDIUM RISK',
    High: '🚨 HIGH RISK',
  };

  // Level-specific alert banner styles
  const alertBanners = {
    High: {
      bg: 'rgba(255,51,102,0.12)',
      border: 'rgba(255,51,102,0.4)',
      color: 'var(--neon-red)',
      icon: '🚨',
      text: 'DANGER ALERT — DO NOT PROCEED',
      animation: 'alert-pulse-red',
    },
    Medium: {
      bg: 'rgba(251,191,36,0.1)',
      border: 'rgba(251,191,36,0.3)',
      color: 'var(--neon-yellow)',
      icon: '⚠️',
      text: 'CAUTION — VERIFY BEFORE ACTING',
      animation: '',
    },
    Safe: {
      bg: 'rgba(0,255,136,0.08)',
      border: 'rgba(0,255,136,0.25)',
      color: 'var(--neon-green)',
      icon: '✅',
      text: 'APPEARS SAFE',
      animation: '',
    },
  };

  const banner = alertBanners[result.level];

  return (
    <section className="result-section">
      {/* Alert banner */}
      <div 
        className={`alert-banner ${levelClass} ${banner.animation}`}
        style={{
          background: banner.bg,
          border: `1px solid ${banner.border}`,
          color: banner.color,
        }}
      >
        <div className="alert-banner-left">
          <span className="alert-banner-icon">{banner.icon}</span>
          <span className="alert-banner-text">{banner.text}</span>
        </div>
        <div className="alert-banner-right">
          {result.level === 'High' && (
            <a 
              href="tel:1930" 
              className="alert-helpline-btn"
              onClick={(e) => e.stopPropagation()}
            >
              📞 Call 1930
            </a>
          )}
          <button 
            onClick={toggleMute}
            className="alert-mute-btn"
            title={muted ? 'Unmute alerts' : 'Mute alerts'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className={`result-card ${levelClass}`}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 16,
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '18px', padding: '4px',
          }}
          aria-label="Close result"
        >✕</button>

        <div className="result-header">
          <div className="score-ring-container">
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <circle className="score-ring-bg" cx="50" cy="50" r="42" />
              <circle
                className={`score-ring-progress ${levelClass}`}
                cx="50" cy="50" r="42"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="score-value">
              <div className={`score-number ${levelClass}`}>{animatedScore}</div>
              <div className="score-label">Risk</div>
            </div>
          </div>

          <div className="result-info">
            <h3 className={levelClass}>{levelLabels[result.level]}</h3>
            <span className="module-tag">{getModuleName(result.inputType)}</span>
          </div>
        </div>

        <div className="result-explanation">{result.explanation}</div>

        {/* Explainable AI */}
        <div className="reasons-section">
          <div className="reasons-header" onClick={() => setShowReasons(!showReasons)}>
            <span className="reasons-title">
              🔍 Why is this {result.level === 'Safe' ? 'safe' : 'risky'}? — Explainable AI
            </span>
            <button className="reasons-toggle">{showReasons ? 'Hide ▲' : 'Show ▼'}</button>
          </div>
          {showReasons && (
            <ul className="reasons-list">
              {result.reasons.map((reason, i) => (
                <li key={i} className={reason.startsWith('  ↳') ? 'sub-reason' : ''}>
                  {reason}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action */}
        <div className={`action-box ${levelClass}`}>
          <strong>💡 Recommended Action:</strong><br />
          {result.action}
          
          {result.level === 'High' && onReportFraud && (
            <button 
              onClick={onReportFraud}
              style={{
                display: 'block', width: '100%', marginTop: '14px',
                background: 'var(--red)', color: 'white', padding: '10px',
                borderRadius: 'var(--radius-sm)', border: 'none',
                fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(244,63,94,0.3)',
                animation: 'pulse 2s infinite'
              }}
            >
              Victim of this fraud? Generate FIR Complaint 📝
            </button>
          )}
        </div>

        {/* Bank SMS details */}
        {result.details?.bankAnalysis?.isBank && result.details.bankAnalysis.type && (
          <div style={{
            marginTop: '12px', padding: '12px',
            background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(59,130,246,0.15)', fontSize: '13px', color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: 'var(--neon-blue)' }}>🏦 Bank SMS Details:</strong>
            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>Type: {result.details.bankAnalysis.type === 'debit' ? '💸 Debit' : result.details.bankAnalysis.type === 'credit' ? '💰 Credit' : '🔔 Alert'}</span>
              {result.details.bankAnalysis.amount && <span>Amount: ₹{result.details.bankAnalysis.amount.toLocaleString()}</span>}
              {result.details.bankAnalysis.balance && <span>Balance: ₹{result.details.bankAnalysis.balance.toLocaleString()}</span>}
              {result.details.bankAnalysis.reference && <span>Ref: {result.details.bankAnalysis.reference}</span>}
            </div>
          </div>
        )}

        {/* Fake news details */}
        {result.details?.fakeNewsAnalysis?.score > 0 && (
          <div style={{
            marginTop: '12px', padding: '12px',
            background: 'rgba(251,191,36,0.1)', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(251,191,36,0.15)', fontSize: '13px', color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: 'var(--neon-yellow)' }}>📰 Fake News Analysis:</strong>
            <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {result.details.fakeNewsAnalysis.isForwarded && <span>📤 This appears to be forwarded content</span>}
              {result.details.fakeNewsAnalysis.sensationalSignals?.length > 0 && (
                <span>⚠️ Sensational: {result.details.fakeNewsAnalysis.sensationalSignals.slice(0, 3).join(', ')}</span>
              )}
              {result.details.fakeNewsAnalysis.misinfoSignals?.length > 0 && (
                <span>🚫 Misinfo: {result.details.fakeNewsAnalysis.misinfoSignals.slice(0, 3).join(', ')}</span>
              )}
            </div>
          </div>
        )}

        {/* Deepfake / Media file metadata */}
        {result.details?.fileMetadata && (
          <div style={{
            marginTop: '12px', padding: '12px',
            background: 'rgba(168,85,247,0.08)', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(168,85,247,0.15)', fontSize: '13px', color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: '#c084fc' }}>🎬 Media Metadata:</strong>
            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {Object.entries(result.details.fileMetadata).map(([k, v]) => (
                <span key={k} style={{
                  padding: '3px 10px', background: 'rgba(168,85,247,0.12)',
                  borderRadius: '99px', fontSize: '12px', fontWeight: 500,
                }}>
                  {k}: {v}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
