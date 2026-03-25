import {
  SCAM_KEYWORDS,
  HINDI_SCAM_KEYWORDS,
  SUSPICIOUS_URL_PATTERNS,
  REGEX_PATTERNS,
  TRUSTED_DOMAINS,
  SUSPICIOUS_UPI,
  BEHAVIORAL_SIGNALS,
  BANK_SMS_PATTERNS,
  FORWARD_INDICATORS,
  FAKE_NEWS_INDICATORS,
  TRANSACTION_RISK,
} from './patterns';

// ============================================================
// WORD BOUNDARY MATCHING (fixes false positives)
// ============================================================

/**
 * Check if a keyword exists as a whole phrase/word in text
 * Uses word boundary logic to prevent partial matches
 */
function matchKeyword(text, keyword) {
  // For multi-word phrases, use includes (they're specific enough)
  if (keyword.includes(' ')) {
    return text.includes(keyword);
  }
  // For single words, use word boundary regex to prevent partial matches
  // e.g., 'ed' should NOT match inside 'blocked'
  try {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  } catch {
    return text.includes(keyword);
  }
}

// ============================================================
// INPUT TYPE DETECTION
// ============================================================

export function detectInputType(input) {
  const trimmed = input.trim();
  
  if (/^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed)) return 'url';
  if (/^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/.test(trimmed) && !trimmed.includes('.')) return 'upi';
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) return 'email';
  if (/^(?:\+91[\-\s]?)?[6-9]\d{9}$/.test(trimmed.replace(/[\s-]/g, ''))) return 'phone';
  
  // Check if it looks like a bank SMS (starts with bank prefix or has transaction format)
  if (BANK_SMS_PATTERNS.debit.test(trimmed) || BANK_SMS_PATTERNS.credit.test(trimmed)) return 'bankSms';
  
  // Check if it looks like a forwarded/news message
  const lowerTrimmed = trimmed.toLowerCase();
  const forwardCount = FORWARD_INDICATORS.filter(f => lowerTrimmed.includes(f)).length;
  if (forwardCount >= 2) return 'news';
  
  return 'message';
}

// ============================================================
// KEYWORD ANALYSIS (with word boundary matching)
// ============================================================

function analyzeKeywords(text) {
  const lower = text.toLowerCase();
  const matches = { high: [], medium: [], low: [] };
  const seen = new Set(); // Deduplicate
  
  for (const keyword of SCAM_KEYWORDS.high) {
    if (!seen.has(keyword) && matchKeyword(lower, keyword)) {
      matches.high.push(keyword);
      seen.add(keyword);
    }
  }
  for (const keyword of SCAM_KEYWORDS.medium) {
    if (!seen.has(keyword) && matchKeyword(lower, keyword)) {
      matches.medium.push(keyword);
      seen.add(keyword);
    }
  }
  for (const keyword of SCAM_KEYWORDS.low) {
    if (!seen.has(keyword) && matchKeyword(lower, keyword)) {
      matches.low.push(keyword);
      seen.add(keyword);
    }
  }
  for (const keyword of HINDI_SCAM_KEYWORDS) {
    if (!seen.has(keyword) && matchKeyword(lower, keyword)) {
      matches.high.push(keyword);
      seen.add(keyword);
    }
  }
  
  return matches;
}

// ============================================================
// BEHAVIORAL ANALYSIS (with word boundary matching)
// ============================================================

function analyzeBehavior(text) {
  const lower = text.toLowerCase();
  const detected = {};
  
  for (const [signal, keywords] of Object.entries(BEHAVIORAL_SIGNALS)) {
    const found = keywords.filter(k => matchKeyword(lower, k));
    if (found.length > 0) {
      detected[signal] = found;
    }
  }
  
  return detected;
}

// ============================================================
// URL ANALYSIS
// ============================================================

