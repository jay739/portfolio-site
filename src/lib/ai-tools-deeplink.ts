/**
 * Deep links into the three AI demos on /ai-tools, so the profile README can
 * point at a specific demo rather than the page as a whole.
 *
 * A deep link only ever OPENS a tool. It must never start a podcast or an image
 * job: those run on the Mac Mini and the RTX box, and a URL that anyone can
 * paste or crawl must not be able to spend GPU time.
 */

/** Accepted `?tool=` values: the action names without the `open-` prefix. */
export const DEEP_LINK_TOOLS = [
  "podcast-generator",
  "chatbot",
  "image-generator",
] as const;

export type DeepLinkTool = (typeof DEEP_LINK_TOOLS)[number];

/**
 * Read a `?tool=` value, returning null for anything unrecognised so the page
 * renders normally rather than failing.
 *
 * Deliberately strict: no trimming and no case folding, so the links in the
 * README are the only spellings that work and a typo degrades to the plain
 * page instead of quietly opening the wrong demo.
 */
export function parseToolParam(
  value: string | null | undefined,
): DeepLinkTool | null {
  if (typeof value !== "string") return null;
  return (DEEP_LINK_TOOLS as readonly string[]).includes(value)
    ? (value as DeepLinkTool)
    : null;
}

/**
 * The chatbot is a global widget rendered by ClientLayout, not by the page, so
 * opening it from a deep link means crossing a component boundary.
 *
 * Today the widget is a static import rendered ahead of {children}, so its
 * listener is attached before the page's mount effect runs and a plain event
 * dispatch would work. That ordering is incidental, though: moving the widget
 * below {children}, or making it a dynamic import, would silently break the
 * deep link because the event would fire with nobody listening.
 *
 * So the open is requested two ways. The event handles a widget that is already
 * listening, and the flag below handles a widget that mounts later and claims
 * the pending request. Whichever happens first wins, and the other is a no-op.
 */
let pendingChatbotOpen = false;

/** Ask the chatbot widget to open, whether or not it has mounted yet. */
export function requestChatbotOpen(): void {
  pendingChatbotOpen = true;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("chatbot:open"));
  }
}

/**
 * Claim a pending open, clearing it. Returns false when there is none, so a
 * widget that mounts normally does not spring open on its own.
 */
export function consumePendingChatbotOpen(): boolean {
  if (!pendingChatbotOpen) return false;
  pendingChatbotOpen = false;
  return true;
}

/** Test seam: drops any pending request between cases. */
export function resetPendingChatbotOpen(): void {
  pendingChatbotOpen = false;
}
