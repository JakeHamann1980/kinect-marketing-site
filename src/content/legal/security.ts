// This copy requires legal review before launch. It is drafted to describe
// KINECT's actual, current security practices honestly and modestly. It is
// not legal advice, not a compliance or certification claim, and must not be
// published or relied upon until it has been reviewed against what is
// actually in place at launch time.
import type { LegalPage } from "./types";

export const security: LegalPage = {
  slug: "security",
  title: "Security",
  updated: "2026-07-25",
  sections: [
    {
      heading: "Where we are today",
      paragraphs: [
        "KINECT is currently in a pre-launch, waitlist stage. This page describes the security posture of the marketing site and waitlist as they exist today, not the client-portal product itself. We will publish a fuller security overview, including any certifications we pursue, as we approach launch of the product.",
        "We would rather describe our current practices plainly than overstate them. If you have a specific security question that this page does not answer, please contact us directly.",
      ],
    },
    {
      heading: "Hosting and infrastructure",
      paragraphs: [
        "The site is hosted on Vercel, a managed hosting platform. Vercel operates the infrastructure serving the site and provides the network and platform-level protections built into its hosting service.",
      ],
    },
    {
      heading: "Data storage and encryption",
      paragraphs: [
        "Waitlist signups are stored in Supabase, a managed Postgres database provider. Data is encrypted in transit between your browser and our servers, and Supabase encrypts data at rest on its infrastructure.",
      ],
    },
    {
      heading: "Minimal data by design",
      paragraphs: [
        "We follow a principle of collecting the least data necessary for what we are actually doing. At the waitlist stage, that means we collect a waitlist email address, the persona or page you signed up from, UTM parameters and a timestamp, and nothing more.",
        "We do not collect or store any payment information on this site. There is no purchase flow, checkout or stored payment method here today.",
      ],
    },
    {
      heading: "Access controls",
      paragraphs: [
        "Access to our waitlist data and underlying systems is limited to the small team operating KINECT, using the access controls provided by our infrastructure providers. We do not grant broader access than is needed to operate and support the site and waitlist.",
      ],
    },
    {
      heading: "Responsible disclosure",
      paragraphs: [
        "If you believe you have found a security issue affecting kinectnow.com, our persona subdomains, or the waitlist, please tell us before disclosing it publicly. Contact us at [COMPANY LEGAL NAME AND ADDRESS] with as much detail as you can provide, and we will work to acknowledge and address the issue.",
      ],
    },
    {
      heading: "Changes to this overview",
      paragraphs: [
        "As our practices evolve, we will update this page and revise the date shown at the top. Material changes will be reflected here before they take effect.",
      ],
    },
  ],
};
