/**
 * Lightweight pre-filter for clearly illegal/abusive requests. This runs in
 * addition to (never instead of) whatever mandatory moderation the
 * configured image provider itself enforces. It intentionally does NOT try
 * to block ordinary adult, violent, horror, or otherwise edgy fictional
 * content — only categories that are illegal or abusive regardless of
 * fictional framing.
 */

interface SafetyCheckResult {
  allowed: boolean;
  reason?: string;
}

const CHILD_TERMS =
  /\b(child|children|kid|kids|minor|minors|toddler|infant|preteen|pre-teen|underage|schoolgirl|schoolboy|loli|shota)\b/i;

const SEXUAL_TERMS =
  /\b(nude|naked|nsfw|sex(ual)?|porn(ographic)?|erotic|fetish|explicit|topless|genitals?)\b/i;

// Sexual content involving minors, in any combination/order of terms.
const CSAM_PATTERN = new RegExp(
  `(${CHILD_TERMS.source}[\\s\\S]{0,60}${SEXUAL_TERMS.source})|(${SEXUAL_TERMS.source}[\\s\\S]{0,60}${CHILD_TERMS.source})`,
  "i",
);

// Real-world instructions for mass-casualty weapons, explosives, or other
// serious wrongdoing occasionally smuggled in as an "image" prompt.
const SERIOUS_WRONGDOING_PATTERNS: RegExp[] = [
  /\bhow to (make|build|synthesi[sz]e|create)\b[\s\S]{0,40}\b(bomb|explosive|nerve agent|bioweapon|chemical weapon|nerve gas|pipe bomb)\b/i,
  /\b(synthesis|recipe|instructions?) (for|of) [\s\S]{0,30}\b(sarin|ricin|anthrax|methamphetamine|fentanyl)\b/i,
  /\bundetectable (firearm|gun|weapon)\b.*\b(blueprint|schematic|instructions)\b/i,
  /\bhow to (get away with|commit) (murder|genocide|mass shooting|terrorist attack)\b/i,
];

const EXPLOITATION_PATTERNS: RegExp[] = [
  /\bnon[- ]?consensual\b[\s\S]{0,40}\b(sexual|explicit|nude)\b/i,
  /\b(sex|human) trafficking\b[\s\S]{0,40}\b(promot|advertis|recruit)/i,
];

interface SafetyCheckOptions {
  /** True when this prompt is editing a real uploaded photo rather than generating from scratch. */
  hasSourceImage?: boolean;
}

export function checkPromptSafety(prompt: string, options: SafetyCheckOptions = {}): SafetyCheckResult {
  const text = prompt.trim();

  if (!text) {
    return { allowed: false, reason: "Prompt is empty." };
  }

  if (CSAM_PATTERN.test(text)) {
    return {
      allowed: false,
      reason:
        "This request appears to involve sexual content with minors, which is never allowed.",
    };
  }

  // Undressing/sexualizing a real uploaded photo is non-consensual intimate
  // imagery regardless of who the uploader claims the subject is — there's
  // no fictional-framing exception here, unlike text-to-image generation.
  if (options.hasSourceImage && SEXUAL_TERMS.test(text)) {
    return {
      allowed: false,
      reason:
        "Editing a real uploaded photo into nude or sexual content isn't supported.",
    };
  }

  for (const pattern of SERIOUS_WRONGDOING_PATTERNS) {
    if (pattern.test(text)) {
      return {
        allowed: false,
        reason: "This request appears to ask for instructions that facilitate serious harm.",
      };
    }
  }

  for (const pattern of EXPLOITATION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        allowed: false,
        reason: "This request appears to involve exploitation or non-consensual content.",
      };
    }
  }

  return { allowed: true };
}
