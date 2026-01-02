// XMarks - Background Service Worker
// Restricts x.com to bookmarks and your profile during focus hours

const BOOKMARKS_URL = "https://x.com/i/bookmarks";

// Focus hours configuration
const FOCUS_START = { hour: 7, minute: 0 };
const FOCUS_END = { hour: 22, minute: 0 };
const BREAK_START = { hour: 13, minute: 30 };
const BREAK_END = { hour: 15, minute: 0 };

// Cache for username
let cachedUsername = null;

// Load username from storage
async function loadUsername() {
  try {
    const result = await browser.storage.local.get("username");
    cachedUsername = result.username || null;
  } catch (e) {
    cachedUsername = null;
  }
}

// Listen for storage changes
browser.storage.onChanged.addListener((changes) => {
  if (changes.username) {
    cachedUsername = changes.username.newValue || null;
  }
});

// Initial load
loadUsername();

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

function isAllowedPage(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    // Check if it's x.com or twitter.com
    if (hostname !== "x.com" && hostname !== "twitter.com" &&
        hostname !== "www.x.com" && hostname !== "www.twitter.com") {
      return true;
    }

    // Allow bookmarks page
    if (pathname.startsWith("/i/bookmarks")) {
      return true;
    }

    // Allow user's profile if configured
    if (cachedUsername) {
      const profilePath = "/" + cachedUsername.toLowerCase();
      const currentPath = pathname.toLowerCase();

      // Allow exact profile match or profile subpages
      if (currentPath === profilePath || currentPath.startsWith(profilePath + "/")) {
        return true;
      }
    }

    // Allow necessary API/resource paths
    if (pathname.startsWith("/i/api") ||
        pathname.startsWith("/sw.js") ||
        pathname.startsWith("/manifest.json")) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

function shouldRedirect(url) {
  return isWithinFocusHours() && !isAllowedPage(url);
}

// Handle navigation events
browser.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;

  if (shouldRedirect(details.url)) {
    browser.tabs.update(details.tabId, { url: BOOKMARKS_URL });
  }
}, {
  url: [
    { hostContains: "x.com" },
    { hostContains: "twitter.com" }
  ]
});

// Handle SPA navigation
browser.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId !== 0) return;

  if (shouldRedirect(details.url)) {
    browser.tabs.update(details.tabId, { url: BOOKMARKS_URL });
  }
}, {
  url: [
    { hostContains: "x.com" },
    { hostContains: "twitter.com" }
  ]
});

console.log("XMarks extension loaded");
