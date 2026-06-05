/**
 * Copy `text` to the clipboard.
 *
 * Tries the modern async Clipboard API first; falls back to the legacy
 * `document.execCommand('copy')` path. The async API is only available in
 * secure contexts (https or localhost), so the fallback matters for the
 * http://...:3009 dev workflow.
 *
 * Returns true on success, false if no path worked. Never throws.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy path
    }
  }
  if (typeof document === 'undefined') return false;
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '-9999px';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    const ok = document.execCommand('copy');
    return ok;
  } catch {
    return false;
  } finally {
    document.body.removeChild(ta);
  }
}
