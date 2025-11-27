// Helper library functions that are UI-agnostic.
// Keep side-effect free utilities here.

/** Download a JSON object as a file in browser */
export function downloadJson(obj, filename) {
  const dataStr = JSON.stringify(obj, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Clamp a number between min and max */
export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/** Round with decimals */
export function round(n, decimals = 2) {
  const p = Math.pow(10, decimals);
  return Math.round(n * p) / p;
}
