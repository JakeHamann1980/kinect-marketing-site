# Terms of Service — DRAFT for counsel review

**Status: DRAFT. Not published. Not legal advice.**

Drafted 2026-08-30 at Jake's request, to be reviewed with counsel before it
goes anywhere near the site. It is deliberately NOT wired into
`src/content/legal/terms.ts`, because that module is the seed source for
Sanity and one `npm run seed:sanity` would publish unreviewed contract terms
governing a paid service.

What is live today at kinectnow.com/legal/terms covers the marketing site and
waitlist only, and says the product "will be governed by its own terms of
service, separate from this document." That document has never existed.
Customers are paying under no written product terms. This draft is the
attempt to close that.

Every factual statement about how the product behaves was checked against the
platform repo, not assumed. Where a term depends on a business or legal
decision I cannot make, it appears in **[BRACKETS]** and is listed again at
the bottom.

**Revised 2026-09-01 — section 10 changed, and one change NARROWS a term.**
The free trial went from 14 days to 30. In the same change the post-trial
grace went from 7 days to **48 hours**, which is a reduction in what this
draft previously promised. Both now match the platform
(`20260916100000_trial_thirty_days.sql`). Nothing was breached, because this
document has never been published and no customer has been shown it — but if
it has already gone to counsel, the shortened grace is the line to raise
rather than let them find in a diff. The separate 7-day grace for a FAILED
PAYMENT in section 12 is unchanged and is a different mechanism.

---

## Open questions — answer these before counsel review

1. ~~**Legal entity.**~~ **ANSWERED 2026-08-30, from the Certificate of
   Formation: Kinect LLC, a Texas limited liability company. Texas SOS filing
   #806751919, filed 08/17/2026.**

   Note the capitalization. The certificate reads **Kinect LLC**, title case.
   The brand is styled KINECT in all caps everywhere on the site, but the
   contracting party in an agreement has to be the name as filed, so the
   entity appears as "Kinect LLC" in section 1 and the all-caps KINECT is
   used only as the defined short name thereafter.
2. **Venue and forum.** Governing law is answered (Texas, see 1). Still open:
   do disputes go to courts or to binding arbitration, in which county, and
   is there a class-action waiver? The draft names Texas law and leaves the
   forum bracketed.
2a. **Texas-specific items for counsel.** (Renderer note: the site can now
   render bold in legal prose, added 2026-08-30, so a conspicuousness
   requirement is no longer blocked on a template change.) Two worth raising because they are
   Texas law rather than general drafting: whether to include a Texas
   Deceptive Trade Practices Act waiver (available for business-to-business
   contracts meeting the statutory thresholds), and the conspicuousness
   requirement Texas applies to warranty disclaimers and limitations of
   liability. Sections 18 and 19 may need to be set in bold or capitals to
   be enforceable, which changes how they render on the page.
3. **Refunds.** There is no refund or proration logic in the product today:
   cancelling sets `cancel_at_period_end`, access runs to the end of the paid
   period, and nothing is refunded. Draft says exactly that. Confirm it is
   the intended policy.
4. **Liability cap.** Convention is fees paid in the preceding 12 months.
   Confirm, and confirm the carve-outs.
5. **Price-change notice.** How much notice before a price increase takes
   effect? Draft says 30 days.
6. **Data retention after cancellation.** Today a lapsed workspace goes
   read-only and is never deleted. Is there an eventual deletion date, or is
   "kept until you ask us to delete it" the actual policy? Draft says the
   latter, because that is what the product does.
7. **Do client contacts accept these terms?** They are invited by the
   customer and never sign up themselves. Draft makes the customer
   responsible for its clients rather than binding the clients directly.
   Counsel should confirm that holds.
8. **DPA.** The footer already lists a DPA link, currently hidden because no
   DPA exists. Any customer with EU or UK data will ask. Separate document.
9. **Uptime.** Draft promises no SLA, because there is none, and there is not
   even a status page yet. Confirm we are comfortable saying so plainly.
10. **Minimum age / business use.** Draft restricts to business use by people
    who can form a contract. Confirm.

---

## 1. Who this agreement is between

These Terms of Service are an agreement between **Kinect LLC**, a Texas
limited liability company ("KINECT", "we", "us") and the business or individual that creates a KINECT workspace ("you",
"Customer"). By creating a workspace, subscribing to a plan, or using the
KINECT application, you agree to these terms. If you are agreeing on behalf of
a company, you confirm you have authority to bind it.

**Definitions.** "Service" means the KINECT client-portal application at
app.kinectnow.com and the related sites we operate. "Workspace" is the
account area you create and control. "Client" means a person you invite into
your Workspace as a client contact. "Customer Content" means everything you
or your Clients put into the Workspace: client records, projects, tasks,
messages, files, documents, invoices, proposals, time entries and similar.

## 2. Your account

