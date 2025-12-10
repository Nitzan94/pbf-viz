// ABOUTME: PBF facility context for Gemini prompt injection
// ABOUTME: Contains all technical specs that get added to user prompts

export const PBF_FACILITY_CONTEXT = `
PURE BLUE FISH FACILITY SPECIFICATIONS:

COMPANY:
Pure Blue Fish (PBF) - Israeli aquaculture company with Zero Water Discharge (ZWD) technology.
Mission: "Saving the Ocean & Feeding the World"

MAIN BUILDING:
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
- Tank diameter: 5-6m each

STYLE REQUIREMENTS:
- High-tech aquaculture facility, NOT agricultural/farm aesthetic
- Clean, modern, professional appearance
- Premium, futuristic feel

COLOR PALETTE:
- Pure Blue: #0066CC (tanks, accents)
- Turquoise: #008B8B (water)
- White/Light Gray: #F5F5F5 (floors, structure)
- Steel Gray: #4A4A4A (metal elements)
- Green: #228B22 (plants)

MUST AVOID:
- Farm/agricultural look (hay, dirt, rust)
- Murky or dirty water
- Exposed messy pipes
- Dark industrial atmosphere
- Worn or weathered appearance
`;

export function buildPromptWithContext(userPrompt: string, includeContext: boolean): string {
  if (!includeContext) {
    return userPrompt;
  }

  return `${userPrompt}

---
FACILITY CONTEXT (use these specifications):
${PBF_FACILITY_CONTEXT}
---

Generate a photorealistic architectural visualization based on the above specifications.`;
}
