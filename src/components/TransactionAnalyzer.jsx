import { useState } from 'react';

export default function TransactionAnalyzer({ onScan }) {
  const [formData, setFormData] = useState({
    amount: '',
    senderUPI: '',
    receiverUPI: '',
    reason: '',
    isCollectRequest: false,
    isUnknownSender: false,
    time: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAnalyze = () => {
    let score = 0;
    const reasons = [];

    const amount = parseFloat(formData.amount) || 0;

    // Amount analysis
    if (amount > 50000) {
      score += 15;
      reasons.push(`💰 High-value transaction: ₹${amount.toLocaleString()}`);
    } else if (amount > 10000) {
      score += 8;
      reasons.push(`💰 Medium-value transaction: ₹${amount.toLocaleString()}`);
    }

    // Collect request from unknown
    if (formData.isCollectRequest) {
      score += 20;
      reasons.push('📥 This is a collect/payment request (not you sending)');
      if (formData.isUnknownSender) {
        score += 15;
        reasons.push('❓ Collect request from unknown person — HIGH RISK');
      }
    }

    // Unknown sender
    if (formData.isUnknownSender && !formData.isCollectRequest) {
      score += 10;
      reasons.push('❓ Transaction involves unknown party');
    }

    // Suspicious reason keywords
    const reasonLower = formData.reason.toLowerCase();
    const suspiciousReasons = [
      { keywords: ['refund', 'cashback', 'reward'], label: 'Refund/cashback bait', boost: 18 },
      { keywords: ['investment', 'return', 'profit', 'double'], label: 'Investment scam signals', boost: 22 },
      { keywords: ['lottery', 'prize', 'won', 'winner'], label: 'Prize/lottery scam', boost: 25 },
      { keywords: ['emergency', 'urgent', 'help', 'hospital'], label: 'Emotional urgency manipulation', boost: 12 },
      { keywords: ['loan', 'emi', 'processing fee'], label: 'Loan fraud — legitimate lenders never ask for advance fee', boost: 20 },
      { keywords: ['customs', 'courier', 'delivery', 'parcel'], label: 'Delivery/customs scam', boost: 15 },
      { keywords: ['verify', 'kyc', 'confirm'], label: 'Verification scam', boost: 18 },
      { keywords: ['task', 'rating', 'review', 'like'], label: 'Fake task/review scam', boost: 22 },
    ];

    for (const { keywords, label, boost } of suspiciousReasons) {
      if (keywords.some(k => reasonLower.includes(k))) {
        score += boost;
        reasons.push(`⚠️ ${label}`);
      }
    }

    // Suspicious timing
    if (formData.time) {
      const hour = parseInt(formData.time.split(':')[0]);
      if (hour >= 0 && hour <= 5) {
        score += 10;
        reasons.push('🌙 Transaction at unusual hours (12AM–5AM)');
      }
    }

    // Receiver UPI check
    if (formData.receiverUPI) {
      const upiLower = formData.receiverUPI.toLowerCase();
      if (/\d{5,}/.test(upiLower)) {
        score += 8;
        reasons.push('💳 Receiver UPI has suspicious numeric pattern');
      }
      if (/(lucky|winner|prize|gift|refund|cashback)/.test(upiLower)) {
        score += 15;
        reasons.push('💳 Receiver UPI contains scam-related keywords');
      }
    }

    score = Math.max(0, Math.min(99, score));

    if (reasons.length === 0) {
      reasons.push('✅ No suspicious indicators found in this transaction');
    }

    let level, explanation, action;
    if (score >= 60) {
      level = 'High';
      explanation = 'This transaction shows multiple red flags. Do NOT proceed without independent verification.';
      action = '🚨 STOP! Do NOT complete this transaction. If you already paid, call 1930 immediately. Report at cybercrime.gov.in';
    } else if (score >= 30) {
      level = 'Medium';
      explanation = 'This transaction has some concerning elements. Verify the recipient before proceeding.';
      action = '⚠️ Verify the recipient independently. Call them on a known number. Never pay advance fees for loans/jobs.';
    } else {
      level = 'Safe';
      explanation = 'This transaction appears normal with no major red flags. Always double-check before sending money.';
      action = '✅ Appears safe. Always verify UPI IDs before sending. Check amount before confirming.';
    }

    onScan(JSON.stringify({
      type: 'transaction',
      amount,
      reason: formData.reason
    }), {
      score, level, reasons, explanation, action,
      inputType: 'transaction',
      details: { bankAnalysis: { isBank: false }, fakeNewsAnalysis: { score: 0 } },
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="transaction-form animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">💸 Transaction Risk Analyzer</h2>
      </div>
      <div className="glass-card" style={{ padding: '20px' }}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              className="form-input"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Receiver UPI ID</label>
            <input
              type="text"
              name="receiverUPI"
              className="form-input"
              placeholder="e.g., user@paytm"
              value={formData.receiverUPI}
              onChange={handleChange}
            />
          </div>
          <div className="form-group full">
            <label className="form-label">Reason / Purpose</label>
            <input
              type="text"
              name="reason"
              className="form-input"
              placeholder="e.g., refund, investment, loan processing fee..."
              value={formData.reason}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Time of Request</label>
            <input
              type="time"
              name="time"
              className="form-input"
              value={formData.time}
              onChange={handleChange}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="isCollectRequest"
                checked={formData.isCollectRequest}
                onChange={handleChange}
              />
              <span>This is a collect/payment request</span>
            </label>
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="isUnknownSender"
                checked={formData.isUnknownSender}
                onChange={handleChange}
              />
              <span>Sender/receiver is unknown</span>
            </label>
          </div>
        </div>
        <button 
          className="scan-btn" 
          onClick={handleAnalyze}
          style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
          disabled={!formData.amount && !formData.reason}
        >
          Analyze Transaction Risk ⚡
        </button>
      </div>
    </div>
  );
}
