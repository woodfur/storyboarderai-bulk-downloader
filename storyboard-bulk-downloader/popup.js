const getActiveTab = async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs && tabs.length ? tabs[0] : undefined;
  } catch (e) {
    return undefined;
  }
};

const sendCollect = async (tabId) => {
  try {
    return await chrome.tabs.sendMessage(tabId, { type: 'collectImages' });
  } catch (e) {
    return undefined;
  }
};

const setStatus = (text) => {
  const el = document.getElementById('status');
  if (el) el.textContent = text;
};

const setProgress = (pct) => {
  const bar = document.getElementById('bar');
  if (bar) bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
};

const setButtonState = (disabled) => {
  const btn = document.getElementById('downloadBtn');
  if (btn) btn.disabled = disabled;
};

const downloadIndividually = async (payload) => {
  return await chrome.runtime.sendMessage({ type: 'downloadImages', images: payload.images, projectName: payload.projectName });
};

const ensureContentScript = async (tabId) => {
  const data = await sendCollect(tabId);
  if (data) return data;
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  } catch (e) {
    return undefined;
  }
  return await sendCollect(tabId);
};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'downloadProgress') {
    const total = msg.total || 0;
    const completed = msg.completed || 0;
    if (total > 0) {
      const pct = Math.round((completed / total) * 100);
      setProgress(Math.max(10, pct));
      setStatus('Downloading... ' + completed + '/' + total);
    }
  }
});

document.getElementById('downloadBtn').addEventListener('click', async () => {
  setStatus('Preparing...');
  setProgress(5);
  setButtonState(true);
  const tab = await getActiveTab();
  if (!tab) {
    setStatus('No active tab');
    setProgress(0);
    setButtonState(false);
    return;
  }
  const url = tab.url || '';
  const isAllowed = /^https:\/\/.*\.storyboarder\.ai\//.test(url);
  if (!isAllowed) {
    setStatus('Open a Storyboarder.ai project tab');
    setProgress(0);
    setButtonState(false);
    return;
  }
  setStatus('Collecting images...');
  setProgress(15);
  const data = await ensureContentScript(tab.id);
  if (!data) {
    setStatus('Could not access the page. Reload and try again.');
    setProgress(0);
    setButtonState(false);
    return;
  }
  if (!data.images || data.images.length === 0) {
    setStatus('No images found on this page');
    setProgress(0);
    setButtonState(false);
    return;
  }
  const zipChecked = document.getElementById('zipCheckbox').checked;
  if (zipChecked) {
    setStatus('ZIP mode coming soon — downloading individually');
  }
  setStatus('Downloading...');
  setProgress(20);
  const res = await downloadIndividually(data);
  if (!res || !res.ok) {
    setStatus('Download error. Check permissions and try again.');
    setProgress(0);
    setButtonState(false);
    return;
  }
  const total = data.images.length;
  const failed = res.results.filter(r => !r.ok).length;
  const success = total - failed;
  setStatus('Completed — ' + success + ' succeeded, ' + failed + ' failed');
  setProgress(100);
  setButtonState(false);
});
