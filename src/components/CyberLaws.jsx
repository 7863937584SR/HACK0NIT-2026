import React, { useState } from 'react';

const CATEGORIES = [
  { id: 'india', label: 'IN India', active: true },
  { id: 'world', label: '🌐 World', active: false },
  { id: 'ai', label: '🤖 AI Laws', active: false },
  { id: 'fake', label: '📰 Fake News', active: false },
  { id: 'fintech', label: '💳 Fintech', active: false },
  { id: 'deepfake', label: '🎭 Deepfake', active: false },
];

const LAWS = [
  {
    title: 'IT Act 2000 & CERT-In 2022',
    region: 'India',
    desc: '§66 hacking, §66C identity theft, §66E privacy, §66F cyber terrorism. CERT-In: 6-hour incident reporting, 5-year log retention.',
    action: 'Report to CERT-In within 6 hours at incident@cert-in.org.in',
    tags: ['#66C ID Theft', '#66E Privacy'],
    penalty: 'Up to Life',
    color: '#8B5CF6'
  },
  {
    title: 'DPDP Act 2023',
    region: 'India • Aug 2023',
    desc: "India's first data protection law. Rights: information, correction, erasure. 72-hour breach notification. Data Protection Board established.",
    action: 'Report data breaches within 72 hours to Data Protection Board',
    tags: ['72hr Notice', 'Right to Erasure'],
    penalty: 'Up to ₹250 Crore',
    color: '#EF4444'
  },
  {
    title: 'Bharatiya Nyaya Sanhita 2023',
    region: 'India • July 2024',
    desc: '§318 UPI fraud (old §420), §353 fake news, §354C deepfakes, §356 defamation. Cognizable offences.',
    action: 'File FIR at cybercrime.gov.in. Call 1930 within 30 mins for transaction freeze',
    tags: ['#318 UPI Fraud', '#353 Fake News'],
    penalty: 'Up to 10 yrs',
    color: '#3B82F6'
  },
  {
    title: 'IT Rules 2021 & Telecom Act 2023',
    region: 'India',
    desc: '24-hour takedown, 5-hop WhatsApp traceability. Telecom Act §42 SIM fraud, OTT regulation.',
    action: 'Report spam to TRAI DND (1909). SIM swap victims — contact operator immediately',
    tags: ['24hr Takedown', '#42 SIM Fraud'],
    penalty: '₹70 immunity loss',
    color: '#F59E0B'
  }
];

export default function CyberLaws() {
  const [activeTab, setActiveTab] = useState('india');

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 40px 0', color: 'white' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>⚖️</span> Legal Intelligence
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>India & Global Cyber Legal Framework 2026</p>
        </div>
        <div style={{ background: 'var(--bg-2)', padding: '8px 16px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input type="text" placeholder="Search..." style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '120px', fontSize: '13px' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            style={{
              padding: '8px 20px',
              borderRadius: '4px',
              background: activeTab === cat.id ? 'var(--blue)' : 'var(--bg-2)',
              border: 'none',
              color: activeTab === cat.id ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {LAWS.map((law, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>{law.title}</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{law.region}</span>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              {law.desc}
            </p>

            <div style={{ 
              background: 'rgba(59,130,246,0.05)', 
              border: '1px dashed rgba(59,130,246,0.3)',
              borderRadius: '6px',
              padding: '12px 16px',
              marginBottom: '20px',
              flexGrow: 1
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: 'var(--blue)', marginBottom: '8px' }}>
                PROTECTIVE ACTION
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
                {law.action}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {law.tags.map((tag, i) => (
                  <span key={i} style={{ 
                    background: 'var(--bg-3)', 
                    color: 'var(--blue)', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '11px', 
                    fontWeight: 600,
                    border: '1px solid rgba(59,130,246,0.2)'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <span style={{ color: law.color, fontSize: '12px', fontWeight: 700 }}>
                {law.penalty}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
