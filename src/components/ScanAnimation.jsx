import { useEffect, useState } from 'react';

const SCAN_STEPS = [
  { icon: '🔍', label: 'Analyzing input pattern...' },
  { icon: '📝', label: 'Detecting keywords & signals...' },
  { icon: '🧠', label: 'Running combo analysis...' },
  { icon: '⚡', label: 'Generating risk score...' },
];

export default function ScanAnimation({ isScanning }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setCurrentStep(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 350);
    return () => clearInterval(interval);
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="scan-animation">
      <div className="scan-progress-bar">
        <div 
          className="scan-progress-fill" 
          style={{ width: `${((currentStep + 1) / SCAN_STEPS.length) * 100}%` }}
        />
      </div>
      <div className="scan-steps">
        {SCAN_STEPS.map((step, i) => (
          <div 
            key={i} 
            className={`scan-step ${i <= currentStep ? 'active' : ''} ${i === currentStep ? 'current' : ''}`}
          >
            <span className="scan-step-icon">{step.icon}</span>
            <span className="scan-step-label">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
