interface ProfileData {
  headline?: string | null;
  summary?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  linkedin?: string | null;
}

export interface CompletenessInput {
  profile: ProfileData | null;
  experienceCount: number;
  educationCount: number;
  skillCount: number;
  projectCount: number;
}

export function getCompleteness(props: CompletenessInput): number {
  let score = 0;
  const p = props.profile;

  if (p?.headline) score += 10;
  if (p?.summary) score += 10;
  if (props.experienceCount >= 1) score += 25;
  if (props.educationCount >= 1) score += 15;
  if (props.skillCount >= 3) score += 15;
  if (props.projectCount >= 1) score += 10;
  if (p?.phone || p?.location) score += 10;
  if (p?.linkedin || p?.website) score += 5;

  return score;
}
