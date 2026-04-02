"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { updateProfile } from "@/app/(app)/profile/actions"
import { useAISuggestion } from "@/hooks/use-ai-suggestion"
import { AISuggestionInline } from "./ai-suggestion-inline"
import { Sparkles, Phone, MapPin, Globe, Link2, Code2 } from "lucide-react"

interface ProfileHeaderProps {
  profile: {
    headline?: string | null
    summary?: string | null
    phone?: string | null
    location?: string | null
    website?: string | null
    linkedin?: string | null
    github?: string | null
  } | null
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium transition-opacity duration-(--dur-state) disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save Profile"}
    </button>
  )
}

const inputClass =
  "rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 w-full"

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [headline, setHeadline] = useState(profile?.headline ?? "")
  const [summary, setSummary] = useState(profile?.summary ?? "")
  const [phone, setPhone] = useState(profile?.phone ?? "")
  const [location, setLocation] = useState(profile?.location ?? "")
  const [website, setWebsite] = useState(profile?.website ?? "")
  const [linkedin, setLinkedin] = useState(profile?.linkedin ?? "")
  const [github, setGithub] = useState(profile?.github ?? "")

  const ai = useAISuggestion("SUMMARY")

  function handleGenerateSummary() {
    ai.suggest({ headline: headline || undefined })
  }

  function handleAcceptSummary(text: string) {
    setSummary(text)
    ai.clear()
  }

  return (
    <form action={async (formData: FormData) => { await updateProfile(formData) }} className="rounded-xl border border-border bg-card p-6">
      <div className="space-y-6">
        {/* Headline */}
        <div>
          <label htmlFor="headline" className="text-xs font-medium text-muted-foreground">
            Headline
          </label>
          <input
            id="headline"
            name="headline"
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g., Senior Software Engineer"
            className={`${inputClass} mt-1 text-lg`}
          />
        </div>

        {/* Summary */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="summary" className="text-xs font-medium text-muted-foreground">
              Professional Summary
            </label>
            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={ai.isStreaming}
              className="inline-flex items-center gap-1 text-sm text-accent transition-colors duration-(--dur-state) hover:text-accent/80 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate with AI
            </button>
          </div>
          <textarea
            id="summary"
            name="summary"
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a brief professional summary..."
            className={`${inputClass} mt-1 resize-none`}
          />
          {(ai.suggestion || ai.isStreaming) && (
            <div className="mt-2">
              <AISuggestionInline
                suggestion={ai.suggestion}
                isStreaming={ai.isStreaming}
                onAccept={handleAcceptSummary}
                onDismiss={ai.clear}
              />
            </div>
          )}
          {ai.error && (
            <p className="mt-1 text-xs text-destructive">{ai.error}</p>
          )}
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ContactField
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="+1 (555) 123-4567"
          />
          <ContactField
            icon={<MapPin className="h-4 w-4" />}
            label="Location"
            name="location"
            value={location}
            onChange={setLocation}
            placeholder="San Francisco, CA"
          />
          <ContactField
            icon={<Globe className="h-4 w-4" />}
            label="Website"
            name="website"
            type="url"
            value={website}
            onChange={setWebsite}
            placeholder="https://yoursite.com"
          />
          <ContactField
            icon={<Link2 className="h-4 w-4" />}
            label="LinkedIn"
            name="linkedin"
            type="url"
            value={linkedin}
            onChange={setLinkedin}
            placeholder="https://linkedin.com/in/you"
          />
          <ContactField
            icon={<Code2 className="h-4 w-4" />}
            label="GitHub"
            name="github"
            type="url"
            value={github}
            onChange={setGithub}
            placeholder="https://github.com/you"
          />
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </div>
    </form>
  )
}

function ContactField({
  icon,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode
  label: string
  name: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  )
}