function analyzeURLs(text) {
  const urls = text.match(REGEX_PATTERNS.url) || [];
  const results = [];
  
  for (const url of urls) {
    const lowerUrl = url.toLowerCase();
    const isTrusted = TRUSTED_DOMAINS.some(domain => {
      // More precise: check that the domain appears as the actual host
      return lowerUrl.includes(`://${domain}`) || lowerUrl.includes(`.${domain}`);
    });
    
    const suspiciousMatches = SUSPICIOUS_URL_PATTERNS.filter(pattern => pattern.test(url));
    const issues = [];
    
    if (suspiciousMatches.length > 0) issues.push('Suspicious URL pattern detected');
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) issues.push('IP-based URL (no domain name)');
    if (/@/.test(url.replace(/^https?:\/\//, ''))) issues.push('URL contains @ redirect trick');
    if (url.length > 100) issues.push('Unusually long URL');
    
    results.push({
      url,
      isTrusted,
      suspiciousPatterns: suspiciousMatches.length,
      issues,
    });
  }
  
  return results;
}

// ============================================================
// UPI ANALYSIS
// ============================================================

function analyzeUPI(text) {
  const upiIds = text.match(REGEX_PATTERNS.upi) || [];
  const results = [];
  
  for (const upi of upiIds) {
    if (upi.includes('.') && upi.includes('@')) continue; // likely email
    if (!upi.includes('@')) continue;
    
    const issues = [];
    const suspicious = SUSPICIOUS_UPI.some(pattern => pattern.test(upi));
    
    // Check for numeric-heavy username (bot-like)
    const username = upi.split('@')[0];
    const digitRatio = (username.match(/\d/g) || []).length / username.length;
    if (digitRatio > 0.6 && username.length > 5) {
      issues.push('UPI ID has suspicious numeric pattern');
    }
    
    if (suspicious) issues.push('UPI ID matches known scam patterns');
    
    results.push({ upi, suspicious: suspicious || issues.length > 0, issues });
  }
  
  return results;
}

// ============================================================
// BANK SMS ANALYSIS
// ============================================================

export function analyzeBankSMS(text) {
  const result = {
    isBank: false,
    type: null,  // 'debit', 'credit', 'alert'
    amount: null,
    balance: null,
    reference: null,
    merchant: null,
    suspicious: false,
    reasons: [],
  };
  
  const lower = text.toLowerCase();
  
  // Check if it's a bank message
  const bankNames = ['sbi', 'hdfc', 'icici', 'axis', 'kotak', 'pnb', 'bob', 'canara', 'idbi', 'yes bank', 'indusind'];
  result.isBank = bankNames.some(b => matchKeyword(lower, b)) || /a\/c|acct|account/i.test(text);
  
  if (!result.isBank) return result;
  result.isBank = true;
  
  // Parse debit/credit
  const debitMatch = text.match(BANK_SMS_PATTERNS.debit);
  const creditMatch = text.match(BANK_SMS_PATTERNS.credit);
  const balanceMatch = text.match(BANK_SMS_PATTERNS.balance);
  const refMatch = text.match(BANK_SMS_PATTERNS.upiRef);
  
  if (debitMatch) {
    result.type = 'debit';
    result.amount = parseFloat(debitMatch[1].replace(/,/g, ''));
  } else if (creditMatch) {
    result.type = 'credit';
    result.amount = parseFloat(creditMatch[1].replace(/,/g, ''));
  } else {
    result.type = 'alert';
  }
  
  if (balanceMatch) result.balance = parseFloat(balanceMatch[1].replace(/,/g, ''));
  if (refMatch) result.reference = refMatch[1];
  
  // Check for suspicious patterns in bank SMS
  if (lower.includes('otp') || lower.includes('click') || lower.includes('link')) {
    result.suspicious = true;
    result.reasons.push('Bank SMS should not ask for OTP or contain clickable links');
  }
  if (/https?:\/\//i.test(text)) {
    result.suspicious = true;
    result.reasons.push('Legitimate bank SMS rarely contains full URLs');
  }
  if (lower.includes('verify') || lower.includes('update')) {
    result.suspicious = true;
    result.reasons.push('Verification/update requests in SMS are often phishing');
  }
  if (result.amount && result.amount > TRANSACTION_RISK.highAmountThreshold) {
    result.reasons.push(`High-value transaction: ₹${result.amount.toLocaleString()}`);
  }
  
  return result;
}

// ============================================================
// FAKE NEWS / FORWARDED MESSAGE ANALYSIS
// ============================================================

export function analyzeFakeNews(text) {
  const lower = text.toLowerCase();
  const result = {
    isForwarded: false,
    forwardSignals: [],
    sensationalSignals: [],
    misinfoSignals: [],
    score: 0,
    reasons: [],
  };
  
  // Check forward indicators
  result.forwardSignals = FORWARD_INDICATORS.filter(f => lower.includes(f));
  result.isForwarded = result.forwardSignals.length > 0;
  
  // Check sensational language
  result.sensationalSignals = FAKE_NEWS_INDICATORS.sensational.filter(s => lower.includes(s));
  
  // Check health misinfo
  const healthSignals = FAKE_NEWS_INDICATORS.healthMisinfo.filter(h => lower.includes(h));
  result.misinfoSignals.push(...healthSignals);
  
  // Check political misinfo
  const politicalSignals = FAKE_NEWS_INDICATORS.politicalMisinfo.filter(p => lower.includes(p));
  result.misinfoSignals.push(...politicalSignals);
  
  // Calculate fake news score
  if (result.isForwarded) {
    result.score += 10;
    result.reasons.push('Message appears to be forwarded content');
  }
  if (result.sensationalSignals.length > 0) {
    result.score += result.sensationalSignals.length * 12;
    result.reasons.push(`Sensational language: ${result.sensationalSignals.slice(0, 3).join(', ')}`);
  }
  if (result.misinfoSignals.length > 0) {
    result.score += result.misinfoSignals.length * 15;
    result.reasons.push(`Potential misinformation: ${result.misinfoSignals.slice(0, 3).join(', ')}`);
  }
  
  // No source attribution
  if (!lower.includes('source:') && !lower.includes('according to') && result.sensationalSignals.length > 0) {
    result.score += 8;
    result.reasons.push('No credible source cited');
  }
  
  // ALL CAPS detection
  const words = text.split(/\s+/);
  const capsWords = words.filter(w => w.length > 3 && w === w.toUpperCase());
  if (capsWords.length > 3) {
    result.score += 8;
    result.reasons.push('Excessive use of CAPITAL LETTERS');
  }
  
  // Multiple exclamation/question marks
  if (/[!?]{3,}/.test(text)) {
    result.score += 5;
    result.reasons.push('Excessive punctuation (!!!, ???)');
  }
  
  return result;
}

// ============================================================
// EMAIL ANALYSIS
// ============================================================

export function analyzeEmail(emailAddress) {
  const result = { suspicious: false, reasons: [], score: 0 };
  const lower = emailAddress.toLowerCase();
  const [localPart, domain] = lower.split('@');
  
  if (!domain) return result;
  
  // Check trusted domains
  if (TRUSTED_DOMAINS.some(d => domain === d || domain.endsWith(`.${d}`))) {
    result.reasons.push(`Email from trusted domain: ${domain}`);
    result.score -= 10;
    return result;
  }
  
  // Free email providers sending "official" looking mail
  const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com', 'ymail.com'];
  if (freeProviders.includes(domain)) {
    // Check if the local part tries to impersonate
    const impersonation = ['sbi', 'hdfc', 'icici', 'rbi', 'gov', 'official', 'bank', 'support', 'helpdesk', 'customercare'];
    const impersonating = impersonation.filter(imp => localPart.includes(imp));
    if (impersonating.length > 0) {
      result.suspicious = true;
      result.score += 25;
      result.reasons.push(`Free email impersonating: ${impersonating.join(', ')} (real institutions use official domains)`);
    }
  }
  
  // Suspicious domain patterns
  if (/\d{3,}/.test(domain)) {
    result.suspicious = true;
    result.score += 10;
    result.reasons.push('Domain contains suspicious number sequence');
  }
  
  // Lookalike domains
  const lookalikes = {
    'sbi': ['sbi-online', 'sbionline', 'sbi-bank', 'sbi-secure'],
    'hdfc': ['hdfc-online', 'hdfcbanking', 'hdfc-secure'],
    'icici': ['icici-online', 'icicibanking', 'icici-secure'],
    'paytm': ['paytm-support', 'paytmcash', 'paytm-refund'],
  };
  for (const [brand, fakes] of Object.entries(lookalikes)) {
    if (fakes.some(f => domain.includes(f))) {
      result.suspicious = true;
      result.score += 20;
      result.reasons.push(`Domain looks like a fake ${brand.toUpperCase()} domain`);
    }
  }
  
  return result;
}

// ============================================================
// COMBO SIGNAL DETECTION
// ============================================================

function detectComboSignals(keywordMatches, behaviorSignals, urlResults, bankAnalysis, fakeNewsAnalysis) {
  const combos = [];
  
  const hasOTP = keywordMatches.high.some(k => k.includes('otp'));
  const hasUrgency = 'urgency' in behaviorSignals;
  const hasAuthority = 'authority' in behaviorSignals;
  const hasFear = 'fear' in behaviorSignals;
  const hasGreed = 'greed' in behaviorSignals;
  const hasSuspiciousURL = urlResults.some(u => u.suspiciousPatterns > 0);
  const hasBankKeyword = keywordMatches.low.some(k => ['bank', 'transaction', 'account'].includes(k));
  const hasURL = urlResults.length > 0;
  
  // OTP + urgency = classic phishing
  if (hasOTP && hasUrgency) {
    combos.push({ boost: 25, reason: 'OTP request with urgency language — classic phishing pattern' });
  }
  
  // OTP + banking = bank fraud
  if (hasOTP && hasBankKeyword) {
    combos.push({ boost: 18, reason: 'OTP request in banking context — possible bank fraud attempt' });
  }
  
  // Authority + fear = government scam
  if (hasAuthority && hasFear) {
    combos.push({ boost: 22, reason: 'Authority impersonation + fear tactics — government scam pattern' });
  }
  
  // Greed + suspicious URL = lottery scam
  if (hasGreed && hasSuspiciousURL) {
    combos.push({ boost: 22, reason: 'Prize/reward bait with suspicious link — lottery/phishing scam' });
  }
  
  // Fear + link = phishing
  if (hasFear && hasURL) {
    combos.push({ boost: 15, reason: 'Fear-inducing message with link — likely phishing attempt' });
  }
  
  // Urgency + fear + authority = triple threat
  if (hasUrgency && hasFear && hasAuthority) {
    combos.push({ boost: 15, reason: 'Triple threat: urgency + fear + authority — highly sophisticated scam' });
  }
  
  // Bank SMS with links is suspicious
  if (bankAnalysis && bankAnalysis.suspicious) {
    combos.push({ boost: 15, reason: 'Bank-style message with suspicious elements (links/OTP requests)' });
  }
  
  // Forwarded + sensational = fake news
  if (fakeNewsAnalysis && fakeNewsAnalysis.isForwarded && fakeNewsAnalysis.sensationalSignals.length > 0) {
    combos.push({ boost: 12, reason: 'Forwarded message with sensational claims — likely misinformation' });
  }
  
  // OTP + fear = severe
  if (hasOTP && hasFear) {
    combos.push({ boost: 20, reason: 'OTP request with fear/threats — severe phishing indicator' });
  }
  
  return combos;
}

// ============================================================
// MAIN ANALYSIS FUNCTION
// ============================================================

export function analyzeInput(input, moduleOverride = null) {
  const text = input.trim();
  if (!text) return null;
  
  const inputType = moduleOverride || detectInputType(text);
  const keywordMatches = analyzeKeywords(text);
  const behaviorSignals = analyzeBehavior(text);
  const urlResults = analyzeURLs(text);
  const upiResults = analyzeUPI(text);
  const bankAnalysis = analyzeBankSMS(text);
  const fakeNewsAnalysis = analyzeFakeNews(text);
  const emailAnalysis = inputType === 'email' ? analyzeEmail(text) : null;
  const comboSignals = detectComboSignals(keywordMatches, behaviorSignals, urlResults, bankAnalysis, fakeNewsAnalysis);
  
  let score = 0;
  const reasons = [];
  
  // -------- Keyword scoring --------
  // Deduplicate: only count unique signals
  const uniqueHigh = [...new Set(keywordMatches.high)];
  const uniqueMedium = [...new Set(keywordMatches.medium)];
  
  score += Math.min(uniqueHigh.length * 10, 40);   // Cap at 40
  score += Math.min(uniqueMedium.length * 5, 20);   // Cap at 20
  score += Math.min(keywordMatches.low.length * 1, 5); // Cap at 5
  
  if (uniqueHigh.length > 0) {
    reasons.push(`🔴 High-risk keywords: ${uniqueHigh.slice(0, 4).join(', ')}`);
  }
  if (uniqueMedium.length > 0) {
    reasons.push(`🟡 Suspicious keywords: ${uniqueMedium.slice(0, 3).join(', ')}`);
  }
  
  // -------- Behavior scoring --------
  const behaviorCount = Object.keys(behaviorSignals).length;
  for (const [signal, words] of Object.entries(behaviorSignals)) {
    const signalLabels = {
      urgency: '⏰ Urgency language detected',
      fear: '😰 Fear/intimidation tactics used',
      authority: '👔 Authority impersonation detected',
      greed: '🎁 Prize/reward bait detected',
    };
    score += Math.min(words.length * 6, 18); // Cap per signal
    reasons.push(signalLabels[signal] || `${signal} signal detected`);
  }
  
  // -------- URL scoring --------
  for (const urlResult of urlResults) {
    if (urlResult.isTrusted) {
      score -= 15;
      reasons.push(`✅ Trusted domain: ${urlResult.url.substring(0, 50)}`);
    } else if (urlResult.suspiciousPatterns > 0) {
      score += Math.min(urlResult.suspiciousPatterns * 8, 25);
      reasons.push(`🔗 Suspicious URL: ${urlResult.url.substring(0, 50)}${urlResult.url.length > 50 ? '...' : ''}`);
      urlResult.issues.forEach(issue => reasons.push(`  ↳ ${issue}`));
    }
  }
  
  // -------- UPI scoring --------
  for (const upiResult of upiResults) {
    if (upiResult.suspicious) {
      score += 15;
      reasons.push(`💳 Suspicious UPI ID: ${upiResult.upi}`);
      upiResult.issues?.forEach(issue => reasons.push(`  ↳ ${issue}`));
    }
  }
  
  // -------- Bank SMS scoring --------
  if (bankAnalysis.isBank) {
    if (bankAnalysis.suspicious) {
      score += 20;
      bankAnalysis.reasons.forEach(r => reasons.push(`🏦 ${r}`));
    } else if (bankAnalysis.type) {
      reasons.push(`🏦 Legitimate bank ${bankAnalysis.type} alert detected`);
      if (bankAnalysis.amount) reasons.push(`  ↳ Amount: ₹${bankAnalysis.amount.toLocaleString()}`);
      score -= 10;
    }
  }
  
  // -------- Fake News scoring --------
  if (fakeNewsAnalysis.score > 0) {
    score += Math.min(fakeNewsAnalysis.score, 30);
    fakeNewsAnalysis.reasons.forEach(r => reasons.push(`📰 ${r}`));
  }
  
  // -------- Email scoring --------
  if (emailAnalysis) {
    score += emailAnalysis.score;
    emailAnalysis.reasons.forEach(r => reasons.push(`📧 ${r}`));
  }
  
  // -------- Combo scoring --------
  for (const combo of comboSignals) {
    score += combo.boost;
    reasons.push(`⚡ ${combo.reason}`);
  }
  
  // -------- OTP number in text --------
  const otpMatches = text.match(REGEX_PATTERNS.otp);
  if (otpMatches && keywordMatches.high.some(k => k.includes('otp'))) {
    score += 8;
    reasons.push('🔢 Actual OTP number found in message');
  }
  
  // -------- PAN / Aadhaar in text --------
  if (REGEX_PATTERNS.panCard.test(text)) {
    score += 5;
    reasons.push('🪪 PAN card number detected in message');
  }
  if (REGEX_PATTERNS.aadhaar.test(text)) {
    score += 5;
    reasons.push('🪪 Aadhaar number detected in message');
  }
  
  // -------- Pure URL input --------
  if (inputType === 'url') {
    const suspCount = SUSPICIOUS_URL_PATTERNS.filter(p => p.test(text)).length;
    if (suspCount > 0) {
      score += suspCount * 6;
      if (!reasons.some(r => r.includes('URL'))) {
        reasons.push('🔗 Suspicious URL pattern detected');
      }
    }
    // Check if URL is trusted
    const isTrusted = TRUSTED_DOMAINS.some(d => text.toLowerCase().includes(d));
    if (isTrusted) score -= 20;
  }
  
  // -------- Pure UPI input --------
  if (inputType === 'upi') {
    const isSuspicious = SUSPICIOUS_UPI.some(p => p.test(text));
    if (isSuspicious) {
      score += 18;
      if (!reasons.some(r => r.includes('UPI'))) reasons.push('💳 Suspicious UPI ID pattern');
    }
  }
  
  // -------- Clamp & classify --------
  score = Math.max(0, Math.min(99, score));
  
  if (reasons.length === 0) {
    score = Math.min(score, 5);
    reasons.push('✅ No suspicious patterns detected');
  }
  
  let level, explanation, action;
  if (score >= 60) {
    level = 'High';
    explanation = 'This input shows multiple strong indicators of fraud or scam. Exercise extreme caution and do not interact with this content.';
    action = '🚨 Do NOT click any links. Do NOT share OTP or personal details. Call 1930 (National Cyber Crime Helpline) immediately. Report at cybercrime.gov.in';
  } else if (score >= 30) {
    level = 'Medium';
    explanation = 'This input shows some suspicious patterns that warrant caution. Verify independently before taking any action.';
    action = '⚠️ Verify this independently. Do not click links or share information. Contact your bank directly using official numbers if this claims to be from them.';
  } else {
    level = 'Safe';
    explanation = 'This input appears safe with no major fraud indicators. Always remain vigilant with personal information.';
    action = '✅ This appears safe. Remember: never share OTP, PIN, or passwords with anyone — even bank officials.';
  }
  
  return {
    score,
    level,
    reasons,
    explanation,
    action,
    inputType,
    details: {
      keywordMatches,
      behaviorSignals,
      urlResults,
      upiResults,
      comboSignals,
      bankAnalysis,
      fakeNewsAnalysis,
      emailAnalysis,
    },
    timestamp: new Date().toISOString(),
  };
}

// ============================================================
// MODULE NAME MAPPING
// ============================================================

export function getModuleName(inputType) {
  const moduleMap = {
    url: '🌐 URL Scanner',
    upi: '💳 UPI Checker',
    email: '📧 Email Analyzer',
    phone: '📱 Phone Checker',
    message: '📩 Message Scanner',
    bankSms: '🏦 Bank SMS Analyzer',
    news: '📰 Fake News Detector',
    voice: '🎙️ Voice Scanner',
    deepfake: '🎥 Deepfake Detector',
    transaction: '💸 Transaction Risk',
  };
  return moduleMap[inputType] || '📩 Message Scanner';
}
