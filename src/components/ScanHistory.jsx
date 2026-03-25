export default function ScanHistory({ history, showAll }) {
  const displayHistory = showAll ? history : history.slice(0, 5);

  const getLevelClass = (level) => level.toLowerCase();
  
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  if (history.length === 0) {
    return (
      <section className="history-section animate-fade-in">
        <div className="section-header">
          <h2 className="section-title">📋 Scan History</h2>
        </div>
        <div className="empty-state">
          <span className="empty-state-icon">🔍</span>
          <p className="empty-state-text">No scans yet. Try scanning a message above!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="history-section animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">📋 {showAll ? 'All Scan History' : 'Recent Scans'}</h2>
        <span className="section-subtitle">{history.length} scan{history.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="history-list">
        {displayHistory.map((item) => (
          <div key={item.id} className="history-item">
            <span className={`history-score-badge ${getLevelClass(item.level)}`}>
              {item.score}
            </span>
            <span className="history-text">{item.input}</span>
            <span className="history-time">{formatTime(item.timestamp)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
