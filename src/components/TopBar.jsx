export default function TopBar({ user, onLogout, onGoToVault }) {
  return (
    <header className="topbar">
      <div className="topbar-logo">
        <div className="topbar-logo-icon">🛡️</div>
        <div>
          <div className="topbar-title">Sentinel One</div>
          <div className="topbar-subtitle">Sentinel One</div>
        </div>
      </div>
      
      <div className="topbar-status">
        <span className="status-dot"></span>
        System Active
      </div>

      <div className="topbar-actions">
        <div className="offline-badge">
          ⚡ Offline Ready
        </div>
        
        {user ? (
          <div className="topbar-user-panel">
            <div className="topbar-user-info">
              <span className="user-avatar">{user.avatar}</span>
              <span className="user-name">{user.name}</span>
            </div>
            <button 
              className="topbar-btn" 
              onClick={onGoToVault} 
              title="My Complaints Vault" 
              style={{ background: 'var(--bg-3)', fontSize: '14px', padding: '0 12px' }}
            >
              🛡️ Vault
            </button>
            <button className="topbar-btn" onClick={onLogout} title="Sign Out" aria-label="Sign Out">
              🚪
            </button>
          </div>
        ) : (
          <button className="topbar-btn" title="Profile">
            👤
          </button>
        )}
      </div>
    </header>
  );
}
