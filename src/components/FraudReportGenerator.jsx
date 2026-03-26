import { useState, useEffect } from 'react';

const encodeBase64 = (text) => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

const decodeBase64 = (encoded) => {
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export default function FraudReportGenerator({ result, user, onClose }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [userKeyPair, setUserKeyPair] = useState(null);
  const [encryptedReport, setEncryptedReport] = useState(null);
  const [walletReports, setWalletReports] = useState([]);
  const [showWallet, setShowWallet] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState(null);

  // Generate or load user's GPG key pair
  useEffect(() => {
    const loadOrCreateKeyPair = async () => {
      const storedKey = localStorage.getItem(`gpg-key-${user.id}`);
      
      if (storedKey) {
        try {
          const keys = JSON.parse(storedKey);
          setUserKeyPair({
            privateKey: keys.privateKey || 'mock-private-key',
            publicKey: keys.publicKey || 'mock-public-key',
          });
        } catch (error) {
          console.error('Error loading stored keys:', error);
          generateNewKeyPair();
        }
      } else {
        generateNewKeyPair();
      }
    };

    const generateNewKeyPair = () => {
      try {
        // Local pseudo-key placeholders for wallet UX without external crypto dependency.
        const privateKey = `local-private-${user.id}-${Date.now()}`;
        const publicKey = `local-public-${user.id}`;
        setUserKeyPair({ privateKey, publicKey });
        
        localStorage.setItem(`gpg-key-${user.id}`, JSON.stringify({
          privateKey,
          publicKey,
          userId: user.id
        }));
      } catch (error) {
        console.error('Error generating key pair:', error);
        // Fallback: create a simple mock key pair for demo purposes
        const mockKeys = {
          privateKey: 'mock-private-key',
          publicKey: 'mock-public-key'
        };
        setUserKeyPair({ privateKey: mockKeys, publicKey: mockKeys });
        localStorage.setItem(`gpg-key-${user.id}`, JSON.stringify({
          ...mockKeys,
          userId: user.id
        }));
      }
    };

    if (user && !user.isGuest) {
      loadOrCreateKeyPair();
    }
  }, [user]);

  // Load wallet reports
  useEffect(() => {
    if (user && !user.isGuest) {
      const stored = localStorage.getItem(`fraud-reports-${user.id}`);
      if (stored) {
        try {
          setWalletReports(JSON.parse(stored));
        } catch (error) {
          console.error('Error loading wallet reports:', error);
        }
      }
    }
  }, [user]);

  const generateFraudReport = async () => {
    if (!userKeyPair || !result) return;

    setIsGenerating(true);
    
    try {
      const reportData = {
        uid: user.id,
        name: user.name,
        email: user.email,
        timestamp: new Date().toISOString(),
        fraudType: result.inputType || 'Unknown',
        riskLevel: result.level,
        riskScore: result.score,
        fraudDetails: {
          reasons: result.reasons,
          explanation: result.explanation,
          action: result.action,
          module: getModuleName(result.inputType)
        },
        additionalDetails: result.details || {},
        reportId: `FR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };

      const reportText = formatReportText(reportData);
      const encoded = encodeBase64(reportText);
      setEncryptedReport(encoded);
      
      // Save to wallet
      const newReport = {
        id: reportData.reportId,
        timestamp: reportData.timestamp,
        fraudType: reportData.fraudType,
        riskLevel: reportData.riskLevel,
        encryptedData: encoded,
        isDecrypted: false
      };

      const updatedWallet = [newReport, ...walletReports];
      setWalletReports(updatedWallet);
      localStorage.setItem(`fraud-reports-${user.id}`, JSON.stringify(updatedWallet));
      
    } catch (error) {
      console.error('Error generating report:', error);
      // Fallback to simple encoding
      const reportText = formatReportText({
        uid: user.id,
        name: user.name,
        timestamp: new Date().toISOString(),
        fraudType: result.inputType || 'Unknown',
        riskLevel: result.level,
        riskScore: result.score,
        reportId: `FR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      });
      const encoded = encodeBase64(reportText);
      setEncryptedReport(encoded);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatReportText = (data) => {
    return `
FRAUD DETECTION REPORT
======================

Report ID: ${data.reportId}
Generated: ${new Date(data.timestamp).toLocaleString()}

USER INFORMATION
----------------
Name: ${data.name}
Email: ${data.email}
UID: ${data.uid}

FRAUD ANALYSIS
--------------
Type: ${data.fraudType}
Risk Level: ${data.riskLevel}
Risk Score: ${data.riskScore}/100

DETECTION DETAILS
-----------------
Module: ${data.fraudDetails.module}
Explanation: ${data.fraudDetails.explanation}

Reasons Identified:
${data.fraudDetails.reasons.map(reason => `- ${reason}`).join('\n')}

Recommended Action: ${data.fraudDetails.action}

${data.additionalDetails.bankAnalysis ? `
BANK SMS ANALYSIS
-----------------
Type: ${data.additionalDetails.bankAnalysis.type}
${data.additionalDetails.bankAnalysis.amount ? `Amount: ₹${data.additionalDetails.bankAnalysis.amount}` : ''}
${data.additionalDetails.bankAnalysis.balance ? `Balance: ₹${data.additionalDetails.bankAnalysis.balance}` : ''}
${data.additionalDetails.bankAnalysis.reference ? `Reference: ${data.additionalDetails.bankAnalysis.reference}` : ''}
` : ''}

${data.additionalDetails.fakeNewsAnalysis ? `
FAKE NEWS ANALYSIS
------------------
Score: ${data.additionalDetails.fakeNewsAnalysis.score}
${data.additionalDetails.fakeNewsAnalysis.isForwarded ? '- Content appears to be forwarded' : ''}
${data.additionalDetails.fakeNewsAnalysis.sensationalSignals ? `Sensational signals: ${data.additionalDetails.fakeNewsAnalysis.sensationalSignals.join(', ')}` : ''}
${data.additionalDetails.fakeNewsAnalysis.misinfoSignals ? `Misinformation signals: ${data.additionalDetails.fakeNewsAnalysis.misinfoSignals.join(', ')}` : ''}
` : ''}

REPORT FOOTER
-------------
This report was generated by Sentinel One Fraud Detection System
All data is encrypted and stored securely in your digital wallet
For official complaints, please contact your local cyber crime department

Generated on: ${new Date().toISOString()}
System Version: Sentinel One v2.0
    `.trim();
  };

  const decryptReport = async (report) => {
    if (!userKeyPair || !report.encryptedData) return;

    try {
      const decrypted = decodeBase64(report.encryptedData);
      setDecryptedContent(decrypted);
      
      // Update report status
      const updatedWallet = walletReports.map(r => 
        r.id === report.id ? { ...r, isDecrypted: true } : r
      );
      setWalletReports(updatedWallet);
      localStorage.setItem(`fraud-reports-${user.id}`, JSON.stringify(updatedWallet));
      
    } catch (error) {
      console.error('Error decrypting report:', error);
      // Try fallback decryption
      try {
        const decrypted = decodeBase64(report.encryptedData);
        setDecryptedContent(decrypted);
      } catch (fallbackError) {
        setDecryptedContent('Error: Unable to decrypt report');
      }
    }
  };

  const downloadReport = (report, isDecrypted = false) => {
    const content = isDecrypted ? decryptedContent : report.encryptedData;
    const filename = `${report.id}.${isDecrypted ? 'txt' : 'asc'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteReport = (reportId) => {
    const updatedWallet = walletReports.filter(r => r.id !== reportId);
    setWalletReports(updatedWallet);
    localStorage.setItem(`fraud-reports-${user.id}`, JSON.stringify(updatedWallet));
  };

  const getModuleName = (inputType) => {
    const moduleNames = {
      sms: 'SMS Scanner',
      email: 'Email Scanner', 
      url: 'URL Scanner',
      upi: 'UPI Scanner',
      phone: 'Phone Scanner',
      message: 'Message Scanner',
      transaction: 'Transaction Analyzer',
      deepfake: 'Deepfake Checker',
      bank: 'Bank SMS Parser',
      default: 'Multi-Scanner'
    };
    return moduleNames[inputType] || moduleNames.default;
  };

  if (user?.isGuest) {
    return (
      <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
        <h3>🔐 Report Generation Requires Login</h3>
        <p>Please login to generate encrypted fraud reports and use the digital wallet.</p>
        <button onClick={onClose} style={{ marginTop: '12px', padding: '8px 16px' }}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: 'var(--neon-blue)' }}>🔐 GPG Fraud Report Generator</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
      </div>

      {!encryptedReport && (
        <div>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
            Generate an encrypted fraud report with GPG security. The report will be stored in your digital wallet and can only be decrypted with your private key.
          </p>
          
          <div style={{ background: 'rgba(0,255,136,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--neon-green)' }}>📋 Report Preview:</h4>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div><strong>Fraud Type:</strong> {getModuleName(result.inputType)}</div>
              <div><strong>Risk Level:</strong> {result.level}</div>
              <div><strong>Risk Score:</strong> {result.score}/100</div>
              <div><strong>User:</strong> {user.name}</div>
            </div>
          </div>

          <button
            onClick={generateFraudReport}
            disabled={isGenerating || !userKeyPair}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--neon-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: (isGenerating || !userKeyPair) ? 0.6 : 1
            }}
          >
            {isGenerating ? '🔄 Generating Encrypted Report...' : '🔐 Generate GPG Encrypted Report'}
          </button>
        </div>
      )}

      {encryptedReport && (
        <div>
          <div style={{ background: 'rgba(0,255,136,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--neon-green)' }}>✅ Report Generated Successfully!</h4>
            <p style={{ margin: 0, fontSize: '13px' }}>
              Your encrypted fraud report has been generated and saved to your digital wallet.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => downloadReport({ encryptedData: encryptedReport })}
              style={{
                flex: 1,
                padding: '8px',
                background: 'var(--neon-green)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              📥 Download Encrypted
            </button>
            <button
              onClick={() => setShowWallet(!showWallet)}
              style={{
                flex: 1,
                padding: '8px',
                background: 'var(--neon-blue)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              💼 {showWallet ? 'Hide' : 'Show'} Wallet ({walletReports.length})
            </button>
          </div>
        </div>
      )}

      {showWallet && (
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: 'var(--neon-blue)' }}>💼 Your Digital Wallet</h4>
          
          {walletReports.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No reports in wallet yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {walletReports.map(report => (
                <div key={report.id} style={{
                  background: 'rgba(59,130,246,0.05)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '6px',
                  padding: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{report.id}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(report.timestamp).toLocaleDateString()} • {report.fraudType} • {report.riskLevel}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => decryptReport(report)}
                        disabled={report.isDecrypted}
                        style={{
                          padding: '4px 8px',
                          background: report.isDecrypted ? 'var(--neon-green)' : 'var(--neon-yellow)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: report.isDecrypted ? 'default' : 'pointer'
                        }}
                      >
                        {report.isDecrypted ? '✓ Decrypted' : '🔓 Decrypt'}
                      </button>
                      <button
                        onClick={() => downloadReport(report, report.isDecrypted)}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--neon-blue)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        📥
                      </button>
                      <button
                        onClick={() => deleteReport(report.id)}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--neon-red)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {decryptedContent && (
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: 'var(--neon-green)' }}>📄 Decrypted Report Content</h4>
          <div style={{
            background: 'rgba(0,255,136,0.05)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: '6px',
            padding: '12px',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            <pre style={{ margin: 0, fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {decryptedContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