You must be able to form a binding contract and must use the Service for
business purposes. You are responsible for the accuracy of your account
information, for the security of your credentials, and for everything done
through your Workspace by your team.

Two-factor authentication is available on every plan and we recommend it. A
Workspace administrator can require it of all members.

## 3. Your Clients

You decide who to invite into your Workspace and what to share with them. A
Client sees only what you have shared with that Client.

You are responsible for your relationship with your Clients, for the lawfulness
of the Customer Content you place in the Workspace, and for having whatever
permissions you need to put your Clients' information into the Service. We
provide the Service to you; we do not have a separate agreement with your
Clients.

## 4. Customer Content

**You own your Customer Content.** We do not claim ownership of it.

You grant us the limited rights we need to run the Service for you: to store,
process, transmit, back up and display Customer Content in order to operate
the Workspace, deliver it to the people you have shared it with, and provide
support when you ask for it. That licence exists only to provide the Service
and ends when the Content is deleted.

We do not sell Customer Content, and we do not use it to train artificial
intelligence or machine learning models. See section 8.

## 5. Acceptable use

You agree not to use the Service to store or transmit anything unlawful,
infringing, or malicious; to attempt to breach or probe our security or the
isolation between Workspaces except through the responsible-disclosure process
on our Security page; to reverse engineer the Service; to resell or provide
the Service to third parties other than by inviting your own Clients; or to
use it in a way that degrades it for others.

We may investigate suspected violations and take reasonable action, including
the suspension described in section 13.

## 6. Third-party accounts you connect

The Service can connect to outside accounts you authorize, such as Google,
Meta and LinkedIn, to bring your data into your Workspace. You are responsible
for having the right to connect those accounts and for complying with the
relevant provider's own terms.

We access only what you connect, we request the narrowest access that will do
the job, and you can disconnect at any time from your settings, which stops all
further access immediately. What we access from each provider, and what we
never do with it, is set out in our Privacy Policy.

Those providers are independent of us. We are not responsible for their
services, their availability, or changes they make to their APIs.

## 7. Beta and changing features

We improve the Service continuously and may add, change or remove features.
Where a change materially reduces core functionality of the plan you pay for,
we will give reasonable notice. Features we describe as coming soon are not
part of what you are buying today, and you should subscribe based on what the
Service does now.

## 8. AI features

Some features use a large language model to summarize activity, draft client
updates, and answer questions about your own Workspace. When you use one, the
relevant Customer Content is sent to our AI provider to generate that response.

That processing happens only to produce a result for you. Customer Content is
not used to train our models or our provider's, and content from one Workspace
is never used to answer a question in another. AI output can be wrong; it is
a drafting aid and you are responsible for reviewing anything you send to a
Client.

## 9. Plans, pricing and payment

Plans are flat monthly prices: Kinect at $149, Kinect Plus at $399, and Kinect
Pro at $799 per month. **There is no per-seat or per-client charge**, and every
plan includes unlimited Clients.

Payments are processed by Stripe. By subscribing you authorize us, through
Stripe, to charge your payment method the recurring fee for your plan until
you cancel. Fees are stated exclusive of taxes, and you are responsible for
any applicable taxes.

Prices may change. We will give you at least **[30 DAYS]** notice before a
change takes effect for your subscription, and you may cancel before it does.

## 10. Free trial

New Workspaces start with a 30-day free trial on Kinect Plus. **We do not take
a payment method to start a trial**, so nothing is charged and nothing converts
automatically. If you do not choose a plan, the trial simply ends.

After the trial ends you keep full access for a further 48 hours. After that,
the Workspace becomes read-only as described in section 12.

## 11. Storage

Each plan includes storage: 100 GB on Kinect, 500 GB on Kinect Plus, and 2 TB
on Kinect Pro. Additional storage is available at $10 per 100 GB per month.

The included amount is a soft limit. **Uploads keep working past it** and we
will prompt you to add storage rather than refusing a file in front of your
Client. Continued material use above your plan's storage without adding
capacity may lead us to ask you to upgrade.

## 12. Cancellation, and what happens after

You can cancel at any time from your billing settings. **Cancellation takes
effect at the end of the period you have already paid for**, and you keep full
access until then. We do not provide refunds or credits for partial periods.

When a subscription ends, whether by cancellation or non-payment, your
Workspace becomes **read-only rather than being deleted**. You and your Clients
can still sign in and see everything; you cannot add new content until you
subscribe again. Subscribing again restores write access immediately.

If a payment fails, the Workspace stays fully usable for a 7-day grace period
while we retry, and becomes read-only after that.

We keep your Customer Content while your Workspace exists. **[You can ask us to
export or delete it at any time.]** We do not delete it on our own schedule.

## 13. Suspension and termination by us

