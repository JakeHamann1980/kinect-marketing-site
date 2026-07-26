// This copy requires legal review before launch. It is drafted to describe
// KINECT's actual, current data practices as accurately as possible, but it
// is not legal advice and must not be published or relied upon until counsel
// has reviewed it against applicable law in every jurisdiction KINECT
// operates in.
import type { LegalPage } from "./types";

export const privacy: LegalPage = {
  slug: "privacy",
  title: "Privacy policy",
  updated: "2026-07-25",
  seo: {
    title: "Privacy Policy | KINECT",
    description:
      "How KINECT collects, uses and protects information on the marketing site and waitlist.",
  },
  sections: [
    {
      heading: "Introduction",
      paragraphs: [
        "This policy explains how KINECT collects, uses and protects information when you visit kinectnow.com or one of its persona subdomains (agency.kinectnow.com, coach.kinectnow.com, consultant.kinectnow.com), and when you join our waitlist.",
        "KINECT is currently in a pre-launch, waitlist stage. The client-portal product described on this site is not yet available to the public. This policy covers the marketing site and waitlist only. When the product launches, we will publish a separate policy covering the application itself, and we will update this page to reflect that change.",
      ],
    },
    {
      heading: "Information we collect",
      paragraphs: [
        "When you join the waitlist, we collect the email address you provide, the persona or page you signed up from (for example, agency, coach or consultant), any UTM parameters attached to the link you arrived from (source, medium, campaign and similar tracking parameters), and the date and time of your signup.",
        "Our hosting and infrastructure providers automatically generate standard technical logs as part of serving the site, such as IP address, browser and device information, the pages requested and response times. These logs exist to operate and secure the site and are not used to build a marketing profile of you.",
        "We do not operate accounts, logins or payment processing on this marketing site, so we do not collect passwords, payment card numbers or similar credentials here. We also do not knowingly collect any user-generated content through this site.",
      ],
    },
    {
      heading: "How we use this information",
      paragraphs: [
        "We use your waitlist email address to send you a confirmation email when you sign up and to contact you about KINECT's launch, including onboarding instructions when the product becomes available.",
        "We use the persona, page source and UTM parameters associated with your signup to understand which pages, campaigns and audiences are generating interest, so we can prioritize our launch plan. We look at this information in aggregate; we do not use it to individually target you with advertising.",
        "We use consent-gated analytics, described in the next section, to understand how visitors use the site in aggregate, so we can improve it before launch.",
      ],
    },
    {
      heading: "Cookies and analytics",
      paragraphs: [
        "We do not set analytics cookies or store any analytics identifiers until you have actively opted in through the cookie consent banner. Before you consent, only the strictly necessary storage needed to remember that choice is set.",
        "If you opt in, we use PostHog, a product analytics tool, to understand aggregate usage patterns such as which pages are visited and which buttons are clicked. PostHog is loaded through a first-party reverse proxy on our own domain rather than PostHog's own domain, and only activates after consent.",
        "Separately, we use Vercel Analytics, which is cookieless and measures aggregate page performance and traffic without setting any tracking cookie or persistent identifier. Because it does not use cookies or track individuals, it runs regardless of your analytics consent choice.",
        "You can change your analytics consent choice at any time using the cookie preferences control in the site footer. See our Cookie Policy for full detail on what is stored and when.",
      ],
    },
    {
      heading: "How we decide we can use your information",
      paragraphs: [
        "Where laws require a stated legal basis for processing personal information, we rely on your consent for analytics that are not strictly necessary, and on our legitimate interest in operating, securing and improving the site and in communicating with people who have asked to join our waitlist. Where you have a right to withdraw consent, you can do so at any time as described in this policy without affecting the lawfulness of processing carried out before you withdrew it.",
        "This section is deliberately general rather than committed to a specific jurisdiction's framework, since KINECT has not yet finalized which region-specific privacy law regime governs a given visitor at any given time. A jurisdiction-specific version of this section will be finalized during legal review.",
      ],
    },
    {
      heading: "Service providers",
      paragraphs: [
        "We use a small number of service providers (sometimes called processors) to operate this site and the waitlist. We share only the information each provider needs to perform its function, and we do not sell your information to anyone.",
        "Supabase hosts our waitlist database (built on Postgres), where waitlist signups are stored. Resend sends the waitlist confirmation email on our behalf. PostHog provides consent-gated product analytics as described above. Vercel hosts the site and provides cookieless performance analytics.",
        "Each of these providers has its own privacy practices governing how it handles data on our behalf, and each is contractually limited to using the information only to provide services to KINECT.",
      ],
    },
    {
      heading: "Where your information is stored",
      paragraphs: [
        "Waitlist data is stored in Supabase, which we currently operate on infrastructure located in the United States. If this changes, or if we add regional storage options, we will update this policy.",
      ],
    },
    {
      heading: "How long we keep your information",
      paragraphs: [
        "We keep waitlist signup information until one of two things happens: you move through launch onboarding into the live product (at which point your information becomes part of your product account, governed by the product's own privacy policy at that time), or you ask us to delete it. If neither happens, we will review waitlist data for continued relevance as we approach launch.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "You can ask us what waitlist information we hold about you, ask us to correct it, or ask us to delete it, at any time. To do so, contact us using the details below. We will respond within a reasonable time and may need to verify your identity before acting on your request.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "This site and waitlist are directed at business professionals (agencies, coaches and consultants) and are not intended for children. We do not knowingly collect information from children.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "We may update this policy as our practices, providers or the product itself evolve, particularly around launch. We will update the date at the top of this page when we do, and, for material changes, we will make reasonable efforts to notify waitlist members by email.",
      ],
    },
    {
      heading: "Contact us",
      paragraphs: [
        "If you have questions about this policy or want to exercise any of the rights described above, contact us at hello@kinectnow.com.",
      ],
    },
  ],
};
