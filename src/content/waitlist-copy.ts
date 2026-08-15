/**
 * Task 16 (waitlist): copy shared between WaitlistDialog.tsx (a "use
 * client" component) and src/app/actions/waitlist.ts (a "use server"
 * action). Neither file can import the other's module directly for this
 * purpose -- the dialog must never pull server-only code into the client
 * bundle, and the action's own module is off-limits to client components
 * per its own doc comment ("NEVER import this module into client
 * components except via the action reference"). A small shared content
 * file both sides import is the cleanest fix, and it also gives
 * content.test.ts's existing copy-constraint checks (no em dashes, no
 * exclamation points, no emoji) a single place to reach both the dialog's
 * UI strings and the confirmation email's subject/body without importing
 * the server action (which content.test.ts, a plain unit test, cannot run
 * -- it has no Supabase/Resend environment).
 *
 * NEW copy, drafted for this task (design-reference has no waitlist dialog
 * or email content of its own to recover -- README only flags "'Start
 * free' destination -- signup flow, waitlist, or demo request? Not
 * designed."). Written in the site's existing voice (short declaratives,
 * no em dashes, no exclamation points -- see home.ts's closing copy for
 * the same register) but NOT yet Jake-approved; flagged here rather than
 * presented as recovered/approved copy.
 */
export const waitlistDialogCopy = {
  heading: "Get your portal first",
  intro: "Join the list and we will email you the moment KINECT opens up.",
  emailLabel: "Email",
  submitIdle: "Join the waitlist",
  submitPending: "Joining...",
  success: "You are on the list.",
  successNext: "We will email you when your invite is ready.",
  already: "You are already on the list.",
  errorUnavailable: "The waitlist is warming up. Try again shortly.",
  errorInvalidEmail: "Enter a valid email address and try again.",
};

/**
 * Broken into named parts (2026-08-03) so the plain-text body and the
 * branded HTML version (src/lib/waitlist-email.ts) are built from ONE set
 * of strings. The first confirmation ever sent went out as bare plain text
 * and read nothing like the platform's emails; splitting the copy is what
 * lets the HTML use each line in its own element without the two formats
 * drifting apart. Keeping the words here also keeps them under
 * content.test.ts's voice rules (no em dashes, no exclamation points).
 */
const emailLines = {
  heading: "You are on the list.",
  intro:
    "You are on the KINECT waitlist. When your invite is ready, we will email this address with next steps.",
  cta: "See what you are getting",
  reply: "Questions? Just reply to this email.",
  signoff: "The KINECT team",
};

export const waitlistEmailCopy = {
  subject: "You are on the KINECT list",
  ...emailLines,
  ctaHref: "https://kinectnow.com/",
  body: [
    "Hi,",
    "",
    emailLines.intro,
    "",
    emailLines.reply,
    "",
    emailLines.signoff,
  ].join("\n"),
};
