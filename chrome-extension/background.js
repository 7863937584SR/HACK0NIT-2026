const DEFAULT_SETTINGS = {
  enabled: true,
  strictMode: true,
  allowlist: [],
};

const ONE_TIME_ALLOW_MS = 60_000;
const oneTimeAllowByTabUrl = new Map();

const SHORTENER_DOMAINS = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "shorturl.at",
  "cutt.ly",
  "is.gd",
  "rb.gy",
  "lnkd.in",
];

const SUSPICIOUS_KEYWORDS = [
  "verify",
  "secure",
  "login",
  "update",
  "bank",
  "kyc",
  "wallet",
  "otp",
  "gift",
  "prize",
  "lottery",
  "free-money",
  "crypto-double",
  "recover-account",
];

const RISKY_TLDS = ["zip", "xyz", "top", "click", "rest", "work", "gq", "ml", "cf"];

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.sync.get("settings");
  if (!current.settings) {
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  }
});

function isIPAddress(hostname) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

function hasPunycode(hostname) {
  return hostname.includes("xn--");
}

function isWebUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function parseHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isAllowlistedHost(hostname, allowlist) {
  return allowlist.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function tabUrlKey(tabId, url) {
  return `${tabId}|${url}`;
}

function allowOnce(tabId, url) {
  const key = tabUrlKey(tabId, url);
  oneTimeAllowByTabUrl.set(key, true);
  setTimeout(() => {
    oneTimeAllowByTabUrl.delete(key);
  }, ONE_TIME_ALLOW_MS);
}

function consumeOneTimeAllow(tabId, url) {
  const key = tabUrlKey(tabId, url);
  const allowed = oneTimeAllowByTabUrl.get(key);
  if (allowed) {
    oneTimeAllowByTabUrl.delete(key);
    return true;
  }
  return false;
}

function scoreUrl(urlString, strictMode) {
  let score = 0;
  const reasons = [];

  let url;
  try {
    url = new URL(urlString);
  } catch {
    return {
      safe: false,
      score: 100,
      reasons: ["Invalid URL format"],
    };
  }

  const { hostname, pathname, search, protocol } = url;
  const full = `${hostname}${pathname}${search}`.toLowerCase();

  if (!["http:", "https:"].includes(protocol)) {
    score += 80;
    reasons.push("Non-web protocol detected");
  }

  if (protocol === "http:") {
    score += 20;
    reasons.push("Connection is not HTTPS");
  }

  if (isIPAddress(hostname)) {
    score += 35;
    reasons.push("IP-based URL used instead of domain");
  }

  if (hasPunycode(hostname)) {
    score += 30;
    reasons.push("Punycode domain detected (possible lookalike)");
  }

  if (hostname.split(".").length > 4) {
    score += 10;
    reasons.push("Too many subdomains");
  }

  const tld = hostname.split(".").pop();
  if (RISKY_TLDS.includes(tld)) {
    score += 20;
    reasons.push(`High-risk TLD .${tld}`);
  }

  if (SHORTENER_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
    score += 20;
    reasons.push("URL shortener detected");
  }

  if (urlString.length > 140) {
    score += 10;
    reasons.push("Very long URL");
  }

  if (urlString.includes("@")) {
    score += 20;
    reasons.push("@ symbol in URL (possible obfuscation)");
  }

  const keywordHits = SUSPICIOUS_KEYWORDS.filter((k) => full.includes(k));
  if (keywordHits.length) {
    score += Math.min(keywordHits.length * 8, 24);
    reasons.push(`Suspicious terms: ${keywordHits.slice(0, 4).join(", ")}`);
  }

  const threshold = strictMode ? 35 : 55;

  return {
    safe: score < threshold,
    score,
    reasons,
  };
}

async function getSettings() {
  const data = await chrome.storage.sync.get("settings");
  return data.settings || DEFAULT_SETTINGS;
}

async function evaluateUrl(url) {
  const settings = await getSettings();

  if (!settings.enabled) {
    return {
      safe: true,
      score: 0,
      reasons: ["Protection disabled by user"],
    };
  }

  const hostname = parseHostname(url);
  if (isAllowlistedHost(hostname, settings.allowlist || [])) {
    return {
      safe: true,
      score: 0,
      reasons: ["Domain is allowlisted"],
    };
  }

  return scoreUrl(url, settings.strictMode);
}

function buildBlockedPageUrl(tabId, targetUrl, decision) {
  const payload = {
    tabId,
    targetUrl,
    score: decision.score,
    reasons: decision.reasons,
  };

  return `${chrome.runtime.getURL("blocked.html")}#${encodeURIComponent(JSON.stringify(payload))}`;
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0 || details.tabId < 0) {
    return;
  }

  const targetUrl = details.url;
  if (!isWebUrl(targetUrl)) {
    return;
  }

  if (consumeOneTimeAllow(details.tabId, targetUrl)) {
    return;
  }

  evaluateUrl(targetUrl)
    .then((decision) => {
      if (decision.safe) {
        return;
      }

      const blockUrl = buildBlockedPageUrl(details.tabId, targetUrl, decision);
      chrome.tabs.update(details.tabId, { url: blockUrl }).catch(() => {
        // Ignore tab races (tab closed/replaced during navigation).
      });
    })
    .catch(() => {
      // Fail open if scanner has an unexpected runtime problem.
    });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "SCAN_URL") {
    evaluateUrl(message.url)
      .then((decision) => {
        sendResponse({ ok: true, decision });
      })
      .catch((error) => {
        sendResponse({ ok: false, error: String(error) });
      });

    return true;
  }

  if (message?.type === "PROCEED_TO_URL") {
    const tabId = Number(message.tabId);
    const targetUrl = String(message.targetUrl || "");

    if (!Number.isInteger(tabId) || tabId < 0 || !isWebUrl(targetUrl)) {
      sendResponse({ ok: false, error: "Invalid proceed payload" });
      return false;
    }

    allowOnce(tabId, targetUrl);

    chrome.tabs
      .update(tabId, { url: targetUrl })
      .then(() => {
        sendResponse({ ok: true });
      })
      .catch((error) => {
        sendResponse({ ok: false, error: String(error) });
      });

    return true;
  }

  if (message?.type === "STAY_SAFE") {
    const tabId = Number(message.tabId);
    if (!Number.isInteger(tabId) || tabId < 0) {
      sendResponse({ ok: false, error: "Invalid tab id" });
      return false;
    }

    chrome.tabs
      .update(tabId, { url: "about:blank" })
      .then(() => {
        sendResponse({ ok: true });
      })
      .catch((error) => {
        sendResponse({ ok: false, error: String(error) });
      });

    return true;
  }

  return false;
});
