import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderLegalText } from "./legal-links";

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

  it("handles several links in one paragraph", () => {
    const out = html("[a](https://a.test) and [b](https://b.test)");
    expect(out.match(/<a /g)).toHaveLength(2);
  });

  it("escapes text rather than trusting it", () => {
    expect(html("5 < 6 & 7 > 2")).not.toContain("<script");
    expect(html('<script>alert("x")</script>')).toContain("&lt;script&gt;");
  });
});
