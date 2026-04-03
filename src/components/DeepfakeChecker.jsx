import { useState, useRef } from 'react';

// Deepfake signal analysis from description text
function analyzeDescriptionSignals(text) {
  const lower = text.toLowerCase();
  let score = 0;
  const reasons = [];

  const checks = [
    { keywords: ['lip sync', 'lip movement', 'out of sync', 'mouth not matching'], label: 'Lip sync issues — #1 deepfake indicator', boost: 22 },
    { keywords: ['blurry edges', 'blurry face', 'edge artifact', 'face blur', 'glitchy'], label: 'Visual artifacts around face edges', boost: 20 },
    { keywords: ['unnatural', 'robotic', 'stiff', 'weird movement', 'weird expression'], label: 'Unnatural facial expressions/movements', boost: 16 },
    { keywords: ['lighting mismatch', 'different lighting', 'shadow wrong', 'shadow mismatch'], label: 'Lighting inconsistencies detected', boost: 14 },
    { keywords: ['celebrity', 'politician', 'minister', 'pm ', 'cm ', 'actor', 'actress', 'famous'], label: 'Public figure featured — verify original source', boost: 12 },
    { keywords: ['leaked', 'secret', 'private', 'exclusive', 'hidden'], label: '"Leaked/secret" content is often fabricated', boost: 16 },
    { keywords: ['whatsapp', 'viral', 'forwarded', 'share karo', 'broadcast'], label: 'Viral/forwarded media carries higher manipulation risk', boost: 10 },
    { keywords: ['investment', 'scheme', 'earn', 'bitcoin', 'crypto', 'double your money'], label: 'Deepfake used for investment scam promotion', boost: 24 },
    { keywords: ['ai generated', 'ai made', 'artificial', 'fake video', 'generated'], label: 'Content may be AI-generated', boost: 22 },
    { keywords: ['voice clone', 'voice change', 'audio fake', 'sound different', 'not his voice', 'not her voice'], label: 'Possible voice cloning detected', boost: 20 },
    { keywords: ['no metadata', 'metadata stripped', 'metadata removed'], label: 'Metadata removed — common in manipulated media', boost: 14 },
  ];

  for (const { keywords, label, boost } of checks) {
    if (keywords.some(k => lower.includes(k))) {
      score += boost;
      reasons.push(`🎥 ${label}`);
    }
  }

  // URL check
  if (/https?:\/\//.test(text)) {
    if (/\.(exe|apk|bat|scr)/.test(lower)) {
      score += 25; reasons.push('🚨 Link contains executable — possible malware');
    }
    if (/\.(tk|ml|ga|cf|xyz|top|buzz|cam)/.test(lower)) {
      score += 15; reasons.push('🔗 Link uses suspicious free domain');
    }
  }

  // CAPS abuse
  const capsWords = text.split(/\s+/).filter(w => w.length > 3 && w === w.toUpperCase());
  if (capsWords.length > 3) { score += 8; reasons.push('📝 Excessive CAPITAL LETTERS — emotional manipulation'); }

  return { score: Math.min(score, 99), reasons };
}

// Analyze media file metadata
function analyzeMediaFile(file, videoEl) {
  const results = { score: 0, reasons: [], metadata: {} };

  // File metadata analysis
  const sizeMB = file.size / (1024 * 1024);
  const ext = file.name.split('.').pop().toLowerCase();
  results.metadata.name = file.name;
  results.metadata.sizeMB = sizeMB.toFixed(2);
  results.metadata.type = file.type || 'unknown';
  results.metadata.ext = ext;

  // Extension/MIME mismatch
  const videoExts = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', '3gp'];
  const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'opus'];
  const isVideoExt = videoExts.includes(ext);
  const isAudioExt = audioExts.includes(ext);
  const mimeIsVideo = file.type.startsWith('video/');
  const mimeIsAudio = file.type.startsWith('audio/');

  if ((isVideoExt && mimeIsAudio) || (isAudioExt && mimeIsVideo)) {
    results.score += 20;
    results.reasons.push('⚠️ File extension/type mismatch — possible disguised file');
  }

  // Suspicious file names
  const suspiciousNames = ['viral', 'leaked', 'private', 'hidden', 'secret', 'mms', 'exposed', 'celeb'];
  if (suspiciousNames.some(n => file.name.toLowerCase().includes(n))) {
    results.score += 12;
    results.reasons.push(`📁 Suspicious filename: "${file.name}"`);
  }

  // Unusually tiny video (often re-encoded fakes)
  if (isVideoExt && sizeMB < 0.5 && sizeMB > 0) {
    results.score += 10;
    results.reasons.push(`📦 Very small video file (${sizeMB.toFixed(2)} MB) — may be heavily compressed`);
  }

  // Video element metadata (duration, dimensions)
  if (videoEl) {
    const duration = videoEl.duration;
    const width = videoEl.videoWidth;
    const height = videoEl.videoHeight;

    results.metadata.duration = duration ? `${duration.toFixed(1)}s` : 'unknown';
    results.metadata.resolution = (width && height) ? `${width}×${height}` : 'unknown';

    // Non-standard resolution (common in AI-generated videos)
    if (width && height) {
      const standardRes = [[1920,1080],[1280,720],[640,480],[3840,2160],[1080,1920],[720,1280]];
      const isStandard = standardRes.some(([w,h]) => w === width && h === height);
      if (!isStandard) {
        results.score += 10;
        results.reasons.push(`📐 Non-standard resolution (${width}×${height}) — common in AI-generated video`);
      }
    }

    // Very short clip with suspicious content
    if (duration < 5 && duration > 0) {
      results.score += 8;
      results.reasons.push(`⏱️ Very short clip (${duration.toFixed(1)}s) — may be selectively clipped`);
    }
  }

  // What's detected if nothing suspicious
  if (results.reasons.length === 0) {
    results.reasons.push(`✅ File metadata appears normal (${sizeMB.toFixed(2)} MB, .${ext})`);
  }

  return results;
}

