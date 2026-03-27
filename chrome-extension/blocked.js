function decodePayload() {
  const raw = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
  }
}

function renderReasons(reasons) {
  const list = document.getElementById("reasonList");
  if (!list) {
    return;
  }

  const finalReasons = Array.isArray(reasons) && reasons.length
    ? reasons
    : ["Potential phishing risk detected"];

  list.innerHTML = "";
  finalReasons.forEach((reason) => {
    const li = document.createElement("li");
    li.textContent = reason;
    list.appendChild(li);
  });
}

async function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolve(response || { ok: false, error: "No response" });
    });
  });
}

function init() {
  const payload = decodePayload();
  const targetUrl = payload?.targetUrl || "Unknown URL";
  const tabId = Number(payload?.tabId);
  const score = Number(payload?.score);

  setText("targetUrl", targetUrl);
  setText("riskScore", Number.isFinite(score) ? String(score) : "-");
  renderReasons(payload?.reasons);

  const proceedBtn = document.getElementById("proceedBtn");
  const stayBtn = document.getElementById("stayBtn");

  if (proceedBtn) {
    proceedBtn.addEventListener("click", async () => {
      if (!Number.isInteger(tabId) || tabId < 0 || !/^https?:\/\//i.test(targetUrl)) {
        setText("subText", "Unable to continue: invalid link context.");
        return;
      }

      setText("subText", "Proceeding once for this link...");
      const result = await sendMessage({
        type: "PROCEED_TO_URL",
        tabId,
        targetUrl,
      });

      if (!result.ok) {
        setText("subText", `Unable to open link: ${result.error || "unknown error"}`);
      }
    });
  }

  if (stayBtn) {
    stayBtn.addEventListener("click", async () => {
      if (!Number.isInteger(tabId) || tabId < 0) {
        window.location.replace("about:blank");
        return;
      }

      await sendMessage({
        type: "STAY_SAFE",
        tabId,
      });
    });
  }
}

init();
