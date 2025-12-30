export function safeFilename(name: string): string {
  const ext = name.split('.').pop() || '';
  const base = name
    .replace(/\.[^/.]+$/, '') // remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace unsafe chars
    .replace(/(^-|-$)/g, ''); // trim dashes

  return `${base}.${ext.toLowerCase()}`;
}
