import { useState, useEffect, useRef } from 'react';
import { detectInputType, getModuleName } from '../engine/fraudEngine';

export default function HeroScanner({ onScan, isScanning, moduleHint }) {
  const [input, setInput] = useState('');
  const [detectedType, setDetectedType] = useState('message');
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Check voice support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };
      
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      
      recognitionRef.current = recognition;
    }
  }, []);

  // Update detected type
  useEffect(() => {
    if (input.trim()) {
      setDetectedType(moduleHint || detectInputType(input));
    } else {
      setDetectedType(moduleHint || 'message');
    }
  }, [input, moduleHint]);

  // Module hint placeholder
  useEffect(() => {
    if (moduleHint) {
      setInput('');
    }
  }, [moduleHint]);

  const handleScan = () => {
    if (input.trim() && !isScanning) {
      onScan(input.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleScan();
    }
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const typeLabels = {
    url: '🌐 URL Detected',
    upi: '💳 UPI ID Detected',
    email: '📧 Email Detected',
    phone: '📱 Phone Detected',
    message: '📩 Message Mode',
    bankSms: '🏦 Bank SMS Detected',
    news: '📰 News/Forward Detected',
    voice: '🎙️ Voice Input',
    deepfake: '🎥 Deepfake Check',
    transaction: '💸 Transaction Mode',
  };

  const placeholders = {
    url: 'Paste a suspicious URL to analyze...',
    upi: 'Enter a UPI ID to check (e.g., user@upi)',
    email: 'Enter an email address to verify...',
    message: 'Paste suspicious message, URL, UPI ID, or email here...',
    bankSms: 'Paste a bank SMS/alert to analyze...',
    news: 'Paste a forwarded message or news claim to fact-check...',
    voice: 'Click the mic button and speak, or type here...',
    deepfake: 'Paste media URL or describe the content to analyze...',
    transaction: 'Describe the transaction (amount, sender, reason)...',
  };

  return (
    <section className="hero-section">
      <div className="hero-badge">
        🤖 Powered by Sentinel One — Explainable Fraud Detection
      </div>
      <h1 className="hero-title">
        Scan <span>Anything</span> Instantly
      </h1>
      <p className="hero-subtitle">
        Paste any message, URL, UPI ID, or email — or use voice input 🎤 — to detect fraud in real-time. 
        Works completely offline with explainable AI.
      </p>
      
      <div className="scanner-container">
        <div className="scanner-input-wrapper">
          <textarea
            id="scanner-input"
            className="scanner-textarea"
            placeholder={placeholders[moduleHint || detectedType] || placeholders.message}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
          />
          <div className="scanner-footer">
            <span className="scanner-type-badge">
              {typeLabels[moduleHint || detectedType]}
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {voiceSupported && (
                <button 
                  className={`voice-btn ${isListening ? 'listening' : ''}`}
                  onClick={toggleVoice}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  🎤
                </button>
              )}
              <button 
                id="scan-btn"
                className={`scan-btn ${isScanning ? 'scanning' : ''}`}
                onClick={handleScan}
                disabled={!input.trim() || isScanning}
              >
                {isScanning ? 'Analyzing' : 'SCAN NOW ⚡'}
              </button>
            </div>
          </div>
        </div>
        {isListening && (
          <div className="voice-indicator">
            <span className="voice-pulse"></span>
            Listening... speak now
          </div>
        )}
      </div>
    </section>
  );
}
