# XMarks

A Safari extension that restricts X.com to bookmarks and your profile during focus hours.

## Schedule

- **Restricted:** 7:00 AM – 10:00 PM (redirects to bookmarks)
- **Break:** 1:30 PM – 3:00 PM (full access)
- **Off hours:** 10:00 PM – 7:00 AM (full access)

## Installation

1. Open the Xcode project in `XBookmarksOnly/`
2. Sign with your Apple ID (Signing & Capabilities > Team)
3. Build and run (Cmd+R)
4. Enable in Safari > Settings > Extensions

## Configuration

After installing, right-click the extension icon in Safari and select "Settings" to add your X username. This allows you to access your own profile in addition to bookmarks.

## Customizing Hours

Edit the time constants in `background.js` and `content.js`:

```javascript
const FOCUS_START = { hour: 7, minute: 0 };
const FOCUS_END = { hour: 22, minute: 0 };
const BREAK_START = { hour: 13, minute: 30 };
const BREAK_END = { hour: 15, minute: 0 };
```
