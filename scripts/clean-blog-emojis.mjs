// One-off cleanup: strip emojis from blog post headings entirely, and remove
// non-amber/clashing emojis from body text (keep warm/amber ones). Skips code
// fences and frontmatter. Run: node scripts/clean-blog-emojis.mjs
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'content/blog';

// Warm/amber emojis we keep in BODY text (they fit the colour scheme).
const KEEP = new Set([
  '🔥', '⚡', '🔶', '🔸', '🟠', '🟡', '🟧', '🟨', '🧡', '💛',
  '☀', '🌟', '⭐', '🏆', '✨', '🔆',
]);

// Match a single emoji "grapheme": base + optional skin tone + VS16 + ZWJ runs,
// then eat one trailing space so removal doesn't leave gaps (e.g. "[🚀 Text]").
// NOTE: deliberately excludes U+2190–21FF (typographic arrows like → ← ↑ ↓),
// which are meaningful prose, not decorative emoji.
const EMOJI = new RegExp(
  '(?:[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\u{1F1E6}-\\u{1F1FF}])' +
    '[\\u{1F3FB}-\\u{1F3FF}]?\\u{FE0F}?' +
    '(?:\\u{200D}(?:[\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}])[\\u{1F3FB}-\\u{1F3FF}]?\\u{FE0F}?)*' +
    '[ \\t]?',
  'gu',
);

function tidy(line, wasIndented) {
  // collapse runs of 2+ spaces that follow a non-space; trim trailing space
  let out = line.replace(/(\S)  +/g, '$1 ').replace(/[ \t]+$/g, '');
  if (!wasIndented) out = out.replace(/^[ \t]+/, ''); // un-indent if emoji was at col 0
  return out;
}

function cleanFile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^(---[\s\S]*?---\n?)([\s\S]*)$/);
  const front = m ? m[1] : '';
  const body = m ? m[2] : raw;

  let removedHead = 0;
  let removedBody = 0;
  let inFence = false;

  const lines = body.split('\n').map((line) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return line;
    }
    if (inFence) return line;

    const wasIndented = /^[ \t]/.test(line);
    const isHeading = /^#{1,6}\s/.test(line);

    const next = line.replace(EMOJI, (match) => {
      const base = Array.from(match)[0];
      if (isHeading) {
        removedHead += 1;
        return '';
      }
      if (KEEP.has(base)) return match;
      removedBody += 1;
      return '';
    });

    return next === line ? line : tidy(next, wasIndented);
  });

  const result = front + lines.join('\n');
  if (result !== raw) fs.writeFileSync(file, result);
  return { removedHead, removedBody, changed: result !== raw };
}

let totH = 0,
  totB = 0;
for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('.mdx')).sort()) {
  const r = cleanFile(path.join(DIR, f));
  totH += r.removedHead;
  totB += r.removedBody;
  if (r.changed)
    console.log(`${f.padEnd(42)} headings -${r.removedHead}  body -${r.removedBody}`);
}
console.log(`\nTOTAL: removed ${totH} heading emojis, ${totB} clashing body emojis (kept amber/warm)`);
