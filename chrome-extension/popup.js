const DEFAULT_SETTINGS = {
  enabled: true,
  strictMode: true,
  allowlist: [],
};

const enabledEl = document.getElementById("enabled");
const strictModeEl = document.getElementById("strictMode");
const allowlistEl = document.getElementById("allowlist");
const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");

function setStatus(text) {
  statusEl.textContent = text;
  setTimeout(() => {
    statusEl.textContent = "";
  }, 1800);
}

function normalizeAllowlist(raw) {
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function loadSettings() {
  const data = await chrome.storage.sync.get("settings");
  const settings = data.settings || DEFAULT_SETTINGS;

  enabledEl.checked = !!settings.enabled;
  strictModeEl.checked = !!settings.strictMode;
  allowlistEl.value = (settings.allowlist || []).join(", ");
}

async function saveSettings() {
  const settings = {
    enabled: enabledEl.checked,
    strictMode: strictModeEl.checked,
    allowlist: normalizeAllowlist(allowlistEl.value),
  };

  await chrome.storage.sync.set({ settings });
  setStatus("Saved");
}

saveBtn.addEventListener("click", saveSettings);
loadSettings();
