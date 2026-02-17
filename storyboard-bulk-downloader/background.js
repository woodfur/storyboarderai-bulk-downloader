import { buildFilename, ensureUniqueFilenames } from './utils.js';

const downloadFile = (url, filename) => {
  return new Promise((resolve, reject) => {
    chrome.downloads.download({ url, filename, saveAs: false }, id => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message || 'download_error');
        return;
      }
      resolve(id);
    });
  });
};

const throttleDownloads = async (items, concurrency, onProgress) => {
  const queue = items.slice();
  const active = new Set();
  const results = [];
  let completed = 0;
  const total = items.length;
  const runNext = async () => {
    if (!queue.length) return;
    const task = queue.shift();
    const p = downloadFile(task.url, task.filename)
      .then(id => {
        results.push({ ok: true, id });
      })
      .catch(err => {
        results.push({ ok: false, error: String(err), url: task.url });
      })
      .finally(() => {
        completed += 1;
        if (onProgress) onProgress(completed, total);
        active.delete(p);
      });
    active.add(p);
    if (active.size < concurrency) await runNext();
  };
  const starters = Math.min(concurrency, queue.length);
  for (let i = 0; i < starters; i++) await runNext();
  await Promise.all(Array.from(active));
  return results;
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'downloadImages') {
    const images = msg.images || [];
    const filenames = ensureUniqueFilenames(
      images.map(x => buildFilename({ scene: x.scene || String(x.index), shot: x.shot || '', description: x.description || '' }))
    );
    const items = images.map((x, i) => ({ url: x.imageUrl, filename: filenames[i] }));
    throttleDownloads(items, 4, (completed, total) => {
      chrome.runtime.sendMessage({ type: 'downloadProgress', completed, total });
    })
      .then(res => sendResponse({ ok: true, results: res }))
      .catch(err => sendResponse({ ok: false, error: String(err) }));
    return true;
  }
});