We may suspend or terminate a Workspace if you materially breach these terms,
if required by law, or if your use poses a security or legal risk to us or to
other customers. Except where the situation makes it impossible or unwise, we
will tell you why and give you a chance to fix it first.

On termination for breach we may delete Customer Content after giving you a
reasonable opportunity to retrieve it.

## 14. Availability

We work to keep the Service available and reliable, but **we do not currently
offer an uptime service level agreement**, and the Service is provided on an
as-available basis. We will not pretend otherwise in order to close a deal.

We take backups (described on our Security page), but you remain responsible
for keeping your own copies of anything you cannot afford to lose.

## 15. Security and privacy

How we protect data is described on our Security page. How we collect and use
information is described in our Privacy Policy, which forms part of these
terms. Where we process personal data on your behalf, you are the controller
and we are the processor. **[A data processing addendum is available on
request — SEE OPEN QUESTION 8.]**

## 16. Confidentiality

Each of us may learn confidential information of the other. Each will protect
the other's confidential information with at least reasonable care and use it
only to perform under these terms. This does not apply to information that is
public, independently developed, or lawfully received from someone else, and
does not prevent disclosure required by law.

## 17. Our intellectual property

The Service, including its software, design and documentation, belongs to us.
These terms grant you a limited, non-exclusive, non-transferable right to use
the Service during your subscription, and nothing more.

If you send us feedback or suggestions, we may use them without obligation to
you. We will not identify you as the source without your permission.

## 18. Disclaimers

Except as expressly stated in these terms, the Service is provided "as is" and
we disclaim all other warranties to the extent the law allows, including
implied warranties of merchantability, fitness for a particular purpose and
non-infringement. We do not warrant that the Service will be uninterrupted or
error-free, or that AI-generated output will be accurate.

## 19. Limitation of liability

To the extent the law allows, neither party is liable for indirect,
incidental, special, consequential or punitive damages, or for lost profits,
revenue or data, arising out of these terms.

Our total liability arising out of or relating to these terms will not exceed
**[THE FEES YOU PAID US IN THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO THE
CLAIM]**.

**[Counsel: confirm the cap, and which carve-outs survive it.]**

## 20. Indemnification

You will defend and indemnify us against third-party claims arising from your
Customer Content, your use of the Service in breach of these terms, or your
relationship with your Clients. We will tell you promptly about any such claim
and let you control the defence, provided any settlement releases us fully.

**[Counsel: consider whether KINECT should give a reciprocal IP indemnity.]**

## 21. Changes to these terms

We may update these terms. For material changes we will give reasonable notice,
by email or in the product, before they take effect. Continuing to use the
Service after that means you accept the updated terms. If you do not accept
them, you may cancel.

## 22. Governing law and disputes

These terms are governed by the laws of the **State of Texas**, without regard
to conflict of laws rules. **[Disputes will be resolved in the state and
federal courts located in [COUNTY] County, Texas / by binding arbitration
administered by [BODY] — DECISION NEEDED, SEE OPEN QUESTION 2.]**

## 23. General

These terms, together with the Privacy Policy, are the entire agreement between
us about the Service and replace any earlier understandings. If any provision
is unenforceable, the rest stays in force. Neither of us may assign this
agreement without the other's consent, except in connection with a merger or
sale of substantially all assets. Our failure to enforce a provision is not a
waiver of it.

Notices to you go to the email on your account. Notices to us go to
hello@kinectnow.com.

## 24. Contact

Questions about these terms: hello@kinectnow.com.

---

## Product facts these terms rely on, and where they were verified

| Statement | Verified against |
| --- | --- |
| $149 / $399 / $799, flat, unlimited clients | `src/content/settings.ts` (website) |
| No per-seat or per-client charge | same |
| 30-day trial on Kinect Plus, no card taken | `app.start_workspace_trial()`, `20260916100000_trial_thirty_days.sql` |
| 48-hour grace after trial, then read-only | `app.workspace_limits`, `20260916100000_trial_thirty_days.sql` |
| past_due keeps access 7 days | `app.workspace_limits`, past_due branch |
| Cancellation runs to end of paid period | `cancel_at_period_end` in `apply-event.ts` |
| No refunds or proration | no refund logic exists anywhere in the platform |
| Lapsed workspace is read-only, not deleted | `is_writable` false; no deletion path |
| Storage 100 GB / 500 GB / 2 TB, $10 per 100 GB | `src/content/pricing-page.ts`, `20260829100000_storage_quota.sql` |
| Storage cap is SOFT, uploads keep working | `20260829100000_storage_quota.sql` |
| Payments via Stripe, no card data on our servers | `plan/actions.ts` Checkout |
| AI provider processes workspace content | `src/lib/kai/agent.ts` |
| Two-factor on every plan; workspace-wide requirement | `20260907110000_workspace_mfa.sql` |
| No uptime SLA, no status page | nothing implements one; footer Status link is gated |
