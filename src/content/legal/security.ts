// This copy describes KINECT's actual, current security practices honestly
// and modestly. It is not legal advice and not a compliance or certification
// claim.
//
// Rewritten 2026-08-30 (user-directed): the previous version said "KINECT is
// currently in a pre-launch, waitlist stage" and described "the marketing
// site and waitlist as they exist today, not the client-portal product
// itself". The product is live with paying customers, so the page a security-
// conscious buyer reads was describing something that no longer existed.
//
// EVERY claim below was checked against the platform repo before it was
// written, on the standing rule that this site has repeatedly shipped copy
// the product could not back:
//   65 tables with row level security enabled, 217 policies (grep the
//     migrations); the pgTAP suite covering them is 974 tests.
//   Two-factor: /login/mfa, AAL enforced in middleware, and the workspace
//     requirement in 20260907110000_workspace_mfa.sql. Not plan-gated.
//   Backups: docs/BACKUPS.md in the platform repo - Supabase daily physical
//     backups plus a daily off-provider encrypted pg_dump and an rclone COPY
//     of every storage bucket.
//   Admin audit: platform_admin_audit (20260726001707), append-only.
// DELIBERATELY ABSENT, because they do not exist: SSO, any certification,
// and any claim that OAuth tokens are encrypted at the application level
// (they are not - see the privacy policy, which says what is actually true).
import type { LegalPage } from "./types";

export const security: LegalPage = {
  slug: "security",
  title: "Security",
  updated: "2026-08-30",
  seo: {
    title: "Security | KINECT",
    description:
      "How KINECT protects customer and client data in the live product: tenant isolation, encryption, access controls, backups and disclosure.",
  },
  sections: [
    {
      heading: "Where we are today",
      paragraphs: [
        "KINECT is live. Agencies, professional services firms and consultants run real client work through it, and their clients log into portals we host. This page describes how we protect that data today.",
        "We would rather describe our practices plainly than overstate them. Where we do not yet have something, this page says so rather than implying otherwise. If you have a specific security question this page does not answer, contact us directly and a person will answer it.",
      ],
    },
    {
      heading: "Hosting and infrastructure",
      paragraphs: [
        "The marketing site and the application are hosted on Vercel. Our database, file storage and authentication run on Supabase, a managed Postgres provider. Both operate the underlying infrastructure and provide the network and platform-level protections built into their services. Data is stored on infrastructure located in the United States.",
      ],
    },
    {
      heading: "Encryption",
      paragraphs: [
        "Data is encrypted in transit between your browser and our servers, and encrypted at rest by our infrastructure providers. Passwords are stored as salted hashes by our authentication provider and are never readable by us; accounts that sign in with Google have no password with us at all.",
      ],
    },
    {
      heading: "Separation between customers",
      paragraphs: [
        "This is the control that matters most in a product like ours, so it is enforced in the database rather than in application code. Every table carrying customer data has row-level security enabled, and access is expressed as policies Postgres evaluates on every query. An application bug cannot hand one customer another customer's data, because the database refuses the rows before the application sees them.",
        "The same mechanism separates your clients from each other and from your internal work. A client invited into your portal reaches only what you have shared with that client, and never your other clients, your internal channels or your unshared documents.",
        "We hold ourselves to this with an automated test suite that runs the policies directly against a real database, asserting both what each role can reach and what it must not.",
      ],
    },
    {
      heading: "Accounts and access",
      paragraphs: [
        "Two-factor authentication is available on every plan, at no extra cost, and a workspace administrator can require it of everyone in the workspace. Members who have not yet enrolled are walked through setup before they can reach workspace content.",
        "Within a workspace, members hold roles that determine what they can do, and client contacts are a separate kind of account from your team entirely rather than a member with fewer permissions.",
      ],
    },
    {
      heading: "Connected accounts",
      paragraphs: [
        "When you connect an outside account such as Google, Meta or LinkedIn, we request the narrowest access that will do the job, and read-only access wherever the provider offers a read-only option. You can disconnect any account at any time from your settings, which stops all further access immediately.",
        "Our [Privacy Policy](/legal/privacy) describes exactly what we access from each provider, what we use it for, and what we never do with it.",
      ],
    },
    {
      heading: "Payments",
      paragraphs: [
        "Subscription payments are processed by Stripe. Card details are entered with Stripe and never reach our servers, so we do not hold card numbers and cannot expose them.",
      ],
    },
    {
      heading: "Backups and recovery",
      paragraphs: [
        "We run two independent daily backup layers. Our database provider takes its own daily physical backups, and separately we take a daily encrypted database dump and a daily copy of every stored file to storage held with a different provider, so that a failure at one provider does not take the backups with it.",
        "The file copy only ever adds, so an accidental deletion in the live product does not propagate into the backup on the next run.",
      ],
    },
    {
      heading: "Our own access",
      paragraphs: [
        "Access to production systems is limited to the small team operating KINECT, and we do not grant broader access than running and supporting the product requires. Administrative actions taken on a workspace by our own team are written to an append-only log.",
      ],
    },
    {
      heading: "What we do not claim yet",
      paragraphs: [
        "We do not hold SOC 2, ISO 27001 or any comparable certification today. We are not going to imply otherwise by describing our controls in the language of a framework we have not been audited against.",
        "Single sign-on through an identity provider is not available yet. Two-factor authentication, including the workspace-wide requirement described above, is what we offer today.",
      ],
    },
    {
      heading: "Responsible disclosure",
      paragraphs: [
        "If you believe you have found a security issue affecting kinectnow.com, our persona subdomains, or the KINECT application, please tell us before disclosing it publicly. Contact us at hello@kinectnow.com with as much detail as you can provide, and we will work to acknowledge and address the issue. We will not pursue action against anyone who reports an issue in good faith and gives us a reasonable chance to fix it.",
      ],
    },
    {
      heading: "Changes to this overview",
      paragraphs: [
        "As our practices evolve, we will update this page and revise the date shown at the top.",
      ],
    },
  ],
};
