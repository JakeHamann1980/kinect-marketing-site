export type Persona = "agency" | "coach" | "consultant";
export const PERSONA_IDS = ["agency", "coach", "consultant"] as const;

export const PERSONAS: Record<
  Persona,
  {
    name: string;
    accent: string;
    accentLight: string;
    tint: string;
    hostname: string;
  }
> = {
  agency: {
    name: "Agency",
    accent: "#35D6E8",
    accentLight: "#0E93AC",
    tint: "rgba(14,147,172,.12)",
    hostname: "agency.kinectapp.ai",
  },
  coach: {
    name: "Coach",
    accent: "#F0913A",
    accentLight: "#C4501F",
    tint: "rgba(240,145,58,.16)",
    hostname: "coach.kinectapp.ai",
  },
  consultant: {
    name: "Consultant",
    accent: "#C7A0C0",
    accentLight: "#6E5AA8",
    tint: "rgba(139,120,192,.18)",
    hostname: "consultant.kinectapp.ai",
  },
};

/** Resolves a Host header to a persona; null for root, www, and unknown hosts. Assumes hostname:port form (not IPv6 literals). */
export function personaFromHost(host: string): Persona | null {
  const sub = host.split(":")[0].split(".")[0];
  return (PERSONA_IDS as readonly string[]).includes(sub)
    ? (sub as Persona)
    : null;
}
