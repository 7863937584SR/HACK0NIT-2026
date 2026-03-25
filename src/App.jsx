import { useState, useEffect, useCallback } from 'react';
import { analyzeInput, getModuleName } from './engine/fraudEngine';
import './index.css';

// Components
import TopBar from './components/TopBar';
import HeroScanner from './components/HeroScanner';
import ResultCard from './components/ResultCard';
import ModuleGrid from './components/ModuleGrid';
import LivePanel from './components/LivePanel';
import EmergencyButton from './components/EmergencyButton';
import ScanHistory from './components/ScanHistory';
import BottomNav from './components/BottomNav';
import TransactionAnalyzer from './components/TransactionAnalyzer';
import DeepfakeChecker from './components/DeepfakeChecker';
import ScanAnimation from './components/ScanAnimation';
import AboutSection from './components/AboutSection';
import ComplaintTemplate from './components/ComplaintTemplate';
import AuthPage from './components/AuthPage';

// Sample alerts for live feed
const SAMPLE_ALERTS = [
  { text: 'Fake KYC update SMS targeting SBI customers in Maharashtra', score: 87, time: '2 min ago' },
  { text: 'Phishing URL mimicking Paytm refund page detected', score: 92, time: '5 min ago' },
  { text: 'Lottery scam messages circulating on WhatsApp groups', score: 78, time: '12 min ago' },
  { text: 'Suspicious UPI collect requests from unknown merchant IDs', score: 65, time: '18 min ago' },
  { text: 'Government impersonation calls reported in Delhi NCR region', score: 83, time: '25 min ago' },
  { text: 'Fake job offer emails from spoofed company domains', score: 71, time: '32 min ago' },
  { text: 'OTP phishing via fake bank customer care WhatsApp', score: 89, time: '40 min ago' },
  { text: 'Deepfake video of bank CEO used in investment scam', score: 75, time: '1 hr ago' },
  { text: 'Fake RBI circular about new ₹2000 note exchange deadline', score: 81, time: '1.5 hr ago' },
  { text: 'Crypto doubling scam targeting Telegram users in India', score: 88, time: '2 hr ago' },
];

