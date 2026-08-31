import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderLegalText } from "./legal-markup";

const html = (text: string) => renderToStaticMarkup(<>{renderLegalText(text)}</>);

describe("renderLegalText", () => {
  it("leaves plain prose untouched", () => {
    expect(html("We do not sell your information.")).toBe(
      "We do not sell your information."
    );
  });

  it("renders a link, keeping the surrounding sentence intact", () => {
    const out = html(
      "adheres to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements."
    );
    expect(out).toContain(
      'href="https://developers.google.com/terms/api-services-user-data-policy"'
    );
    expect(out).toContain("Google API Services User Data Policy</a>");
    expect(out).toContain("including the Limited Use requirements.");
  });

  it("opens external links safely", () => {
    const out = html("see [docs](https://example.com/x)");
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('target="_blank"');
  });

  it("keeps site-relative and mailto links in the same tab", () => {
    expect(html("[cookies](/legal/cookies)")).not.toContain("target=");
    expect(html("[us](mailto:hello@kinectnow.com)")).not.toContain("target=");
  });

  /**
   * The paragraphs this runs over are edited in Sanity, so the string is not
   * reviewed in this repo. A scheme check is the whole reason the href is not
   * simply interpolated.
   */
  it("refuses a dangerous scheme but keeps the words", () => {
    const out = html("click [here](javascript:alert(1)) now");
    expect(out).not.toContain("javascript:");
    expect(out).not.toContain("<a");
    expect(out).toContain("here");
    expect(out).toContain("now");
  });

  /**
   * Texas applies a conspicuousness requirement to warranty disclaimers and
   * limitations of liability. KINECT is a Texas LLC, so the Terms of Service
   * may need those sections visually set apart to be ENFORCEABLE - which
   * makes this markup a legal requirement rather than a styling nicety.
   */
  it("renders bold as a real strong element", () => {
    const out = html("THE SERVICE IS PROVIDED **AS IS** AND WITHOUT WARRANTY.");
    expect(out).toContain("<strong");
    expect(out).toContain("AS IS</strong>");
    expect(out).toContain("AND WITHOUT WARRANTY.");
  });

  it("bolds a whole clause, not just a word", () => {
    const out = html("**Our total liability will not exceed the fees you paid us.** See above.");
    expect(out).toContain("Our total liability will not exceed the fees you paid us.</strong>");
    expect(out).toContain("See above.");
  });

  it("mixes bold and links in one paragraph", () => {
    const out = html("**Important:** see the [policy](/legal/privacy) first.");
    expect(out).toContain("<strong");
    expect(out).toContain('href="/legal/privacy"');
  });

  it("leaves an unmatched asterisk pair alone", () => {
    expect(html("2 * 3 * 4 = 24")).toBe("2 * 3 * 4 = 24");
  });

  it("escapes inside bold too", () => {
    expect(html("**<script>x</script>**")).toContain("&lt;script&gt;");
  });

  it("handles several links in one paragraph", () => {
    const out = html("[a](https://a.test) and [b](https://b.test)");
    expect(out.match(/<a /g)).toHaveLength(2);
  });

  it("escapes text rather than trusting it", () => {
    expect(html("5 < 6 & 7 > 2")).not.toContain("<script");
    expect(html('<script>alert("x")</script>')).toContain("&lt;script&gt;");
  });
});
