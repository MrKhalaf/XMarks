# XMarks

Safari extension that limits X.com to just bookmarks + your profile during work hours.

## Quick Start

```bash
git clone https://github.com/MrKhalaf/XMarks.git
cd XMarks
open XBookmarksOnly/XBookmarksOnly.xcodeproj
```

1. **Sign it** — Click `XBookmarksOnly` in sidebar → Signing & Capabilities → Select your Apple ID for both targets
2. **Build** — Press `Cmd+R`
3. **Enable** — Safari → Settings → Extensions → Check XMarks
4. **Configure** — Right-click extension icon → Settings → Add your @handle

## Default Schedule

| Time | Access |
|------|--------|
| 7am–1:30pm | Bookmarks + profile only |
| 1:30pm–3pm | Full access (break) |
| 3pm–10pm | Bookmarks + profile only |
| 10pm–7am | Full access |

## Customize Hours

Edit `XBookmarksOnly Extension/Resources/background.js`:

```javascript
const FOCUS_START = { hour: 7, minute: 0 };
const FOCUS_END = { hour: 22, minute: 0 };
const BREAK_START = { hour: 13, minute: 30 };
const BREAK_END = { hour: 15, minute: 0 };
```

Then rebuild in Xcode.

## License

MIT
