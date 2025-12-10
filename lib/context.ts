// ABOUTME: Context management for PBF visualization
// ABOUTME: 3 separate contexts with localStorage override support

// Storage keys for localStorage
export const STORAGE_KEYS = {
  facilitySpecs: 'pbf-facility-specs',
  designGuidelines: 'pbf-design-guidelines',
  companyContext: 'pbf-company-context',
} as const;

// Default contexts (fallback if files not loaded)
export const DEFAULT_FACILITY_SPECS = `MAIN BUILDING:
- Dimensions: 130m long x 80m wide
- Height: 8m at center (sloped roof with skylights)
- Structure: Divided into 2 SEPARATE HALLS by solid opaque wall in middle
- Each hall contains 6 circular tanks (arranged in 2 rows of 3)
- Total internal tanks: 12 (6 per hall)
- External migration tanks: 4 circular tanks outside building

TANK SPECIFICATIONS:
- Diameter: 16m each
- Height: 1.8m
- Volume: 350 cubic meters
- Material: Blue fiberglass
- Spacing: 3m between tanks

BUILDING FEATURES:
- Walls: Tinted semi-transparent glass (blue-green tint)
- Roof: Sloped with skylights along center ridge for natural light
- Floor: Light gray epoxy with blue directional lines
- LED lighting along tank edges
- Digital monitoring screens
- Stainless steel railings
- Plants along walkways

QUARANTINE BUILDING (separate):
- Dimensions: 25m wide x 50m deep
- Contains 14 smaller circular tanks
- Tank diameter: 5-6m each`;

export const DEFAULT_DESIGN_GUIDELINES = `# Pure Blue Fish - Design Guidelines

## Concept
High-tech aquaculture facility, NOT agricultural/farm aesthetic.
Clean, modern, professional appearance. Premium, futuristic feel.

## Color Palette
- Pure Blue #0066CC (tanks, accents)
- Turquoise #008B8B (water, atmosphere)
- White #F5F5F5 (floors, walls)
- Gray #4A4A4A (steel, frames)
- Green #228B22 (plants)

## Required Elements
- Light gray epoxy floor with blue lines
- Digital monitoring screens
- Workers in white lab coats
- Plants along walkways
- Blue LED lighting on tank edges
- Clear water with visible fish
- Stainless steel railings

## MUST AVOID
- Farm aesthetic (hay, dirt, rust)
- Murky water
- Messy exposed pipes
- Dark industrial atmosphere`;

export const DEFAULT_COMPANY_CONTEXT = `# Pure Blue Fish (PBF)

Israeli aquaculture company with Zero Water Discharge (ZWD) technology.
Mission: "Saving the Ocean & Feeding the World"
Founded 2016, HQ: Binyamina, Israel

## Facilities
- Israel (Binyamina): 125 tonnes/year, Red Drum - OPERATIONAL
- USA (South Carolina): 5,000 tonnes/year planned - FUNDRAISING

## Technology
Only proven commercial ZWD-RAS globally.
Complete nitrogen + carbon cycles = zero water discharge.
Can build anywhere (no coastal requirement).

## Species
- Red Drum: $12-12.50/kg, mild white meat
- Yellowtail Kingfish: $18-20/kg, sushi-grade premium`;

// Legacy exports for backward compatibility
export const DEFAULT_FACILITY_CONTEXT = DEFAULT_FACILITY_SPECS;
export const CONTEXT_STORAGE_KEY = STORAGE_KEYS.facilitySpecs;

// Helper to load context with localStorage override
export async function loadContext(
  key: keyof typeof STORAGE_KEYS,
  serverFile: string,
  defaultValue: string
): Promise<string> {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEYS[key]);
    if (saved) return saved;
  }

  // Try server file
  try {
    const res = await fetch(serverFile);
    if (res.ok) return await res.text();
  } catch {
    // Fall through to default
  }

  return defaultValue;
}

// Build prompt with context (for direct mode / image generation)
export function buildPromptWithContext(
  userPrompt: string,
  includeContext: boolean,
  customContext?: string
): string {
  if (!includeContext) {
    return userPrompt;
  }

  const context = customContext || DEFAULT_FACILITY_SPECS;

  return `${userPrompt}

---
FACILITY CONTEXT (use these specifications):
${context}
---

Generate a photorealistic architectural visualization based on the above specifications.`;
}
