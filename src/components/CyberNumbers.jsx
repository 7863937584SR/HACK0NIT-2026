import React, { useState } from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All Categories', color: 'var(--text-secondary)' },
  { id: '1930', label: '🆘 1930 Cyber Helpline', color: '#EF4444', activeBg: 'rgba(239,68,68,0.2)' },
  { id: '100', label: '🚓 100 Police', color: '#3B82F6', activeBg: 'rgba(59,130,246,0.2)' },
  { id: '1098', label: '👶 1098 Childline', color: '#10B981', activeBg: 'rgba(16,185,129,0.2)' },
  { id: '1909', label: '📱 1909 TRAI Spam', color: '#F59E0B', activeBg: 'rgba(245,158,11,0.2)' },
  { id: 'portal', label: '🌐 cybercrime.gov.in', color: '#8B5CF6', activeBg: 'rgba(139,92,246,0.2)' },
];

const CONTACTS = {
  national: [
    {
      id: '1', title: '1930', subtitle: 'Cyber Crime Helpline',
      desc: 'Financial fraud • 24/7 • 30-min freeze',
      action: 'Call', link: 'tel:1930', type: 'call', color: '#EF4444',
      badge: '🆘'
    },
    {
      id: '2', title: 'cybercrime.gov.in', subtitle: 'Cyber Crime Portal',
      desc: 'Online FIR • Track complaint',
      action: 'Open', link: 'https://cybercrime.gov.in', type: 'link', color: '#8B5CF6',
      badge: '🌐'
    },
    {
      id: '3', title: '1800-11-0006', subtitle: 'CERT-In Helpline',
      desc: 'Security incidents • Vulnerabilities',
      action: 'Call', link: 'tel:1800110006', type: 'call', color: '#EF4444',
      badge: '🏛️'
    },
    {
      id: '4', title: '1909', subtitle: 'TRAI DND',
      desc: 'Spam SMS • Phishing calls',
      action: 'Call', link: 'tel:1909', type: 'call', color: '#EF4444',
      badge: '📱'
    }
  ],
  international: [
    {
      id: '5', title: 'ic3.gov', subtitle: 'US FBI Internet Crime Center',
      desc: 'US attacks • BEC • Ransomware',
      action: 'Open', link: 'https://ic3.gov', type: 'link', color: '#8B5CF6'
    },
    {
      id: '6', title: 'europol.europa.eu', subtitle: 'EU Europol EC3',
      desc: 'Cross-border EU cybercrime',
      action: 'Open', link: 'https://europol.europa.eu', type: 'link', color: '#8B5CF6'
    },
    {
      id: '7', title: 'interpol.int', subtitle: 'INTERPOL Cyber',
      desc: 'International investigations',
      action: 'Open', link: 'https://interpol.int', type: 'link', color: '#8B5CF6',
      badge: '🌐'
    },
    {
      id: '8', title: 'actionfraud.police.uk', subtitle: 'GB UK Action Fraud',
      desc: 'UK fraud reporting',
      action: 'Open', link: 'https://actionfraud.police.uk', type: 'link', color: '#8B5CF6'
    }
  ]
};

export default function CyberNumbers() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 40px 0', color: 'white' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#EF4444' }}>📞</span> Cyber Emergency Contacts
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>India & International — save before you need them</p>
        </div>
        <div style={{ background: 'var(--bg-2)', padding: '8px 16px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input type="text" placeholder="Search..." style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '120px', fontSize: '13px' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: activeTab === cat.id ? (cat.activeBg || 'var(--bg-3)') : 'var(--bg-2)',
              border: `1px solid ${activeTab === cat.id ? cat.color : 'var(--border)'}`,
              color: activeTab === cat.id ? cat.color : 'var(--text-secondary)',
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* National Column */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            IN INDIA - NATIONAL
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {CONTACTS.national.map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </div>

        {/* International Column */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06B6D4', display: 'inline-block' }}></span>
            INTERNATIONAL
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {CONTACTS.international.map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function ContactCard({ contact }) {
  return (
    <div style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'transform 0.2s',
      cursor: 'pointer'
    }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {contact.badge ? <div style={{ fontSize: '20px', background: 'var(--bg-3)', padding: '8px', borderRadius: '8px' }}>{contact.badge}</div> : <div style={{width:'36px'}}></div>}
        <div>
          <div style={{ color: contact.color, fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{contact.title}</div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{contact.subtitle}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{contact.desc}</div>
        </div>
      </div>
      
      <a 
        href={contact.link}
        style={{
          background: contact.type === 'call' ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.1)',
          color: contact.color,
          border: `1px solid ${contact.color}40`,
          padding: '6px 16px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        {contact.type === 'call' ? '📞' : '🌐'} {contact.action}
      </a>
    </div>
  );
}
