// ============================================================
// DIGITAL BANDHU — SENTINEL AI: PATTERN DATABASE
// Comprehensive Indian fraud detection patterns
// ============================================================

// Scam keyword lists with weights
// NOTE: Multi-word phrases are matched with includes()
// Single words are matched with word boundaries to avoid false positives
export const SCAM_KEYWORDS = {
  high: [
    // OTP scams
    'otp', 'one time password', 'verify your account', 'account blocked',
    'share otp', 'send otp', 'verify otp', 'enter otp',
    // KYC scams
    'kyc update', 'kyc expired', 'kyc verification', 'complete kyc',
    'pan card link', 'link aadhaar', 'aadhar update', 'pan verify',
    // Account threats
    'account suspended', 'account deactivated', 'account frozen',
    'wallet blocked', 'upi blocked', 'card blocked',
    // Lottery/prize scams
    'lottery', 'congratulations you won', 'you have won', 'prize winner',
    'jackpot', 'lucky winner', 'selected winner', 'lucky draw',
    'claim your prize', 'claim now', 'cash prize', 'free gift',
    // Investment scams
    'bitcoin investment', 'double your money', 'guaranteed return',
    'earn daily', 'work from home earn', 'investment opportunity',
    'high return', 'risk free investment', 'forex trading join',
    // Urgency threats
    'act immediately', 'last chance', 'limited time offer',
    'click below to verify', 'update immediately', 'respond immediately',
    // Legal threats
    'arrest warrant', 'money laundering', 'illegal transaction',
    'court order', 'legal notice', 'police complaint',
    // Job scams
    'part time job', 'data entry job', 'typing job', 'earn from home',
    'daily payment', 'weekly salary',
    // Impersonation
    'customer care number', 'toll free number', 'helpdesk number',
  ],
  medium: [
    // Generic urgency
    'urgent', 'important notice', 'action required',
    'security alert', 'unauthorized access', 'suspicious activity',
    // Verification requests
    'confirm your identity', 'verify your details', 'update your details',
    'confirm your details',
    // Payment related
    'payment pending', 'payment failed', 'payment declined',
    'refund initiated', 'refund pending', 'cashback credited',
    'loan approved', 'pre-approved loan', 'credit limit increase',
    'emi bounce', 'overdue payment',
    // Generic phishing
    'dear customer', 'dear user', 'valued customer', 'dear account holder',
    'click here', 'tap here', 'click link', 'click now', 'click below',
    'visit link', 'open link',
    // Social engineering
    'whatsapp group', 'telegram group', 'join now', 'join free',
    'limited seats', 'exclusive offer', 'special discount',
    'today only', 'hurry up', 'dont miss',
    // Forwarding signals
    'forwarded many times', 'share with everyone', 'send to all contacts',
    'forward this message', 'share this to',
  ],
  low: [
    'bank', 'transaction', 'transfer', 'credit', 'debit',
    'balance', 'statement', 'account', 'password',
    'login', 'register', 'amount',
  ]
};

// Hindi/Hinglish scam keywords (matched with word boundaries)
export const HINDI_SCAM_KEYWORDS = [
  'otp bhejein', 'otp batao', 'otp dijiye', 'otp share karo',
  'turant karo', 'jaldi karo', 'abhi karo',
  'lottery jeeta', 'lottery jeet', 'inaam jeeta', 'inaam mila',
  'paisa double', 'paisa kamao', 'ghar baithe kamao',
  'khata band', 'account band', 'kyc karo', 'kyc update karo',
  'link karo', 'verify karo', 'aadhar link',
  'aakhri mauka', 'antim avsar',
  'giraftaar', 'giraftari', 'kanuni karyavahi', 'kanuni notice',
  'police case', 'fir darj',
  'income tax notice', 'ed notice', 'cbi notice',
  'muft', 'free mein', 'bilkul free',
  'naukri', 'job mil gayi', 'job opportunity',
];

