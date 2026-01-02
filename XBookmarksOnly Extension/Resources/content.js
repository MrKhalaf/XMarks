// XMarks - Content Script
// Handles client-side navigation and link clicks

const BOOKMARKS_URL = "https://x.com/i/bookmarks";

// Focus hours configuration (must match background.js)
const FOCUS_START = { hour: 7, minute: 0 };
const FOCUS_END = { hour: 22, minute: 0 };
const BREAK_START = { hour: 13, minute: 30 };
const BREAK_END = { hour: 15, minute: 0 };

// Cached username
let cachedUsername = null;

// Load username from storage
browser.storage.local.get("username").then((result) => {
  cachedUsername = result.username || null;
}).catch(() => {
  cachedUsername = null;
});

// Listen for storage changes
browser.storage.onChanged.addListener((changes) => {
  if (changes.username) {
    cachedUsername = changes.username.newValue || null;
  }
});

function timeToMinutes(hour, minute) {
  return hour * 60 + minute;
}

function isWithinFocusHours() {
  const now = new Date();
  const currentMinutes = timeToMinutes(now.getHours(), now.getMinutes());

  const focusStartMinutes = timeToMinutes(FOCUS_START.hour, FOCUS_START.minute);
  const focusEndMinutes = timeToMinutes(FOCUS_END.hour, FOCUS_END.minute);
  const breakStartMinutes = timeToMinutes(BREAK_START.hour, BREAK_START.minute);
  const breakEndMinutes = timeToMinutes(BREAK_END.hour, BREAK_END.minute);

  const inFocusHours = currentMinutes >= focusStartMinutes && currentMinutes < focusEndMinutes;
  const inBreakTime = currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes;

  return inFocusHours && !inBreakTime;
}

function isAllowedPath(pathname) {
  // Allow bookmarks
  if (pathname.startsWith("/i/bookmarks")) {
    return true;
  }

  // Allow user's profile if configured
  if (cachedUsername) {
    const profilePath = "/" + cachedUsername.toLowerCase();
    const currentPath = pathname.toLowerCase();

    if (currentPath === profilePath || currentPath.startsWith(profilePath + "/")) {
      return true;
    }
  }

  return false;
}

function shouldBlock() {
  const pathname = window.location.pathname;
  return isWithinFocusHours() && !isAllowedPath(pathname);
}

function checkAndRedirect() {
  if (shouldBlock()) {
    window.location.replace(BOOKMARKS_URL);
  }
}

// Initial check (with small delay to allow storage to load)
setTimeout(checkAndRedirect, 100);

// Monitor for SPA navigation
let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    checkAndRedirect();
  }
});

observer.observe(document.documentElement, {
  subtree: true,
  childList: true
});

// Listen for popstate (back/forward navigation)
window.addEventListener("popstate", checkAndRedirect);

// Intercept link clicks
document.addEventListener("click", (e) => {
  if (!isWithinFocusHours()) return;

  const link = e.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  // Check if it's an internal X link that's not allowed
  if (href.startsWith("/") && !isAllowedPath(href)) {
    e.preventDefault();
    e.stopPropagation();
    window.location.replace(BOOKMARKS_URL);
  }
}, true);

console.log("XMarks content script loaded");
