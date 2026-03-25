export default function BottomNav({ activeView, onViewChange }) {
  const items = [
    { id: 'home',      icon: '🏠', label: 'Home'     },
    { id: 'complaint', icon: '📋', label: 'Report'   },
    { id: 'history',   icon: '🕘', label: 'History'  },
    { id: 'laws',      icon: '⚖️', label: 'Laws'     },
    { id: 'settings',  icon: '⚙️', label: 'Settings' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {items.map(item => (
          <button
            key={item.id}
            className={`bottom-nav-btn ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
