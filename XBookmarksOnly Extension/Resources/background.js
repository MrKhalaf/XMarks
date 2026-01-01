// X Bookmarks Only - Background Service Worker
// Restricts x.com to bookmarks only during focus hours

const BOOKMARKS_URL = "https://x.com/i/bookmarks";

// Focus hours configuration
// Restricted: 7:00 AM - 10:00 PM (22:00)
// Break (unrestricted): 1:30 PM - 3:00 PM (13:30 - 15:00)
const FOCUS_START = { hour: 7, minute: 0 };    // 7:00 AM
const FOCUS_END = { hour: 22, minute: 0 };     // 10:00 PM
const BREAK_START = { hour: 13, minute: 30 };  // 1:30 PM
const BREAK_END = { hour: 15, minute: 0 };     // 3:00 PM

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

  // Check if within focus hours (7am-10pm)
  const inFocusHours = currentMinutes >= focusStartMinutes && currentMinutes < focusEndMinutes;

  // Check if within break time (1:30pm-3pm)
  const inBreakTime = currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes;

  // Return true if in focus hours AND not in break time
  return inFocusHours && !inBreakTime;
}

function isBookmarksPage(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    // Check if it's x.com or twitter.com
    if (hostname !== "x.com" && hostname !== "twitter.com" &&
        hostname !== "www.x.com" && hostname !== "www.twitter.com") {
      return true; // Not X, allow it
    }

    // Allow bookmarks page and its sub-paths
    if (pathname.startsWith("/i/bookmarks")) {
      return true;
    }

    // Allow necessary API/resource paths for bookmarks to work
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
  return isWithinFocusHours() && !isBookmarksPage(url);
}

// Handle navigation events
browser.webNavigation.onBeforeNavigate.addListener((details) => {
  // Only handle main frame navigation
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

// Handle URL changes within the same page (SPA navigation)
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

// Log when extension loads
console.log("X Bookmarks Only extension loaded");
console.log("Focus hours: 7:00 AM - 10:00 PM");
console.log("Break time: 1:30 PM - 3:00 PM");
