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

const downloadIndividually = async (payload) => {
  return await chrome.runtime.sendMessage({ type: 'downloadImages', images: payload.images, projectName: payload.projectName });
};

document.getElementById('downloadBtn').addEventListener('click', async () => {
  setStatus('Preparing...');
  const tab = await getActiveTab();
  if (!tab) {
    setStatus('No active tab');
    return;
  }
  const url = tab.url || '';
  const isAllowed = /^https:\/\/.*\.storyboarder\.ai\//.test(url);
  if (!isAllowed) {
    setStatus('Open a Storyboarder.ai project tab');
    return;
  }
  setStatus('Collecting images...');
  const data = await sendCollect(tab.id);
  if (!data) {
    setStatus('Could not access the page. Reload and try again.');
    return;
  }
  if (!data.images || data.images.length === 0) {
    setStatus('No images found on this page');
    return;
  }
  const zipChecked = document.getElementById('zipCheckbox').checked;
  if (zipChecked) {
    setStatus('ZIP mode coming soon — downloading individually');
  }
  setStatus('Downloading...');
  const res = await downloadIndividually(data);
  if (!res || !res.ok) {
    setStatus('Download error. Check permissions and try again.');
    return;
  }
  const total = data.images.length;
  const failed = res.results.filter(r => !r.ok).length;
  const success = total - failed;
  setStatus('Completed — ' + success + ' succeeded, ' + failed + ' failed');
});
