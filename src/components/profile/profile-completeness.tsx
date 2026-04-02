"use client"

import { getCompleteness } from "@/lib/profile-completeness"
export { getCompleteness }

export interface ProfileCompletenessProps {
  profile: {
    headline?: string | null
    summary?: string | null
    phone?: string | null
    location?: string | null
    website?: string | null
    linkedin?: string | null
  } | null
  experienceCount: number
  educationCount: number
  skillCount: number
  projectCount: number
  size?: number
  strokeWidth?: number
}

function getEncouragement(pct: number): string {
  if (pct >= 100) return "Profile complete!"
  if (pct >= 76) return "Looking sharp!"
  if (pct >= 51) return "Almost there!"
  if (pct >= 26) return "Great start!"
  return "Let's get started!"
}

export function ProfileCompleteness(props: ProfileCompletenessProps) {
  const pct = getCompleteness(props)
  const message = getEncouragement(pct)

  const size = props.size ?? 80
  const strokeWidth = props.strokeWidth ?? 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-primary transition-all duration-(--dur-layout)"
          />
        </svg>

        {/* Centered percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">{pct}%</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">{message}</p>
    </div>
  )
}
