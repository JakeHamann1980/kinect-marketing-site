import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

/**
 * Task 17 (Sanity Schemas + Studio). Embedded Studio, mounted at /studio via
 * src/app/studio/[[...tool]]/page.tsx (next-sanity's NextStudio).
 *
 * projectId/dataset read from env with the project's literal values as
 * fallback -- neither is secret (see sanity.cli.ts and .env.example for the
 * same pattern), so the fallback keeps the Studio bootable even if env vars
 * aren't loaded in a given context.
 */
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "gxxphuan";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "kinect-marketing",
  title: "KINECT Marketing",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
