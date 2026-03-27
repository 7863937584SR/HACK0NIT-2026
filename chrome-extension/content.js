let activeOverlay = null;

function removeOverlay() {
  if (activeOverlay) {
    activeOverlay.remove();
    activeOverlay = null;
  }
}

function buildOverlay(targetUrl, decision, onProceed) {
  removeOverlay();

  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.inset = "0";
  root.style.zIndex = "2147483647";
  root.style.background = "rgba(8, 10, 20, 0.78)";
  root.style.backdropFilter = "blur(3px)";
  root.style.display = "flex";
  root.style.alignItems = "center";
  root.style.justifyContent = "center";
  root.style.padding = "20px";

  const card = document.createElement("div");
  card.style.width = "100%";
  card.style.maxWidth = "520px";
  card.style.background = "#12162a";
  card.style.border = "1px solid rgba(244,63,94,0.35)";
  card.style.borderRadius = "14px";
  card.style.boxShadow = "0 24px 56px rgba(0,0,0,0.55)";
  card.style.color = "#f2f5ff";
  card.style.fontFamily = "Segoe UI, Arial, sans-serif";
  card.style.padding = "18px";

  const heading = document.createElement("h2");
  heading.textContent = "Suspicious Link Blocked";
  heading.style.margin = "0 0 8px";
  heading.style.fontSize = "21px";
  heading.style.color = "#ff637f";

  const subtitle = document.createElement("p");
  subtitle.textContent = `Risk score: ${decision.score}. Sentinel prevented this link from opening.`;
  subtitle.style.margin = "0 0 12px";
  subtitle.style.fontSize = "14px";
  subtitle.style.color = "#c9d2ff";

  const urlBlock = document.createElement("div");
  urlBlock.style.background = "rgba(255,255,255,0.05)";
  urlBlock.style.border = "1px solid rgba(255,255,255,0.12)";
  urlBlock.style.borderRadius = "10px";
  urlBlock.style.padding = "10px";
  urlBlock.style.fontSize = "12px";
  urlBlock.style.wordBreak = "break-all";
  urlBlock.textContent = targetUrl;

  const reasonTitle = document.createElement("p");
  reasonTitle.textContent = "Why this was blocked:";
  reasonTitle.style.margin = "14px 0 8px";
  reasonTitle.style.fontWeight = "700";

  const reasonList = document.createElement("ul");
  reasonList.style.margin = "0 0 14px";
  reasonList.style.paddingLeft = "18px";
  reasonList.style.fontSize = "13px";
  reasonList.style.lineHeight = "1.45";

  (decision.reasons.length ? decision.reasons : ["Potential phishing risk"]).forEach((r) => {
    const li = document.createElement("li");
    li.textContent = r;
    reasonList.appendChild(li);
  });

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = "10px";
  actions.style.flexWrap = "wrap";

  const stayBtn = document.createElement("button");
  stayBtn.textContent = "Stay Safe";
  stayBtn.style.flex = "1";
  stayBtn.style.minWidth = "150px";
  stayBtn.style.padding = "10px 12px";
  stayBtn.style.borderRadius = "10px";
  stayBtn.style.border = "1px solid rgba(255,255,255,0.2)";
  stayBtn.style.background = "#1f2742";
  stayBtn.style.color = "#f5f8ff";
  stayBtn.style.cursor = "pointer";
  stayBtn.onclick = removeOverlay;

  const proceedBtn = document.createElement("button");
  proceedBtn.textContent = "Open Anyway";
  proceedBtn.style.flex = "1";
  proceedBtn.style.minWidth = "150px";
  proceedBtn.style.padding = "10px 12px";
  proceedBtn.style.borderRadius = "10px";
  proceedBtn.style.border = "1px solid rgba(255,99,127,0.5)";
  proceedBtn.style.background = "#3f1321";
  proceedBtn.style.color = "#ffb2c1";
  proceedBtn.style.cursor = "pointer";
  proceedBtn.onclick = () => {
    removeOverlay();
    onProceed();
  };

  actions.appendChild(stayBtn);
  actions.appendChild(proceedBtn);

  card.appendChild(heading);
  card.appendChild(subtitle);
  card.appendChild(urlBlock);
  card.appendChild(reasonTitle);
  card.appendChild(reasonList);
  card.appendChild(actions);
  root.appendChild(card);

  root.addEventListener("click", (e) => {
    if (e.target === root) removeOverlay();
  });

  document.documentElement.appendChild(root);
  activeOverlay = root;
}

async function scanLink(url) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "SCAN_URL", url }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        resolve({ safe: true, score: 0, reasons: ["Scanner unavailable"] });
        return;
      }
      resolve(response.decision);
    });
  });
}

async function gateNavigation(targetUrl, onProceed) {
  const decision = await scanLink(targetUrl);
  if (decision.safe) {
    onProceed();
    return;
  }
  buildOverlay(targetUrl, decision, onProceed);
}

function shouldHandleUrl(href) {
  if (!href) return false;
  return href.startsWith("http://") || href.startsWith("https://");
}

document.addEventListener(
  "click",
  (e) => {
    const anchor = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!anchor) return;

    const href = anchor.href;
    if (!shouldHandleUrl(href)) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    gateNavigation(href, () => {
      window.location.assign(href);
    });
  },
  true
);

document.addEventListener(
  "auxclick",
  (e) => {
    if (e.button !== 1) return;
    const anchor = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!anchor) return;

    const href = anchor.href;
    if (!shouldHandleUrl(href)) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    gateNavigation(href, () => {
      window.open(href, "_blank", "noopener,noreferrer");
    });
  },
  true
);
