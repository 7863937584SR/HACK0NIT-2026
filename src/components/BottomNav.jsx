export default function BottomNav({ activeView, onViewChange }) {
  const items = [
    { id: 'home',      icon: '🏠', label: 'Home'     },
    { id: 'complaint', icon: '📋', label: 'Report'   },
    { id: 'history',   icon: '🕘', label: 'History'  },
    { id: 'guide',     icon: '🧭', label: 'Guide'    },
    { id: 'numbers',   icon: '📞', label: 'Numbers'  },
    { id: 'laws',      icon: '⚖️', label: 'Laws'     },
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {items.map(item => (
          <button
            key={item.id}
            className={`bottom-nav-btn ${activeView === item.id ? 'active' : ''} ${item.id === 'complaint' ? 'report-hot' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="bottom-nav-icon-wrap">
              {item.icon}
              {item.id === 'complaint' && activeView !== 'complaint' && <span className="report-hot-dot" aria-hidden="true">!</span>}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