export default function DeepfakeChecker({ onScan }) {
  const [input, setInput] = useState('');
  const [checkType, setCheckType] = useState('video');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaMetadata, setMediaMetadata] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRef = useRef(null);

  const acceptMap = {
    video: 'video/mp4,video/webm,video/mov,video/avi,video/mkv,.mp4,.webm,.mov,.avi,.mkv',
    audio: 'audio/mp3,audio/wav,audio/ogg,audio/aac,audio/m4a,.mp3,.wav,.ogg,.aac,.m4a',
    image: 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif',
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    setUploadedFile(file);
    setMediaMetadata(null);

    const url = URL.createObjectURL(file);
    setMediaPreview(url);
    setInput(''); // Clear description when file uploaded
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleMediaLoaded = () => {
    if (!uploadedFile) return;
    const meta = analyzeMediaFile(uploadedFile, mediaRef.current);
    setMediaMetadata(meta);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    let totalScore = 0;
    const totalReasons = [];
    let fileMetaData = null;

    // Analyze file metadata if uploaded
    if (uploadedFile && mediaMetadata) {
      totalScore += mediaMetadata.score;
      totalReasons.push(...mediaMetadata.reasons);
      fileMetaData = mediaMetadata.metadata;
    }

    // Call ML backend for images
    if (checkType === 'image' && uploadedFile) {
      try {
        const formData = new FormData();
        formData.append('image', uploadedFile);
        const mlRes = await fetch('http://localhost:5005/detect_image_deepfake', {
          method: 'POST',
          body: formData,
        });
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          const confidence = mlData.score * 100;
          // When the model says "real", the risk score should be LOW (invert the confidence).
          // When the model says "fake", the risk score should be HIGH (use confidence directly).
          const mlRiskScore = mlData.deepfake === 'fake' ? confidence : (100 - confidence);
          totalScore += mlRiskScore;
          if (mlData.deepfake === 'fake') {
             totalReasons.push(`🤖 ML Detector: High confidence of AI generation or manipulation (${confidence.toFixed(1)}%)`);
          } else {
             totalReasons.push(`✅ ML Detector: Image structural integrity appears normal (${confidence.toFixed(1)}% authentic)`);
          }
        }
      } catch (err) {
        console.error('ML Analysis failed:', err);
        totalReasons.push('⚠️ ML Analysis unavailable (Backend offline or failed)');
      }
    }

    // Analyze description text
    if (input.trim()) {
      const { score, reasons } = analyzeDescriptionSignals(input.trim());
      totalScore += score;
      totalReasons.push(...reasons);
    }

    // If file uploaded with no description and no issues, add positive signal
    if (uploadedFile && totalReasons.length === 0) {
      totalReasons.push('✅ No suspicious signals detected in file metadata or description');
    }
    if (!uploadedFile && !input.trim()) {
      setIsAnalyzing(false);
      return;
    }
    if (totalReasons.length === 0) {
      totalReasons.push('✅ No suspicious indicators detected');
    }

    totalScore = Math.max(0, Math.min(99, totalScore));

    let level, explanation, action;
    if (totalScore >= 60) {
      level = 'High';
      explanation = 'Multiple deepfake/manipulation indicators detected. Do NOT trust or share this media.';
      action = '🚨 STOP sharing. Use reverse image/video search. Report to cybercrime.gov.in if someone is being impersonated.';
    } else if (totalScore >= 30) {
      level = 'Medium';
      explanation = 'Some manipulation indicators detected. Verify the source before trusting or sharing.';
      action = '⚠️ Verify on original source. Check official channels. Use altnews.in or boomlive.in to fact-check.';
    } else {
      level = 'Safe';
      explanation = 'No strong manipulation signals found. Stay cautious — not all deepfakes are detectable by metadata alone.';
      action = '✅ Appears safe, but always verify media from trusted sources before sharing.';
    }

    const resultObj = {
      score: totalScore,
      level,
      reasons: totalReasons,
      explanation,
      action,
      inputType: 'deepfake',
      details: {
        bankAnalysis: { isBank: false },
        fakeNewsAnalysis: { score: 0 },
        fileMetadata: fileMetaData,
      },
      timestamp: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsAnalyzing(false);
      const label = uploadedFile ? uploadedFile.name : input.substring(0, 80);
      onScan(label, resultObj);
    }, 1200);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setMediaPreview(null);
    setMediaMetadata(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="deepfake-checker animate-fade-in">
      <div className="section-header">
        <h2 className="section-title">🎥 Deepfake & Media Analyzer</h2>
      </div>

      <div className="glass-card" style={{ padding: '20px' }}>
        {/* Type Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['video', 'audio', 'image'].map(type => (
            <button
              key={type}
              onClick={() => { setCheckType(type); clearFile(); }}
              className={`type-tab ${checkType === type ? 'active' : ''}`}
            >
              {type === 'video' ? '🎬 Video' : type === 'audio' ? '🎵 Audio' : '🖼️ Image'}
            </button>
          ))}
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          className={`media-upload-zone ${dragOver ? 'drag-over' : ''} ${uploadedFile ? 'has-file' : ''}`}
          onClick={() => !uploadedFile && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptMap[checkType]}
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />

          {!uploadedFile ? (
            <div className="upload-placeholder">
              <div className="upload-icon">
                {checkType === 'video' ? '🎬' : checkType === 'audio' ? '🎵' : '🖼️'}
              </div>
              <p className="upload-text">
                <strong>Click or drag & drop</strong> to upload {checkType}
              </p>
              <p className="upload-subtext">
                {checkType === 'video' ? 'MP4, WebM, MOV, AVI, MKV' :
                 checkType === 'audio' ? 'MP3, WAV, OGG, AAC, M4A' :
                 'JPG, PNG, WebP, GIF'} · Max 200MB
              </p>
            </div>
          ) : (
            <div className="upload-preview">
              {checkType === 'video' && (
                <video
                  ref={mediaRef}
                  src={mediaPreview}
                  controls
                  onLoadedMetadata={handleMediaLoaded}
                  style={{ maxHeight: '180px', borderRadius: '8px', width: '100%', objectFit: 'contain' }}
                />
              )}
              {checkType === 'audio' && (
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎵</div>
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{uploadedFile.name}</p>
                  <audio
                    ref={mediaRef}
                    src={mediaPreview}
                    controls
                    onLoadedMetadata={handleMediaLoaded}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
              {checkType === 'image' && (
                <img
                  src={mediaPreview}
                  alt="Uploaded"
                  style={{ maxHeight: '180px', borderRadius: '8px', objectFit: 'contain', width: '100%' }}
                />
              )}

              {/* Metadata readout */}
              {mediaMetadata && (
                <div className="media-metadata">
                  <span className="meta-chip">📁 {mediaMetadata.metadata.sizeMB} MB</span>
                  {mediaMetadata.metadata.resolution && mediaMetadata.metadata.resolution !== 'unknown' && (
                    <span className="meta-chip">📐 {mediaMetadata.metadata.resolution}</span>
                  )}
                  {mediaMetadata.metadata.duration && mediaMetadata.metadata.duration !== 'unknown' && (
                    <span className="meta-chip">⏱️ {mediaMetadata.metadata.duration}</span>
                  )}
                  <span className="meta-chip">.{mediaMetadata.metadata.ext}</span>
                </div>
              )}

              {/* Clear button */}
              <button
                className="upload-clear-btn"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
              >
                ✕ Remove file
              </button>
            </div>
          )}
        </div>

        {/* Description input */}
        <div style={{ marginTop: '12px' }}>
          <label className="form-label">
            Additional description (optional — paste URL or describe what you see)
          </label>
          <textarea
            className="form-input"
            style={{ minHeight: '80px', resize: 'vertical', marginTop: '6px' }}
            placeholder={`Describe the ${checkType}...\n• "Lip sync looks off, celebrity promoting crypto"\n• "Voice sounds robotic, claims to be bank manager"`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* What we check info */}
        <div style={{
          padding: '10px 14px', background: 'rgba(59,130,246,0.08)',
          borderRadius: 'var(--radius-md)', margin: '12px 0',
          fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6
        }}>
          <strong style={{ color: 'var(--neon-blue)' }}>🔍 What we analyze:</strong>
          {' '}File metadata · Resolution anomalies · Duration signals · Filename patterns ·
          Lip sync indicators · AI-generation signals · Voice cloning patterns · Viral/forward risk
        </div>

        <button
          className={`scan-btn ${isAnalyzing ? 'scanning' : ''}`}
          onClick={handleAnalyze}
          style={{ width: '100%', justifyContent: 'center' }}
          disabled={(!uploadedFile && !input.trim()) || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing' : `Analyze ${checkType.charAt(0).toUpperCase() + checkType.slice(1)} ⚡`}
        </button>
      </div>
    </div>
  );
}
