/**
 * KINECT social profiles, defined ONCE because two very different consumers
 * need the same URLs and must never disagree:
 *  - the footer's social icon row, and
 *  - `organizationLd`'s `sameAs`, which is what lets search and AI answer
 *    engines resolve "KINECT" to one entity. Per the competitive
 *    assessment, that disambiguation is the whole reason we can be cited at
 *    all while sharing a name with trykinect.ai, kenect.com and Kinectiv.
 *
 * Handles confirmed 2026-08-03 by fetching each profile:
 *  - LinkedIn  -> page title "KINECT | LinkedIn"        (exists)
 *  - YouTube   -> page title "KinectNow - YouTube"      (exists)
 *  - Instagram -> serves a generic bot shell, so it could not be verified
 *    independently; shipped on Jake's word that the handle is claimed.
 *  - X         -> "User Profile Not Found - X | 404 Error". The @kinectnow
 *    handle does NOT exist on X today, so it stays `draft` (hidden on the
 *    live site, and excluded from sameAs) rather than shipping a link that
 *    404s. Claim the handle, drop the flag, and it goes live in both places
 *    at once.
 */
export interface SocialProfile {
  label: string;
  href: string;
  /** Not live: no confirmed profile behind it yet. */
  draft?: boolean;
}

// Verified 2026-08-03 unless noted:
//  - X         -> "Kinect (@KinectNow) / X". NOTE the capitalisation: the
//    lowercase /kinectnow path 404s, so the cased URL is the real one.
//  - LinkedIn  -> "KINECT | LinkedIn"
//  - YouTube   -> "KinectNow - YouTube"
//  - Facebook  -> supplied by Jake; Meta returns 400 to datacenter IPs on
//    both /profile.php?id= and /<id> forms, so it could not be verified
//    from here. Shipped on his word. Worth claiming a vanity URL later --
//    a numeric profile.php link is unlovely next to the others.
//  - Instagram -> still pending a handle, so it stays draft and stays out
//    of sameAs until it exists.
export const SOCIAL_PROFILES: SocialProfile[] = [
  { label: "X", href: "https://x.com/KinectNow" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61593554393471" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/kinectnow" },
  { label: "Instagram", href: "https://www.instagram.com/kinectnow", draft: true },
  { label: "YouTube", href: "https://www.youtube.com/@kinectnow" },
];

/**
 * Profiles that actually exist, for `sameAs`. Deliberately filtered on
 * `draft` directly rather than through `visibleLinks`: structured data
 * describes reality and must not change shape just because a developer is
 * running with draft pages enabled.
 */
export const LIVE_SOCIAL_URLS: string[] = SOCIAL_PROFILES.filter(
  (profile) => !profile.draft,
).map((profile) => profile.href);
