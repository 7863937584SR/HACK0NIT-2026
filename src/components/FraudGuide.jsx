import { useState } from 'react';

const GUIDE_STEPS = [
  {
    id: 1,
    title: '1. The Golden Hour — Stop the Bleeding',
    icon: '⏳',
    color: 'var(--red)',
    bg: 'rgba(244,63,94,0.1)',
    content: (
      <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
        <p>The first 2–4 hours after a cyber fraud are critical for money recovery.</p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li><strong>Immediately Call 1930:</strong> This is the National Cyber Crime Reporting Portal helpline. They can freeze the funds in the scammer's destination bank account.</li>
          <li><strong>Contact Your Bank:</strong> Call your bank's 24/7 fraud helpline to block your debit/credit cards, freeze UPI, and stop net banking access immediately.</li>
          <li><strong>Do NOT confront the scammer:</strong> They might delete the chat history or panic. Play along while you secure your accounts.</li>
        </ul>
      </div>
    )
  },
  {
    id: 2,
    title: '2. Gather Irrefutable Evidence',
    icon: '📸',
    color: 'var(--neon-blue)',
    bg: 'rgba(59,130,246,0.1)',
    content: (
      <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
        <p>Cyber police cannot investigate without digital footprints. Before doing anything else, collect the following:</p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li><strong>Screenshots:</strong> Take screenshots of all WhatsApp/Telegram chats, fake websites, or social media profiles before they get deleted.</li>
          <li><strong>Transaction References:</strong> Download the exact bank statement or UPI transaction receipt showing the 12-digit UTR/RRN number.</li>
          <li><strong>Scammer Details:</strong> Note down the scammer's exact phone number, email address, or UPI ID (e.g., <i>scammer@ybl</i>).</li>
        </ul>
      </div>
    )
  },
  {
    id: 3,
    title: '3. Generate FIR Template (Sentinel One)',
    icon: '📝',
    color: 'var(--neon-yellow)',
    bg: 'rgba(251,191,36,0.1)',
    content: (
      <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
        <p>Police stations require formally drafted complaints. Sentinel One automates this for you.</p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Go to the <strong>"Report"</strong> tab found in the bottom navigation.</li>
          <li>Select the exact type of fraud (UPI, Impersonation, Fake Job, etc).</li>
          <li>Fill in your details and let our AI generate an <strong>FIR-ready Legal Complaint</strong>.</li>
          <li>Copy this text. It contains the exact legal structure required by cyber cells.</li>
        </ul>
      </div>
    )
  },
  {
    id: 4,
    title: '4. File Official Online Complaint',
    icon: '🏛️',
    color: 'var(--neon-green)',
    bg: 'rgba(0,255,136,0.1)',
    content: (
      <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
        <p>Now, you must officially register the case with the Government of India.</p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Visit <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-blue)', textDecoration: 'underline' }}>cybercrime.gov.in</a> and click <strong>"File a Complaint"</strong>.</li>
          <li>Accept the terms and register using your mobile number and state.</li>
          <li>Paste the FIR template you generated from Sentinel One into the "Incident Details" section.</li>
          <li>Upload your screenshots and bank PDFs in the "Evidence" section.</li>
          <li>Submit and save the <strong>Acknowledgment Number</strong> (starts with your state code).</li>
        </ul>
      </div>
    )
  },
  {
    id: 5,
    title: '5. What to do if Police or Bank ignores you',
    icon: '⚠️',
    color: 'var(--orange)',
    bg: 'rgba(249,115,22,0.1)',
    content: (
      <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
        <p>If you don't get a resolution within 30 days:</p>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li><strong>Bank Unresponsive?</strong> File a complaint with the Reserve Bank of India (RBI) Ombudsman at <a href="https://cms.rbi.org.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-blue)', textDecoration: 'underline' }}>cms.rbi.org.in</a>.</li>
          <li><strong>Police Inaction?</strong> Visit your local police station's Cyber Cell physically with the written FIR printout and demand an official stamped receipt.</li>
          <li><strong>Never Pay Recovery Scammers:</strong> Beware of people commenting on YouTube or Twitter claiming they can "hack" the scammer and get your money back for a fee. <strong>These are secondary scams!</strong></li>
        </ul>
      </div>
    )
  }
];

export default function FraudGuide() {
  const [openStep, setOpenStep] = useState(1);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '30px' }}>
      <div className="section-header">
        <h2 className="section-title">🧭 Fraud Survival Guide</h2>
        <span className="section-subtitle">Step-by-step directions for victims of cybercrime</span>
      </div>

      <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(59,130,246,0.05)', borderRadius: 'var(--r-md)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          If you have lost money to a cyber fraud, panic is your worst enemy. Follow these 5 critical steps in exact order to maximize your chances of recovering your hard-earned money and bringing the perpetrators to justice.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {GUIDE_STEPS.map((step) => {
          const isOpen = openStep === step.id;
          return (
            <div 
              key={step.id} 
              className="glass-card" 
              style={{ padding: 0, overflow: 'hidden', borderLeft: `4px solid ${step.color}` }}
            >
              <button
                onClick={() => setOpenStep(isOpen ? null : step.id)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '50%', 
                    background: step.bg, display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', fontSize: '18px' 
                  }}>
                    {step.icon}
                  </div>
                  <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{step.title}</strong>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              <div style={{
                maxHeight: isOpen ? '500px' : '0',
                opacity: isOpen ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.3s ease-in-out',
                background: 'var(--bg-3)'
              }}>
                <div style={{ padding: '0 16px 16px 64px', color: 'var(--text-secondary)' }}>
                  {step.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <a 
          href="tel:1930"
          className="scan-btn"
          style={{ 
            display: 'inline-flex', padding: '14px 24px', background: 'var(--red)', 
            color: 'white', fontWeight: 'bold', fontSize: '16px', borderRadius: '100px',
            animation: 'pulse 2s infinite', textDecoration: 'none'
          }}
        >
          📞 EMERGENCY: CALL 1930 NOW
        </a>
      </div>
    </div>
  );
}
