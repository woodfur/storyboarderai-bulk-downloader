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

const getImageUrl = (img) => {
  return img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-original') || '';
};

const isLikelyFrame = (img) => {
  const w = img.naturalWidth || img.width || 0;
  const h = img.naturalHeight || img.height || 0;
  if (w >= 200 || h >= 200) return true;
  const src = getImageUrl(img);
  return /story|board|frame|shot|panel/i.test(src);
};

const extractMetaFromText = (text) => {
  const sceneMatch = text.match(/\b(?:scene|sc)\s*#?\s*0*([0-9]{1,3})\b/i);
  const shotMatch = text.match(/\b(?:shot|sh)\s*#?\s*0*([0-9]{1,3})\b/i);
  return {
    scene: sceneMatch ? sceneMatch[1] : '',
    shot: shotMatch ? shotMatch[1] : ''
  };
};

const getContainerMeta = (container) => {
  const sceneAttr = container.getAttribute('data-scene') || container.getAttribute('data-scene-number') || '';
  const shotAttr = container.getAttribute('data-shot') || container.getAttribute('data-shot-number') || '';
  const titleAttr = container.getAttribute('data-title') || container.getAttribute('data-description') || '';
  const text = container.innerText || '';
  const parsed = extractMetaFromText(text);
  return {
    scene: sceneAttr || parsed.scene,
    shot: shotAttr || parsed.shot,
    description: titleAttr || ''
  };
};

const collectFromContainers = () => {
  const selectors = [
    '[data-scene]',
    '[data-shot]',
    '[data-scene-number]',
    '[data-shot-number]',
    '[data-frame]',
    '[data-shotid]',
    '.shot',
    '.frame',
    '.panel',
    '.storyboard',
    '[class*="shot"]',
    '[class*="frame"]',
    '[class*="panel"]',
    '[class*="storyboard"]'
  ];
  const nodes = Array.from(document.querySelectorAll(selectors.join(',')));
  const items = [];
  let index = 1;
  for (const node of nodes) {
    const img = node.querySelector('img');
    if (!img) continue;
    const imageUrl = getImageUrl(img);
    if (!imageUrl || !imageUrl.startsWith('http')) continue;
    if (!isLikelyFrame(img)) continue;
    const meta = getContainerMeta(node);
    const description = meta.description || img.getAttribute('alt') || img.getAttribute('title') || '';
    items.push({
      imageUrl,
      scene: meta.scene,
      shot: meta.shot,
      description,
      index
    });
    index += 1;
  }
  return items;
};

const collectFromAllImages = () => {
  const nodes = Array.from(document.querySelectorAll('img'));
  const items = [];
  let index = 1;
  for (const img of nodes) {
    const imageUrl = getImageUrl(img);
    if (!imageUrl || !imageUrl.startsWith('http')) continue;
    if (!isLikelyFrame(img)) continue;
    const description = img.getAttribute('alt') || img.getAttribute('title') || '';
    items.push({
      imageUrl,
      scene: '',
      shot: '',
      description,
      index
    });
    index += 1;
  }
  return items;
};

const collectImages = () => {
  const primary = collectFromContainers();
  const fallback = primary.length ? primary : collectFromAllImages();
  const unique = uniqueBy(fallback, x => x.imageUrl);
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
