export default function LivePanel({ stats, alerts }) {
  const getScoreClass = (score) => {
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'safe';
  };

  return (
    <section className="live-panel-section">
      <div className="section-header">
        <h2 className="section-title">📊 Live Intelligence</h2>
        <span className="section-subtitle">Real-time overview</span>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value blue">{stats.total}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-value red">{stats.highRisk}%</div>
          <div className="stat-label">High Risk</div>
        </div>
        <div className="stat-card">
          <div className="stat-value yellow" style={{ fontSize: '14px', lineHeight: '38px' }}>
            {stats.commonScam.length > 15 ? stats.commonScam.substring(0, 15) + '…' : stats.commonScam}
          </div>
          <div className="stat-label">Top Scam Type</div>
        </div>
      </div>

      {/* Live Feed */}
      <div className="live-feed">
        <div className="live-feed-header">
          <div className="live-badge">
            <span className="live-dot"></span>
            LIVE ALERTS
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            India Fraud Intelligence
          </span>
        </div>
        <ul className="live-feed-list">
          {alerts.map((alert, i) => (
            <li key={i} className="live-feed-item">
              <span className={`feed-score ${getScoreClass(alert.score)}`}>
                {alert.score}
              </span>
              <span>{alert.text}</span>
              <span className="feed-time">{alert.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
