import { useState, useEffect } from 'react';

export default function ComplaintsVault({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user || user.isGuest) return;
    
    fetch(`http://localhost:3001/api/complaints/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setComplaints(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch complaints', err);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>Loading your secure vault...</div>;

  if (complaints.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '10px' }}>📁 No Complaints Filed</h3>
        <p style={{ color: 'var(--text-muted)' }}>You have not saved any FIR complaint templates yet.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="section-header">
        <h2 className="section-title">🛡️ My Complaints Vault</h2>
        <span className="section-subtitle">Secure archive of your filed FIR templates</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {complaints.map(c => {
          const isExpanded = expandedId === c.id;
          const fraudLabel = 
            c.fraudType === 'upi' ? '💳 UPI / Payment Scam' :
            c.fraudType === 'otp' ? '🏦 Banking/OTP Fraud' :
            c.fraudType === 'job' ? '💼 Fake Job Offer' :
            c.fraudType === 'investment' ? '📈 Investment Scam' :
            c.fraudType === 'deepfake' ? '🎥 Deepfake / AI Fraud' : 
            '🚨 Cyber Crime';

          return (
            <div key={c.id} className="glass-card" style={{ padding: '16px', borderLeft: '4px solid var(--blue)' }}>
              
              {/* Header row */}
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {fraudLabel}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                    <span>📅 {c.date || new Date().toISOString().split('T')[0]}</span>
                    {c.amount && <span>💰 ₹{Number(c.amount).toLocaleString()}</span>}
                    {c.platform && <span>📱 {c.platform}</span>}
                  </div>
                </div>
                
                <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}>
                  {isExpanded ? '▲ hide details' : '▼ show details'}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{ 
                  marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)',
                  fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6
                }}>
                  {c.scammerDetails && (
                    <div style={{ marginBottom: '8px', padding: '8px', background: 'rgba(244,63,94,0.05)', borderRadius: '4px', border: '1px dashed rgba(244,63,94,0.3)' }}>
                      <strong style={{ color: 'var(--neon-red)' }}>Scammer Details:</strong> {c.scammerDetails}
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Description of Incident:</strong><br/>
                    {c.description || 'No description provided.'}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <a 
                      href="https://cybercrime.gov.in" 
                      target="_blank" rel="noopener noreferrer"
                      className="scan-btn"
                      style={{ padding: '6px 14px', fontSize: '12px', background: 'var(--bg-3)', color: 'var(--text-primary)' }}
                    >
                      🔗 Report to Cybercrime.gov.in
                    </a>
                  </div>
                </div>
              )}
              
            </div>
          );
        })}
      </div>
    </div>
  );
}
