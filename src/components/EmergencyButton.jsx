import { useState } from 'react';

export default function EmergencyButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="emergency-section">
      <button 
        id="emergency-btn"
        className="emergency-btn" 
        onClick={() => setShowModal(true)}
      >
        🚨 Report Fraud — Emergency
      </button>

      {showModal && (
        <div className="emergency-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="emergency-modal" onClick={(e) => e.stopPropagation()}>
            <h2>🚨 Cyber Crime Emergency</h2>
            <p>If you are a victim of cyber fraud, act immediately:</p>
            
            <div className="helpline">1930</div>
            <p style={{ fontSize: '13px' }}>
              National Cyber Crime Helpline<br />
              <strong>Available 24/7</strong>
            </p>

            <div style={{ margin: '16px 0', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '13px', marginBottom: '8px' }}>
                📝 File Online Complaint:
              </p>
              <a 
                href="https://cybercrime.gov.in" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '15px', fontWeight: 600 }}
              >
                cybercrime.gov.in →
              </a>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <p>🔹 Report within 24 hours for best chance of fund recovery</p>
              <p>🔹 Save all evidence — screenshots, messages, transaction IDs</p>
              <p>🔹 Do NOT make any more transactions</p>
            </div>

            <button className="close-btn" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
