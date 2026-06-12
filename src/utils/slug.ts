import slugify from 'slugify';

function randomSuffix(len = 6) {
  try {
    const arr = new Uint8Array(len / 2 + 1);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, len);
  } catch (e) {
    return Math.random().toString(16).slice(2, 2 + len);
  }
}

export function generateClientSlug(name?: string) {
  const base = slugify((name || 'cliente').slice(0, 40), { lower: true, strict: true }) || 'cliente';
  const suffix = randomSuffix(6);
  return `${base}-${suffix}`;
}
