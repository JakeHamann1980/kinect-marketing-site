import type { SchemaTypeDefinition } from "sanity";

import faq from "./objects/faq";
import card from "./objects/card";
import step from "./objects/step";
import tier from "./objects/tier";
import seo from "./objects/seo";
import hero from "./objects/hero";
import personaCard from "./objects/personaCard";
import screenshot from "./objects/screenshot";

import homePage from "./documents/homePage";
import personaPage from "./documents/personaPage";
import siteSettings from "./documents/siteSettings";
import legalPage from "./documents/legalPage";
import pricingPage from "./documents/pricingPage";

/**
 * Task 17 (Sanity Schemas + Studio). Shared object types (faq, card, step,
 * tier, seo, hero, personaCard, screenshot) followed by the four document
 * types (homePage, siteSettings singletons; personaPage, legalPage lists).
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  faq,
  card,
  step,
  tier,
  seo,
  hero,
  personaCard,
  screenshot,
  homePage,
  personaPage,
  siteSettings,
  legalPage,
  pricingPage,
];
