# Tab Peek — Smart Title Catcher (Chrome MV3)

> Grab the current tab’s title with flair. Copy it, theme it, and keep a handy history — all in a polished popup.

https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world/

## ✨ Why this is unique

- **Elegant UI**: Modern gradient, micro-interactions, and polished “card” layout.
- **Real-world touches**: Favicon display, one-click **Copy**, **Dark/Light** theme toggle.
- **Persists history** with timestamp + host, capped to 50 entries, **Export** as JSON.
- **Robust title capture**: First tries `chrome.tabs.query`, then falls back to `chrome.scripting.executeScript` for reliability.
- **Clean code**: Clear structure, comments, and meaningful naming.

## 📦 Project Structure

```
tab-peek-extension/
├─ images/
│  ├─ icon16.png
│  ├─ icon32.png
│  ├─ icon48.png
│  └─ icon128.png
├─ manifest.json
├─ popup.html
├─ popup.css
└─ popup.js
```

## 🚀 Install (Load Unpacked)

1. **Download** this folder or clone it.
2. Open **Chrome** → visit `chrome://extensions`.
3. Toggle **Developer mode** (top right).
4. Click **Load unpacked** → select the `tab-peek-extension` folder.
5. Pin **Tab Peek** from the puzzle icon for easy access.

## 🧪 How to Use

1. Click the extension to open the popup.
2. Press **“Catch Current Tab Title”**.
3. You’ll see:
   - The **title**, **URL**, and **favicon**.
   - **Title length** and **timestamp**.
   - Buttons to **Copy**, **Export**, and a **History** list (click any item to preview again).
4. Toggle **dark/light** with the 🌓 button.
5. Clear history with 🗑️ when needed.

## 🔐 Permissions Rationale

- `activeTab`: granted when you open the popup; allows reading the active tab.
- `tabs`: read title/url/favIcon for current tab.
- `storage`: save theme + history locally; theme uses `storage.sync`.
- `scripting`: fallback to execute a tiny snippet (`document.title`) when needed.

## 🧰 Tech Notes

- **Manifest V3** (`manifest_version: 3`).
- No background service worker needed — everything runs from the popup.
- History is capped at **50** entries and deduplicated by `(title + url)`.
- Clipboard uses `navigator.clipboard` on a **user gesture** (button click).

## ☁️ Upload to GitHub (Step-by-step)

**Option A — New repo (website UI):**
1. Go to GitHub → `New repository` → name: `tab-peek-extension` → Create.
2. On the repo page, click **“Add file” → “Upload files”**.
3. Drag the entire `tab-peek-extension` folder contents.
4. Commit with message: `feat: first release of Tab Peek (MV3)`.

**Option B — Git CLI:**
```bash
# from the folder that contains tab-peek-extension/
cd tab-peek-extension

git init
git add .
git commit -m "feat: first release of Tab Peek (MV3)"
git branch -M main
git remote add origin https://github.com/<your-username>/tab-peek-extension.git
git push -u origin main
```

## 🎥 5‑Minute Screen Recording Script (Use Loom or OBS)

**00:00 – 00:20 | Intro**  
Hi, I’m <your name>. This is **Tab Peek**, a Chrome MV3 extension that grabs the current tab’s title and adds a few real-world niceties.

**00:20 – 01:10 | Load & Demo**  
- Open `chrome://extensions` → Load unpacked → select the folder.  
- Click the icon → hit **“Catch Current Tab Title”**.  
- Show the **title**, **URL**, **favicon**, **length**, **timestamp**.  
- Press **Copy**, paste somewhere to show it works.

**01:10 – 02:20 | Features**  
- **Theme toggle** 🌓 and how it persists.  
- **History**: captured entries with host + time, de-dup, cap at 50.  
- **Export history JSON** and **Clear** actions.

**02:20 – 03:50 | Code Walkthrough**  
- `manifest.json`: MV3, permissions, popup entry.  
- `popup.html` + `popup.css`: structure and styling.  
- `popup.js`:  
  - `chrome.tabs.query` for active tab.  
  - Fallback via `chrome.scripting.executeScript` → `document.title`.  
  - `chrome.storage.local/sync` for history + theme.  
  - Copy, export, clear handlers.

**03:50 – 04:30 | Design & Thought Process**  
- Minimal permissions but robust behavior.  
- UI polish, micro-interactions, and accessible states.  
- Simple, maintainable code and real-world extensibility (e.g., send to notes app).

**04:30 – 05:00 | Close**  
Thanks! Repo link in the README. Happy to answer questions.

## 🧭 Extending Ideas (if asked)

- Add “Copy as Markdown link” (`[Title](URL)`).
- Add keyboard shortcut to capture title.
- Sync history across devices via `storage.sync` (swap storage area).

— Built for your assignment with ❤️