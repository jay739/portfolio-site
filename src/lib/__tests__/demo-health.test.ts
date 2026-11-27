import { DEMOS, isDemo, modelListed } from "../demo-health";

describe("isDemo", () => {
  it("accepts exactly the three demos", () => {
    expect(DEMOS).toEqual(["podcast", "chatbot", "image"]);
    for (const d of DEMOS) expect(isDemo(d)).toBe(true);
  });

  it("rejects anything else, including a missing param", () => {
    expect(isDemo(null)).toBe(false);
    expect(isDemo("")).toBe(false);
    expect(isDemo("Podcast")).toBe(false);
    expect(isDemo("podcast ")).toBe(false);
    expect(isDemo("chat")).toBe(false);
    expect(isDemo("__proto__")).toBe(false);
    expect(isDemo("constructor")).toBe(false);
  });
});

/**
 * Ollama normalises an untagged pull to `name:latest`, which is why exact
 * matching alone would report a healthy host as down. The live host lists
 * `nomic-embed-text:latest` alongside explicitly tagged models, so both forms
 * genuinely occur.
 */
describe("modelListed", () => {
  const live = [
    "qwen2.5:7b-instruct",
    "nomic-embed-text:latest",
    "llama3.2-vision:11b",
    "deepseek-r1:8b",
    "qwen2.5-coder:7b",
    "llama3.2:3b",
    "qwen2.5:14b",
  ];

  it("matches a tagged model exactly", () => {
    expect(modelListed(live, "llama3.2:3b")).toBe(true);
    expect(modelListed(live, "qwen2.5:14b")).toBe(true);
  });

  it("does not confuse two tags of the same model", () => {
    expect(modelListed(live, "llama3.2:1b")).toBe(false);
    expect(modelListed(["llama3.2:3b"], "llama3.2:70b")).toBe(false);
  });

  it("does not treat a tagged request as a prefix match", () => {
    // "llama3.2:3b" must not satisfy a request for "llama3.2-vision:3b"
    expect(modelListed(live, "llama3.2-vision:3b")).toBe(false);
  });

  it("resolves an untagged name against :latest", () => {
    expect(modelListed(live, "nomic-embed-text")).toBe(true);
    expect(modelListed(["gemma2:latest"], "gemma2")).toBe(true);
    expect(modelListed(["gemma2"], "gemma2")).toBe(true);
  });

  it("does not let an untagged name match an arbitrary tag", () => {
    // A configured "llama3.2" should not be satisfied by "llama3.2:3b":
    // the operator asked for the default tag, which is not present here.
    expect(modelListed(["llama3.2:3b"], "llama3.2")).toBe(false);
  });

  it("returns false for an empty list", () => {
    expect(modelListed([], "llama3.2:3b")).toBe(false);
    expect(modelListed([], "gemma2")).toBe(false);
  });
});
