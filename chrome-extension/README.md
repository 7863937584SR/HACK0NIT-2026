# Sentinel Link Shield (Chrome Extension)

This extension scans browser navigations before the destination fully opens.

## What It Does

- Scans top-level HTTP/HTTPS navigations (link clicks, address-bar navigation in tabs, script-triggered top-level navigations)
- Scores each URL for phishing risk
- Allows safe links
- Blocks risky links with a dedicated warning page and reason list
- Lets user override and open risky links once

## Load In Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder: `chrome-extension`

## Settings

Open extension popup:

- **Protection Enabled**: On/off scanning
- **Strict Mode**: Lower threshold, more blocking
- **Allowlist**: Domains always allowed

## Notes

- Protection is applied at tab navigation level, not raw packet/network level.
- Browser-internal pages and some extension/system URLs are not scanned.
- For full enterprise network enforcement, additional managed browser policy is required.
