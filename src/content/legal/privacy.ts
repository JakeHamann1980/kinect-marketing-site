// This copy requires legal review. It is drafted to describe KINECT's actual,
// current data practices as accurately as possible, but it is not legal
// advice and must be reviewed by counsel against applicable law in every
// jurisdiction KINECT operates in.
//
// Rewritten 2026-08-30. The previous version described a pre-launch waitlist
// and said in terms that "the client-portal product described on this site is
// not yet available to the public" and that the policy "covers the marketing
// site and waitlist only". Both were false: the product is live, customers
// are connecting Google accounts to it, and no other privacy policy exists
// anywhere (the app itself has no legal routes). This page is therefore the
// ONLY document describing how the product handles data, and it is the URL
// submitted to Google for OAuth app verification.
//
// EVERY factual claim below was checked against the platform repo before it
// was written here, because a privacy policy is the worst possible place to
// overclaim. Specifically:
//   - The Google scopes are the ones actually requested (see the Google
//     section's own comment for the list and where each is requested).
//   - Tokens are NOT described as application-encrypted, because they are
//     not: access_token/refresh_token are plain text columns in
//     ad_connections, calendar_connections and seo_search_console, protected
//     by RLS and the database provider's at-rest encryption. That is what
//     this says.
//   - Anthropic is listed because src/lib/kai/agent.ts genuinely calls it.
import type { LegalPage } from "./types";