function App() {
  const [result, setResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeView, setActiveView] = useState('home');
  const [stats, setStats] = useState({ total: 0, highRisk: 0, commonScam: 'OTP Phishing' });

  // Auth state — check localStorage on mount
  const [user, setUser] = useState(() => {
    try {
      const auth = localStorage.getItem('db-auth');
      const saved = JSON.parse(localStorage.getItem('db-user') || 'null');
      if (auth && saved) return saved;
      if (auth === 'guest') return { name: 'Guest', email: '', avatar: '?', isGuest: true };
    } catch {}
    return null;
  });

  const handleAuth = (u) => setUser(u);
  const handleLogout = () => {
    localStorage.removeItem('db-auth');
    setUser(null);
    setActiveView('home');
  };

  // Handle Logout
  // Update stats from history
  useEffect(() => {
    const total = history.length;
    const highRisk = history.filter(h => h.level === 'High').length;
    const percentage = total > 0 ? Math.round((highRisk / total) * 100) : 0;
    
    const reasonCounts = {};
    history.forEach(h => {
      if (h.reasons) {
        h.reasons.forEach(r => {
          const key = r.replace(/^[🔴🟡⏰😰👔🎁🔗💳🏦📰📧⚡🔢🪪✅💰📥❓⚠️🎥📋💡🌙🚨\s]+/, '').split(':')[0].split('—')[0].trim();
          if (key && key.length > 3) reasonCounts[key] = (reasonCounts[key] || 0) + 1;
        });
      }
    });
    const commonScam = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'OTP Phishing';
    
    setStats({ total, highRisk: percentage, commonScam });
  }, [history]);

  // Fetch history from DB when user logs in
  useEffect(() => {
    if (!user || user.isGuest) return;
    fetch(`http://localhost:3001/api/scans/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(err => console.error('Failed to fetch scans', err));
  }, [user]);

  const addToHistory = useCallback(async (input, analysis) => {
    const newScan = {
      id: Date.now(), // temp ID until refresh
      input: input.substring(0, 120),
      score: analysis.score,
      level: analysis.level,
      reasons: analysis.reasons,
      module: analysis.inputType || activeModule,
    };
    
    setHistory(prev => [newScan, ...prev]);

    if (user && !user.isGuest) {
      try {
        await fetch('http://localhost:3001/api/scans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            input: newScan.input,
            score: newScan.score,
            level: newScan.level,
            module: newScan.module,
            reasons: newScan.reasons
          })
        });
      } catch (err) {
        console.error('Failed to save scan to database', err);
      }
    }
  }, [user, activeModule]);

  const handleScan = useCallback((input) => {
    setIsScanning(true);
    setResult(null);

    setTimeout(() => {
      const analysis = analyzeInput(input, activeModule);
      if (analysis) {
        setResult(analysis);
        addToHistory(input, analysis);
      }
      setIsScanning(false);
    }, 1800);
  }, [activeModule, addToHistory]);

  // For Transaction/Deepfake that provide their own result
  const handleCustomResult = useCallback((input, customResult) => {
    setResult(customResult);
    addToHistory(input, customResult);
  }, [addToHistory]);

  const handleModuleSelect = (moduleId) => {
    setActiveModule(moduleId);
    setResult(null);
    if (activeView !== 'home' && activeView !== 'scan') {
      setActiveView('home');
    }
    setTimeout(() => {
      document.getElementById('scanner-input')?.focus();
    }, 100);
  };

  const clearResult = () => setResult(null);

  // Determine if we need specialized scanner
  const showTransactionForm = activeModule === 'transaction';
  const showDeepfakeChecker = activeModule === 'deepfake';
  const showRegularScanner = !showTransactionForm && !showDeepfakeChecker;
  
  // Show auth page if not logged in
  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <div className="app">
      <TopBar user={user} onLogout={handleLogout} />
      
      <main className="main-content">
        {activeView === 'home' && (
          <>
            {/* Scanner Area */}
            {showRegularScanner && (
              <HeroScanner 
                onScan={handleScan} 
                isScanning={isScanning} 
                moduleHint={activeModule}
              />
            )}
            {showTransactionForm && (
              <TransactionAnalyzer onScan={handleCustomResult} />
            )}
            {showDeepfakeChecker && (
              <DeepfakeChecker onScan={handleCustomResult} />
            )}

            {/* Scan Progress Animation */}
            <ScanAnimation isScanning={isScanning} />
            
            {/* Results */}
            {result && (
              <ResultCard result={result} onClose={clearResult} />
            )}
            
            {/* Module Grid */}
            <ModuleGrid 
              activeModule={activeModule}
              onModuleSelect={handleModuleSelect}
            />
            
            {/* Live Panel */}
            <LivePanel stats={stats} alerts={SAMPLE_ALERTS} />
            
            {/* Emergency */}
            <EmergencyButton />

            {/* Recent History */}
            {history.length > 0 && (
              <ScanHistory history={history.slice(0, 5)} />
            )}
          </>
        )}
        
        {activeView === 'scan' && (
          <>
            {showRegularScanner && (
              <HeroScanner 
                onScan={handleScan} 
                isScanning={isScanning} 
                moduleHint={activeModule}
              />
            )}
            {showTransactionForm && <TransactionAnalyzer onScan={handleCustomResult} />}
            {showDeepfakeChecker && <DeepfakeChecker onScan={handleCustomResult} />}
            <ScanAnimation isScanning={isScanning} />
            {result && <ResultCard result={result} onClose={clearResult} />}
            <ModuleGrid 
              activeModule={activeModule}
              onModuleSelect={handleModuleSelect}
            />
          </>
        )}
        
        {activeView === 'complaint' && (
          <ComplaintTemplate user={user} />
        )}
        
        {activeView === 'history' && (
          <ScanHistory history={history} showAll />
        )}
        
        {activeView === 'laws' && (
          <div className="laws-section animate-fade-in">
            <div className="section-header">
              <h2 className="section-title">🏛️ Cyber Laws & Resources</h2>
            </div>
            <div className="laws-grid">
              {[
                { title: 'IT Act 2000 — Section 66C', desc: 'Identity theft using electronic signature, password or unique identification feature. Punishment: Imprisonment up to 3 years + fine up to ₹1 lakh.', icon: '📜' },
                { title: 'IT Act 2000 — Section 66D', desc: 'Cheating by personation using computer resource. Punishment: Imprisonment up to 3 years + fine up to ₹1 lakh.', icon: '📜' },
                { title: 'IT Act 2000 — Section 43', desc: 'Penalty and compensation for damage to computer, computer system, etc. Liable to pay damages up to ₹1 crore.', icon: '📜' },
                { title: 'IT Act 2000 — Section 66', desc: 'Computer related offences including hacking. Punishment: Imprisonment up to 3 years or fine up to ₹5 lakh.', icon: '📜' },
                { title: 'IT Act 2000 — Section 67', desc: 'Publishing or transmitting obscene material in electronic form. Imprisonment up to 5 years + fine up to ₹10 lakh.', icon: '📜' },
                { title: 'IPC Section 420', desc: 'Cheating and dishonestly inducing delivery of property. Punishment: Imprisonment up to 7 years + fine.', icon: '⚖️' },
                { title: 'IPC Section 468', desc: 'Forgery for purpose of cheating. Punishment: Imprisonment up to 7 years + fine.', icon: '⚖️' },
                { title: 'IPC Section 471', desc: 'Using as genuine a forged document or electronic record.', icon: '⚖️' },
                { title: 'RBI Guidelines on Digital Fraud', desc: 'Zero liability for unauthorized electronic banking transactions if reported within 3 working days. Limited liability (₹25,000) if reported within 4–7 days.', icon: '🏦' },
                { title: 'TRAI DND Regulations', desc: 'Register on Do Not Disturb (DND) list by sending SMS "START 0" to 1909. Report spam calls/SMS to TRAI.', icon: '📱' },
                { title: 'National Cyber Crime Helpline', desc: 'Call 1930 (24/7) to report cyber fraud immediately. The sooner you report, the higher chances of fund recovery.', icon: '📞' },
                { title: 'Online Complaint Portal', desc: 'File FIR online at cybercrime.gov.in — National Cyber Crime Reporting Portal by Ministry of Home Affairs.', icon: '🌐' },
              ].map((law, i) => (
                <div key={i} className="glass-card" style={{ padding: '16px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '24px' }}>{law.icon}</span>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{law.title}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{law.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeView === 'settings' && (
          <div className="settings-section animate-fade-in">
            <div className="section-header">
              <h2 className="section-title">⚙️ Settings</h2>
            </div>
            <div className="glass-card" style={{ padding: '20px' }}>
              {[
                { title: 'Offline Protection Mode', desc: 'All analysis runs locally — no internet required', enabled: true },
                { title: 'Explainable AI', desc: 'Show detailed reasons for every risk score', enabled: true },
                { title: 'Auto-detect Input Type', desc: 'Automatically choose the right scanner module', enabled: true },
                { title: 'Voice Input (Speech-to-Text)', desc: 'Speak to scan using Web Speech API', enabled: true },
                { title: 'Combo Signal Detection', desc: 'Detect dangerous combinations (OTP+urgency, etc.)', enabled: true },
                { title: 'Bank SMS Parser', desc: 'Parse and validate bank debit/credit alerts', enabled: true },
                { title: 'Fake News Detector', desc: 'Detect forwarded misinformation and sensational claims', enabled: true },
                { title: 'Deepfake Analysis', desc: 'Analyze video/image/audio for manipulation signals', enabled: true },
                { title: 'Transaction Risk Analysis', desc: 'Evaluate UPI transactions for scam indicators', enabled: true },
                { title: 'Save Scan History', desc: 'Store scan results locally (up to 100 scans)', enabled: true },
              ].map((setting, i) => (
                <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '12px 0', 
                  borderBottom: i < 9 ? '1px solid var(--border-glass)' : 'none'
                }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px' }}>{setting.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{setting.desc}</p>
                  </div>
                  <span style={{ 
                    color: setting.enabled ? 'var(--neon-green)' : 'var(--text-muted)', 
                    fontSize: '13px', fontWeight: 600 
                  }}>
                    {setting.enabled ? '✅ Active' : '⬜ Off'}
                  </span>
                </div>
              ))}
            </div>
            
            {/* About Section */}
            <div style={{ marginTop: '24px' }}>
              <AboutSection />
            </div>
            
            <div className="glass-card" style={{ padding: '16px', marginTop: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <strong>Digital Bandhu v2.0</strong> — Sentinel AI
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                🔒 All processing happens on your device. No data is sent to any server.<br/>
                9 scanner modules • Explainable AI • Offline-first • Voice input • 200+ patterns
              </p>
            </div>
          </div>
        )}
      </main>
      
      <BottomNav activeView={activeView} onViewChange={setActiveView} />
    </div>
  );
}

export default App;
