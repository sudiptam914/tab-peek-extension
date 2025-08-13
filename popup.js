/* Tab Peek — Smart Title Catcher (MV3)
 * Unique touches: animated UI, copy-to-clipboard, theme toggle, history with export, favicon display,
 * robust title capture with tabs API + fallback via scripting.executeScript.
 */

const qs = (sel) => document.querySelector(sel);
const fetchBtn = qs('#fetchBtn');
const copyBtn = qs('#copyBtn');
const resultCard = qs('#result');
const faviconEl = qs('#favicon');
const titleEl = qs('#title');
const urlEl = qs('#url');
const lengthEl = qs('#length');
const timeEl = qs('#timestamp');
const historyList = qs('#historyList');
const themeToggle = qs('#themeToggle');
const clearHistoryBtn = qs('#clearHistory');
const exportHistoryBtn = qs('#exportHistory');

const STORAGE_KEYS = {
  HISTORY: 'tabpeek_history_v1',
  THEME: 'tabpeek_theme_v1'
};

// Initialize UI
document.addEventListener('DOMContentLoaded', async () => {
  await applySavedTheme();
  await renderHistory();
});

// Theme toggle
themeToggle.addEventListener('click', async () => {
  const next = (document.body.getAttribute('data-theme') === 'light') ? 'dark' : 'light';
  document.body.setAttribute('data-theme', next === 'dark' ? 'dark' : 'light');
  await chrome.storage.sync.set({ [STORAGE_KEYS.THEME]: next });
});

async function applySavedTheme() {
  const { [STORAGE_KEYS.THEME]: pref } = await chrome.storage.sync.get(STORAGE_KEYS.THEME);
  const theme = pref || 'dark';
  document.body.setAttribute('data-theme', theme === 'dark' ? '' : 'light');
}

// Fetch current tab title
fetchBtn.addEventListener('click', async () => {
  fetchBtn.disabled = true;
  try {
    const tabInfo = await getActiveTabInfo();
    if (!tabInfo) throw new Error('Unable to get active tab.');

    const { title, url, favIconUrl } = tabInfo;
    paintResult({ title, url, favIconUrl });
    copyBtn.disabled = false;

    // Persist to history
    await saveToHistory({ title, url, favIconUrl, ts: Date.now() });
    await renderHistory();
  } catch (err) {
    console.error(err);
    paintResult({ title: 'Permission or retrieval issue — try pinning the extension.', url: '', favIconUrl: '' });
  } finally {
    fetchBtn.disabled = false;
  }
});

copyBtn.addEventListener('click', async () => {
  const text = titleEl.textContent || '';
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.innerHTML = '<span class="btn-icon">✅</span><span>Copied</span>';
    setTimeout(() => {
      copyBtn.innerHTML = '<span class="btn-icon">📋</span><span>Copy</span>';
    }, 1200);
  } catch (e) {
    console.error('Clipboard error', e);
  }
});

clearHistoryBtn.addEventListener('click', async () => {
  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: [] });
  await renderHistory();
});

exportHistoryBtn.addEventListener('click', async () => {
  const history = await getHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  // Create a temporary link
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tab-peek-history.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 0);
});

// Helpers

async function getActiveTabInfo() {
  // First try via tabs.query
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.title) {
    return { title: tab.title, url: tab.url || '', favIconUrl: tab.favIconUrl || '' };
  }
  // Fallback: executeScript to read document.title
  if (tab && tab.id) {
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => ({ title: document.title, url: location.href })
      });
      return { title: result?.title || '', url: result?.url || '', favIconUrl: tab.favIconUrl || '' };
    } catch (e) {
      console.warn('executeScript fallback failed', e);
    }
  }
  return null;
}

function paintResult({ title, url, favIconUrl }) {
  resultCard.classList.remove('hidden');
  titleEl.textContent = title || '(no title)';
  urlEl.textContent = url || '';
  lengthEl.textContent = String(title ? title.length : 0);
  timeEl.textContent = new Date().toLocaleString();
  faviconEl.src = favIconUrl || 'images/icon32.png';
  faviconEl.alt = url ? (new URL(url).hostname + ' favicon') : 'favicon';
}

async function getHistory() {
  const { [STORAGE_KEYS.HISTORY]: history } = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
  return Array.isArray(history) ? history : [];
}

async function saveToHistory(item) {
  const history = await getHistory();
  // De-dupe by same URL + title (keep most recent at top)
  const filtered = history.filter(h => !(h.url === item.url && h.title === item.title));
  filtered.unshift(item);
  // Cap to last 50
  const next = filtered.slice(0, 50);
  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: next });
}

function truncate(str, n = 60) {
  if (!str) return '';
  return (str.length > n) ? (str.slice(0, n - 1) + '…') : str;
}

async function renderHistory() {
  const history = await getHistory();
  historyList.innerHTML = '';
  if (!history.length) {
    const li = document.createElement('li');
    li.style.opacity = '0.7';
    li.innerHTML = '<div></div><div class="item-title">No items yet — try “Catch Current Tab Title”.</div><div></div>';
    historyList.appendChild(li);
    return;
  }
  history.forEach((item) => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.src = item.favIconUrl || 'images/icon16.png';
    img.alt = 'favicon';
    const textWrap = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = truncate(item.title);
    const meta = document.createElement('div');
    meta.className = 'item-meta';
    try {
      const host = item.url ? new URL(item.url).hostname : '';
      meta.textContent = host ? `${host} • ${new Date(item.ts).toLocaleTimeString()}` : new Date(item.ts).toLocaleTimeString();
    } catch(e) {
      meta.textContent = new Date(item.ts).toLocaleTimeString();
    }
    textWrap.appendChild(title);
    textWrap.appendChild(meta);
    const chip = document.createElement('div');
    chip.className = 'copy-chip';
    chip.textContent = 'Copy';
    chip.title = 'Copy title';
    chip.addEventListener('click', async (ev) => {
      ev.stopPropagation();
      await navigator.clipboard.writeText(item.title || '');
      chip.textContent = 'Copied';
      setTimeout(() => chip.textContent = 'Copy', 1000);
    });
    li.appendChild(img);
    li.appendChild(textWrap);
    li.appendChild(chip);
    li.addEventListener('click', () => {
      paintResult(item);
      copyBtn.disabled = false;
    });
    historyList.appendChild(li);
  });
}