export const privacy: LegalPage = {
  slug: "privacy",
  title: "Privacy policy",
  updated: "2026-08-30",
  seo: {
    title: "Privacy Policy | KINECT",
    description:
      "How KINECT collects, uses and protects information across kinectnow.com and the KINECT client portal, including data accessed from Google APIs.",
  },
  sections: [
    {
      heading: "Introduction",
      paragraphs: [
        "This policy explains how KINECT collects, uses and protects information when you visit kinectnow.com or one of its persona subdomains (agency.kinectnow.com, services.kinectnow.com, coach.kinectnow.com, consultant.kinectnow.com), and when you or your clients use the KINECT client portal application at app.kinectnow.com.",
        "Throughout this policy, \"customer\" means the business that subscribes to KINECT and operates a workspace, and \"client\" means the people that customer invites into their portal. Customers decide what work, files and messages go into their workspace; KINECT processes that information on their behalf.",
      ],
    },
    {
      heading: "Information we collect",
      paragraphs: [
        "Account information. When you create a KINECT workspace we collect your name, email address and the workspace details you provide. If you sign in with Google, we receive your email address and basic profile information from Google to create and identify your account. We do not store passwords for accounts that sign in through a provider, and passwords for email accounts are stored as salted hashes by our authentication provider, never in readable form.",
        "Workspace content. We store the information you and your clients put into a workspace: clients and contacts, projects, tasks, messages, files and documents, invoices, proposals, rate cards, time entries and similar records. This is your business data, and we process it to provide the service to you.",
        "Connected account data. If you connect a third-party account, such as Google, Meta or LinkedIn, we retrieve data from it on your behalf. The Google section below describes exactly what we access and why.",
        "Billing information. Subscription and payment processing is handled by Stripe. We receive and store the subscription's status, plan and renewal dates, and we never receive or store your full payment card number.",
        "Site and technical information. Our hosting and infrastructure providers generate standard technical logs as part of serving the site and application, such as IP address, browser and device information, pages requested and response times. These logs exist to operate and secure the service and are not used to build a marketing profile of you.",
      ],
    },
    {
      // THE GOOGLE SECTION. Google's OAuth verification reviewers read this
      // page specifically for (a) the Limited Use sentence with the policy
      // name LINKED, and (b) a plain-language description of every scope that
      // MATCHES what the app actually requests. Scopes verified in the
      // platform repo on 2026-08-30:
      //   webmasters.readonly            src/lib/seo/oauth.ts
      //   adwords                        src/lib/ads/oauth.ts
      //   calendar.readonly              src/lib/calendar/oauth.ts
      //   calendar.events   (READ+WRITE) src/lib/calendar/oauth.ts
      //   userinfo.email                 src/lib/calendar/oauth.ts
      // If a scope is ever added or removed, THIS SECTION CHANGES IN THE SAME
      // COMMIT. A description that no longer matches the requested scopes is
      // the most common reason a verified app loses its verification.
      heading: "Google user data",
      paragraphs: [
        "KINECT's use and transfer of information received from Google APIs adheres to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.",
        "We only ever access a Google account that you explicitly connect, from inside your own workspace, and only the specific accounts and properties you choose. Connecting is always initiated by you and can be undone by you at any time.",
        "Google Search Console. We request read-only access to your Search Console data. We use it to show search performance for your own or your clients' sites, such as clicks, impressions, average position and the queries and pages behind them, inside your KINECT workspace.",
        "Google Ads. We request access through the scope Google provides for the Google Ads API. We use it only to read reporting data, so that campaign performance for the ad accounts you connect appears in your KINECT dashboards and reports. We do not create campaigns, change bids or budgets, or spend money on your behalf.",
        "Google Calendar. We request the ability to read your calendars and to create and update events. Reading lets KINECT show your availability and upcoming commitments alongside your client work. Creating and updating events is what lets KINECT put a scheduled session or meeting on your calendar from inside the product. We only write events that you or your client action in KINECT, and we do not modify unrelated events.",
        "Your Google email address. We receive the email address of the Google account you connect, so that the product can show you which account a connection belongs to.",
        "What we do not do with it. We do not sell information received from Google APIs. We do not share it with third parties except the infrastructure providers listed below that store or transmit it in order to run KINECT for you. We do not use it for advertising, and we do not use it to train, retrain or improve any artificial intelligence or machine learning model, our own or anyone else's.",
        "How it is stored and how to stop it. The access and refresh tokens that let KINECT reach your Google account are stored in our database, isolated per workspace by row-level security so no other customer and none of your clients can reach them, and encrypted at rest by our database provider. You can disconnect any Google account at any time from your KINECT settings, which stops all further access immediately and removes the stored tokens. You can also revoke KINECT's access directly from Google at [myaccount.google.com/permissions](https://myaccount.google.com/permissions).",
      ],
    },
    {
      heading: "How we use this information",
      paragraphs: [
        "We use workspace content to provide the product: to render your portals, boards, documents and dashboards, to deliver messages and files between you and your clients, and to produce the reports and analytics you ask for.",
        "We use your account and contact information to operate your subscription, to send transactional email such as invitations, notifications and trial and billing notices, and to answer you when you contact us.",
        "We use aggregate, de-identified usage information to understand how the product is used and to improve it. We do not sell your information to anyone, and we do not use your workspace content or your clients' data for advertising.",
      ],
    },
    {
      heading: "AI features",
      paragraphs: [
        "Some KINECT features use a large language model to summarize activity, draft client updates and answer questions about your own workspace. When you use one of those features, the relevant workspace content is sent to our AI provider, Anthropic, to generate that response.",
        "This processing happens only to produce a result for you. Your workspace content is not used to train Anthropic's models or ours, and content from one workspace is never used to answer a question in another. Data received from Google APIs is not sent to any AI provider for model training under any circumstances.",
      ],
    },
    {
      heading: "Cookies and analytics",
      paragraphs: [
        "On our marketing site we do not set analytics cookies or store any analytics identifiers until you have actively opted in through the cookie consent banner. Before you consent, only the strictly necessary storage needed to remember that choice is set.",
        "If you opt in, we use PostHog, a product analytics tool, to understand aggregate usage patterns such as which pages are visited and which buttons are clicked. PostHog is loaded through a first-party reverse proxy on our own domain rather than PostHog's own domain, and only activates after consent.",
        "Separately, we use Vercel Analytics, which is cookieless and measures aggregate page performance and traffic without setting any tracking cookie or persistent identifier. Because it does not use cookies or track individuals, it runs regardless of your analytics consent choice.",
        "The application itself sets the cookies necessary to keep you signed in and to remember interface preferences. You can change your analytics consent choice at any time using the cookie preferences control in the site footer. See our [Cookie Policy](/legal/cookies) for full detail on what is stored and when.",
      ],
    },
    {
      heading: "How we decide we can use your information",
      paragraphs: [
        "Where laws require a stated legal basis for processing personal information, we rely on the performance of our contract with you to provide the product you have subscribed to, on your consent for analytics that are not strictly necessary and for each third-party account you choose to connect, and on our legitimate interest in operating, securing and improving the service. Where you have a right to withdraw consent, you can do so at any time as described in this policy without affecting the lawfulness of processing carried out before you withdrew it.",
        "This section is deliberately general rather than committed to a specific jurisdiction's framework. A jurisdiction-specific version will be finalized during legal review.",
      ],
    },
    {
      heading: "Service providers",
      paragraphs: [
        "We use a small number of service providers (sometimes called subprocessors) to operate KINECT. We share only the information each provider needs to perform its function, each is contractually limited to using that information only to provide services to KINECT, and we do not sell your information to anyone.",
        "Supabase hosts our database, file storage and authentication. Vercel hosts the site and application and provides cookieless performance analytics. Stripe processes subscription payments. Resend sends transactional email on our behalf. Backblaze stores our encrypted off-site backups. Google provides the APIs described above for the accounts you connect. Anthropic provides the language model behind our AI features. PostHog provides consent-gated analytics on the marketing site.",
        "Each of these providers has its own privacy practices governing how it handles data on our behalf.",
      ],
    },
    {
      heading: "Where your information is stored",
      paragraphs: [
        "Your information is stored on infrastructure located in the United States. If this changes, or if we add regional storage options, we will update this policy.",
      ],
    },
    {
      heading: "How long we keep your information",
      paragraphs: [
        "We keep your workspace content for as long as your workspace exists. If your subscription ends, your workspace becomes read-only rather than being deleted, so that you and your clients can still reach your records; you can ask us to delete it at any time.",
        "Tokens for a connected account are removed when you disconnect that account. Technical logs are retained for a limited period by our infrastructure providers for operational and security purposes.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "You can ask us what information we hold about you, ask us to correct it, or ask us to delete it, at any time. To do so, contact us using the details below. We will respond within a reasonable time and may need to verify your identity before acting on your request.",
        "If you are a client invited into a customer's workspace, that customer controls the workspace and its content. We will refer requests about workspace content to them, and help them action it.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "Data is encrypted in transit and at rest. Access to a workspace is restricted at the database level so that one customer cannot reach another's data, and a client invited into a workspace sees only what that workspace has shared with them. Two-factor authentication is available on every plan and a workspace can require it of all of its members.",
        "If you believe you have found a security issue, please tell us before disclosing it publicly. Contact us at hello@kinectnow.com with as much detail as you can provide.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "KINECT is directed at business professionals and is not intended for children. We do not knowingly collect information from children.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "We may update this policy as our practices, providers or the product evolve. We will update the date at the top of this page when we do, and for material changes we will make reasonable efforts to notify customers by email.",
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
