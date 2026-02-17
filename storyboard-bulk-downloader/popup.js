const getActiveTab = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
};

const sendCollect = async (tabId) => {
  return await chrome.tabs.sendMessage(tabId, { type: 'collectImages' });
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
  const data = await sendCollect(tab.id);
  if (!data || !data.images || data.images.length === 0) {
    setStatus('No images found');
    return;
  }
  const zipChecked = document.getElementById('zipCheckbox').checked;
  if (zipChecked) {
    setStatus('ZIP mode not available, downloading individually');
  }
  setStatus('Downloading...');
  const res = await downloadIndividually(data);
  if (!res || !res.ok) {
    setStatus('Error');
    return;
  }
  const total = data.images.length;
  const failed = res.results.filter(r => !r.ok).length;
  const success = total - failed;
  setStatus('Completed: ' + success + ' succeeded, ' + failed + ' failed');
});
