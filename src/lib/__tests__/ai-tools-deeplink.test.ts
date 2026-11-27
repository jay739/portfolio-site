import {
  DEEP_LINK_TOOLS,
  consumePendingChatbotOpen,
  parseToolParam,
  requestChatbotOpen,
  resetPendingChatbotOpen,
} from "../ai-tools-deeplink";

describe("parseToolParam", () => {
  it("accepts exactly the three deep-linkable tools", () => {
    expect(DEEP_LINK_TOOLS).toEqual([
      "podcast-generator",
      "chatbot",
      "image-generator",
    ]);
    for (const t of DEEP_LINK_TOOLS) expect(parseToolParam(t)).toBe(t);
  });

  it("returns null for a missing or empty param", () => {
    expect(parseToolParam(null)).toBeNull();
    expect(parseToolParam(undefined)).toBeNull();
    expect(parseToolParam("")).toBeNull();
  });

  it("returns null for an unknown value, so the page renders normally", () => {
    expect(parseToolParam("bogus")).toBeNull();
    expect(parseToolParam("podcast")).toBeNull();
    expect(parseToolParam("open-chatbot")).toBeNull();
  });

  it("is strict about case and whitespace", () => {
    // The README links are the only spellings that should work; a typo should
    // degrade to the plain page rather than open something unexpected.
    expect(parseToolParam("Chatbot")).toBeNull();
    expect(parseToolParam("CHATBOT")).toBeNull();
    expect(parseToolParam(" chatbot")).toBeNull();
    expect(parseToolParam("chatbot ")).toBeNull();
  });

  it("is not fooled by prototype keys", () => {
    expect(parseToolParam("__proto__")).toBeNull();
    expect(parseToolParam("constructor")).toBeNull();
    expect(parseToolParam("toString")).toBeNull();
  });
});

describe("pending chatbot open", () => {
  beforeEach(() => resetPendingChatbotOpen());

  it("reports nothing pending on an ordinary page load", () => {
    // The widget must not spring open by itself.
    expect(consumePendingChatbotOpen()).toBe(false);
  });

  it("hands a requested open to a widget that mounts later", () => {
    requestChatbotOpen();
    expect(consumePendingChatbotOpen()).toBe(true);
  });

  it("is claimed once only, so a remount does not reopen it", () => {
    requestChatbotOpen();
    expect(consumePendingChatbotOpen()).toBe(true);
    expect(consumePendingChatbotOpen()).toBe(false);
  });

  it("also dispatches the event, for a widget already listening", () => {
    const seen: string[] = [];
    const onOpen = () => seen.push("open");
    window.addEventListener("chatbot:open", onOpen);
    requestChatbotOpen();
    window.removeEventListener("chatbot:open", onOpen);
    expect(seen).toEqual(["open"]);
  });
});
