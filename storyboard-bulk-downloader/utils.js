const normalize = s => s.normalize('NFKD');
const stripSpecial = s => s.replace(/[^a-zA-Z0-9._-]/g, '');
const collapseWhitespace = s => s.replace(/\s+/g, '_');
const truncate = (s, max) => s.length > max ? s.slice(0, max) : s;

export const sanitizePart = (s) => {
  const a = normalize(String(s || ''));
  const b = collapseWhitespace(a);
  const c = stripSpecial(b);
  return truncate(c, 100);
};

export const buildFilename = ({ scene, shot, description }) => {
  const parts = [];
  const scenePart = sanitizePart(scene);
  const shotPart = sanitizePart(shot);
  if (scenePart) parts.push('Scene' + scenePart);
  if (shotPart) parts.push('Shot' + shotPart);
  const descPart = sanitizePart(description);
  if (descPart) parts.push(descPart);
  const base = parts.length ? parts.join('_') : 'Storyboard';
  return base + '.png';
};

export const ensureUniqueFilenames = (names) => {
  const seen = new Map();
  return names.map(name => {
    if (!seen.has(name)) {
      seen.set(name, 1);
      return name;
    }
    const count = seen.get(name);
    seen.set(name, count + 1);
    const idx = name.lastIndexOf('.');
    if (idx === -1) return name + '_' + count;
    const base = name.slice(0, idx);
    const ext = name.slice(idx);
    return base + '_' + count + ext;
  });
};
