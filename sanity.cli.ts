import { defineCliConfig } from "sanity/cli";

/**
 * Task 17 (Sanity Schemas + Studio). Read from env with the project's literal
 * ID as fallback -- neither value is secret (`NEXT_PUBLIC_*`, and the
 * project ID is inlined into the client bundle anyway), so a fallback here
 * just keeps `sanity` CLI commands (deploy, dataset, etc.) working even in a
 * shell that hasn't loaded `.env.local`.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "gxxphuan";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineCliConfig({
  api: { projectId, dataset },
});
