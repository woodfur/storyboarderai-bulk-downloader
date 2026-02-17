const uniqueBy = (arr, key) => {
  const seen = new Set();
  const result = [];
  for (const item of arr) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(item);
    }
  }
  return result;
};

const collectImages = () => {
  const nodes = Array.from(document.querySelectorAll('img'));
  const items = nodes
    .filter(n => n.src && n.src.startsWith('http'))
    .map((n, i) => {
      const description = n.getAttribute('alt') || n.getAttribute('title') || '';
      return {
        imageUrl: n.src,
        scene: '',
        shot: '',
        description,
        index: i + 1
      };
    });
  const unique = uniqueBy(items, x => x.imageUrl);
  const projectName = document.title || 'Storyboard';
  return { projectName, images: unique };
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'collectImages') {
    const result = collectImages();
    sendResponse(result);
    return true;
  }
});
