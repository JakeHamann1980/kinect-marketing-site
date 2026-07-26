// This copy requires legal review before launch. It is drafted to describe
// KINECT's actual, current cookie and storage behavior as accurately as
// possible, but it is not legal advice and must not be published or relied
// upon until it has been verified against the site's shipped consent
// mechanism at launch time.
import type { LegalPage } from "./types";

export const cookies: LegalPage = {
  slug: "cookies",
  title: "Cookie policy",
  updated: "2026-07-25",
  seo: {
    title: "Cookie Policy | KINECT",
    description:
      "What KINECT stores, when, and how to manage your analytics consent.",
  },
  sections: [
    {
      heading: "What this policy covers",
      paragraphs: [
        "This policy explains the cookies and similar browser storage (such as localStorage) that kinectnow.com and its persona subdomains use, what each one does, and how you can control them. It supplements our Privacy Policy, which covers the personal information we collect more broadly.",
      ],
    },
    {
      heading: "Before you make a choice",
      paragraphs: [
        "We do not set any analytics cookies, and we do not load any analytics identifier, before you have made an active choice through our cookie consent banner. The only thing stored before that point is the consent preference storage itself, a small piece of browser storage that simply records whether you have been shown the banner and, once you respond, what you chose. It does not track your activity on the site.",
      ],
    },
    {
      heading: "If you opt in to analytics",
      paragraphs: [
        "If you choose to accept analytics cookies, we activate PostHog, our product analytics tool. PostHog then sets a cookie and/or localStorage entry containing an anonymous identifier, so it can recognize repeat visits and understand aggregate usage patterns such as which pages are viewed and which buttons are used. PostHog is loaded through a first-party reverse proxy on our own domain rather than being loaded directly from PostHog's servers.",
        "You will not see any analytics cookie from PostHog before you opt in, and opting out again removes it going forward.",
      ],
    },
    {
      heading: "Cookieless performance analytics",
      paragraphs: [
        "Separately, we use Vercel Analytics to measure aggregate page performance and traffic, such as page load times and visit counts. Vercel Analytics is cookieless: it does not set a cookie, does not use a persistent identifier, and cannot be used to recognize you individually across visits. Because it does not track individuals, it runs regardless of your analytics consent choice.",
      ],
    },
    {
      heading: "Managing your preferences",
      paragraphs: [
        "You can change your analytics consent choice at any time using the cookie preferences control in the site footer, which reopens the same choice presented in the initial banner. You can also control cookies more broadly through your browser's own settings, though blocking all cookies may affect how some parts of the site function.",
      ],
    },
    {
      heading: "Changes and contact",
      paragraphs: [
        "If our use of cookies changes, we will update this page and revise the date shown at the top. Questions about this policy or our privacy practices can be sent to hello@kinectnow.com.",
      ],
    },
  ],
};