// URL patterns that indicate suspicious links
export const SUSPICIOUS_URL_PATTERNS = [
  // URL shorteners (commonly abused)
  /bit\.ly/i, /tinyurl\.com/i, /goo\.gl/i, /t\.co/i,
  /is\.gd/i, /buff\.ly/i, /ow\.ly/i, /short\.link/i,
  /rb\.gy/i, /cutt\.ly/i, /shorturl\.at/i, /tiny\.cc/i,
  /clck\.ru/i, /shrtco\.de/i,
  // IP-based URLs
  /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
  // @ in URL (redirect trick)
  /https?:\/\/[^/]*@/,
  // Free/suspicious TLDs
  /\.[a-z]+\.(tk|ml|ga|cf|gq|buzz|top|club|xyz|online|site|store|fun|icu|cam)\b/i,
  /\.(tk|ml|ga|cf|gq)\//i,
  // Typosquatting / lookalike banking domains
  /sbi[^.]*\.(com|net|org|info|xyz|top)/i,
  /hdfc[^.]*\.(net|org|info|xyz|top)/i,
  /icici[^.]*\.(net|org|info|xyz|top)/i,
  /axis[^.]*\.(net|org|info|xyz|top)/i,
  /kotak[^.]*\.(net|org|info|xyz|top)/i,
  /paytm[^.]*\.(xyz|top|club|online|site)/i,
  /phonepe[^.]*\.(xyz|top|club|online|site)/i,
  /razorpay[^.]*\.(xyz|top|club|online|site)/i,
  // Phishing patterns in URL
  /login[.\-_]?verify/i, /verify[.\-_]?login/i,
  /secure[.\-_]?update/i, /update[.\-_]?secure/i,
  /account[.\-_]?verify/i, /confirm[.\-_]?identity/i,
  /banking[.\-_]?secure/i, /netbanking[.\-_]?update/i,
  // Known phishing hosts
  /\.blogspot\./i, /\.wordpress\.com/i, /\.wixsite\.com/i,
  /\.weebly\.com/i, /\.000webhostapp\.com/i,
  // Encoded characters (obfuscation)
  /%[0-9a-f]{2}.*%[0-9a-f]{2}/i,
  // Very long subdomain (suspicious)
  /https?:\/\/[a-z0-9-]{30,}\./i,
];

// Regex matchers
export const REGEX_PATTERNS = {
  url: /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi,
  upi: /[a-zA-Z0-9._-]+@[a-zA-Z]{2,}/gi,
  phone: /(?:\+91[\-\s]?)?[6-9]\d{9}/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  otp: /\b\d{4,6}\b/g,
  amount: /(?:Rs\.?|₹|INR)\s?\d+[,.\d]*/gi,
  panCard: /[A-Z]{5}\d{4}[A-Z]/g,
  aadhaar: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
  bankAccount: /\b\d{9,18}\b/g,
  ifsc: /[A-Z]{4}0[A-Z0-9]{6}/g,
};

// Trusted domains (reduce score significantly)
export const TRUSTED_DOMAINS = [
  // Banks
  'rbi.org.in', 'sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com',
  'hdfcbank.com', 'icicibank.com', 'axisbank.com', 'axisbank.co.in',
  'kotak.com', 'kotakbank.com', 'bankofbaroda.in', 'bankofbaroda.co.in',
  'pnbindia.in', 'canarabank.com', 'unionbankofindia.co.in',
  'idbibank.in', 'yesbank.in', 'indusind.com', 'federalbank.co.in',
  'iob.in', 'bankofindia.co.in',
  // UPI / Payments
  'npci.org.in', 'bhimupi.org.in',
  'paytm.com', 'phonepe.com', 'gpay.app',
  'razorpay.com', 'billdesk.com', 'ccavenue.com',
  // Government
  'incometaxindia.gov.in', 'cybercrime.gov.in',
  'india.gov.in', 'digitalindia.gov.in', 'uidai.gov.in',
  'epfindia.gov.in', 'mygov.in', 'digilocker.gov.in',
  // Trusted e-commerce / tech
  'google.com', 'microsoft.com', 'amazon.in', 'amazon.com',
  'flipkart.com', 'myntra.com', 'swiggy.com', 'zomato.com',
  'ola.com', 'uber.com',
];

// Suspicious UPI patterns
export const SUSPICIOUS_UPI = [
  /^[a-z]{1,2}\d{6,}@/i,         // Random short prefix + long number
  /^\d+@/i,                       // Starts with numbers
  /lucky/i, /winner/i, /prize/i, /gift/i,
  /refund/i, /cashback/i, /reward/i,
  /paytm.*merchant/i,
  /helpdesk/i, /support/i, /customercare/i,
  /verify/i, /confirm/i,
  /@(ybl|axl|okicici|okhdfcbank|paytm|ibl|upi|apl|pingpay)$/i,  // known valid, but check name part
];

// Valid UPI handles (for reducing false positives)
export const VALID_UPI_HANDLES = [
  '@ybl', '@axl', '@okicici', '@okhdfcbank', '@paytm',
  '@ibl', '@upi', '@apl', '@pingpay', '@sbi', '@oksbi',
  '@okaxis', '@ikwik', '@freecharge', '@hdfcbank',
];

// Behavioral signals (matched with word boundaries)
export const BEHAVIORAL_SIGNALS = {
  urgency: [
    'urgent', 'immediately', 'hurry', 'fast', 'quick', 'asap',
    'last chance', 'limited time', 'act now', 'dont delay',
    'expiring soon', 'expires today', 'only today',
    'turant', 'jaldi', 'abhi',
  ],
  fear: [
    'blocked', 'suspended', 'deactivated', 'frozen', 'terminated',
    'arrest', 'penalty', 'fine imposed', 'legal action', 'court notice',
    'police complaint', 'fir filed', 'illegal',
    'your account will be', 'will be closed', 'will be blocked',
  ],
  authority: [
    'reserve bank', 'rbi order', 'government of india',
    'income tax department', 'customs department',
    'enforcement directorate', 'central bureau',
    'court order', 'ministry of', 'sbi official', 'bank manager',
    'cyber cell', 'cyber police',
  ],
  greed: [
    'you won', 'you have won', 'winner', 'prize',
    'lottery', 'cashback', 'refund of', 'free gift',
    'double your money', 'guaranteed return', 'earn daily',
    'earn lakhs', 'earn thousands', 'high return',
    'bonus credited', 'reward points',
  ],
};

// Indian banking keywords
export const INDIAN_BANKING_KEYWORDS = [
  'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'pnb', 'bob',
  'canara', 'union bank', 'idbi', 'yes bank', 'indusind',
  'federal bank', 'iob', 'boi',
  'upi', 'neft', 'rtgs', 'imps', 'bhim', 'paytm', 'phonepe',
  'gpay', 'google pay', 'amazon pay', 'mobikwik', 'freecharge',
  'rbi', 'npci', 'nach', 'ecs', 'mandate',
  'net banking', 'mobile banking', 'debit card', 'credit card',
  'atm', 'passbook', 'cheque', 'demand draft',
];

// Bank SMS patterns for parsing
export const BANK_SMS_PATTERNS = {
  debit: /(?:debited|withdrawn|spent|paid|sent)\s*(?:rs\.?|₹|inr)\s?([\d,]+\.?\d*)/i,
  credit: /(?:credited|received|deposited|refund)\s*(?:rs\.?|₹|inr)\s?([\d,]+\.?\d*)/i,
  balance: /(?:balance|bal|avl\.? bal)\s*(?:is|:)?\s*(?:rs\.?|₹|inr)\s?([\d,]+\.?\d*)/i,
  upiRef: /(?:upi ref|ref no|txn id|transaction id)[:\s]?\s?(\w+)/i,
  merchant: /(?:to|at|from)\s+([A-Za-z0-9\s]+?)(?:\s+on|\s+ref|\s+upi|$)/i,
};

// Forwarded message indicators
export const FORWARD_INDICATORS = [
  'forwarded', 'fwd:', 'fw:', 'forwarded message',
  'forwarded many times', 'frequently forwarded',
  'share this', 'forward to', 'send to all',
  'spread the word', 'viral', 'breaking news',
  'share with everyone', 'must read', 'must watch',
  'please share', 'pls share', 'share maximum',
];

// Fake news indicators
export const FAKE_NEWS_INDICATORS = {
  sensational: [
    'shocking', 'unbelievable', 'you wont believe', 'mind blowing',
    'exposed', 'scandal', 'leaked', 'secret revealed',
    'breaking', 'just in', 'exclusive',
    'government hiding', 'they dont want you to know',
    'media is hiding', 'banned video', 'deleted video',
  ],
  healthMisinfo: [
    'miracle cure', 'doctors dont want', 'natural remedy',
    'cancer cure found', 'diabetes cure', 'corona cure',
    'vaccine dangerous', 'vaccine side effect death',
    '100% cure', 'guaranteed cure',
  ],
  politicalMisinfo: [
    'war declared', 'country attacked', 'emergency declared',
    'currency banned', 'new note', 'demonetization',
    'internet shutdown', 'curfew imposed',
  ],
};

// Transaction risk thresholds
export const TRANSACTION_RISK = {
  highAmountThreshold: 50000,   // Above 50k INR is high value
  mediumAmountThreshold: 10000, // Above 10k INR is medium value
  suspiciousTimings: [0, 1, 2, 3, 4, 5], // 12am-5am IST
};
