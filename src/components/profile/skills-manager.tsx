"use client"

import { useState, useTransition } from "react"
import { Lightbulb, Plus, X } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/app/(app)/profile/actions"

type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"

interface Skill {
  id: string
  name: string
  category: string | null
  level: SkillLevel
  order: number
}

interface SkillsManagerProps {
  skills: Skill[]
}

const LEVEL_MAP: Record<SkillLevel, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
}

const LEVELS: SkillLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]
const LEVEL_LABELS: Record<SkillLevel, string> = {
  BEGINNER: "Beg",
  INTERMEDIATE: "Int",
  ADVANCED: "Adv",
  EXPERT: "Exp",
}

function LevelDots({ level }: { level: SkillLevel }) {
  const filled = LEVEL_MAP[level]
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= filled ? "bg-primary" : "bg-muted"
          }`}
        />
      ))}
    </div>
  )
}

function SkillForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Skill
  onSubmit: (formData: FormData) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [category, setCategory] = useState(initial?.category ?? "")
  const [level, setLevel] = useState<SkillLevel>(initial?.level ?? "INTERMEDIATE")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    if (initial) fd.set("id", initial.id)
    fd.set("name", name.trim())
    fd.set("category", category.trim())
    fd.set("level", level)
    startTransition(() => onSubmit(fd))
  }

  const inputClasses =
    "rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-1 min-w-[140px] flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          Skill name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. React"
          required
          className={inputClasses}
          autoFocus
        />
      </div>

      <div className="flex w-32 flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          Category
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Frontend"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          Level
        </label>
        <div className="inline-flex overflow-hidden rounded-lg border border-border">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`px-2 py-1 text-xs transition-colors duration-(--dur-state) ${
                level === l
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity duration-(--dur-state) disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors duration-(--dur-state) hover:bg-secondary/80"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function SkillsManager({ skills }: SkillsManagerProps) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // Group skills by category
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category?.trim() || "General"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {})

  const categoryNames = Object.keys(grouped).sort((a, b) => {
    if (a === "General") return 1
    if (b === "General") return -1
    return a.localeCompare(b)
  })

  function handleCreate(formData: FormData) {
    createSkill(formData)
    setAdding(false)
  }

  function handleUpdate(formData: FormData) {
    updateSkill(formData)
    setEditingId(null)
  }

  function handleDelete() {
    if (!deleteId) return
    startTransition(() => {
      deleteSkill(deleteId)
    })
    setDeleteId(null)
  }

  const skillToDelete = skills.find((s) => s.id === deleteId)

  if (skills.length === 0 && !adding) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="No skills added"
        description="Showcase your technical and professional skills"
        action={{ label: "Add Skill", onClick: () => setAdding(true) }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      {!adding && !editingId && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity duration-(--dur-state) hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </button>
      )}

      {/* Add form */}
      {adding && (
        <SkillForm
          onSubmit={handleCreate}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Edit form (shown at top when editing) */}
      {editingId && (
        <SkillForm
          initial={skills.find((s) => s.id === editingId)}
          onSubmit={handleUpdate}
          onCancel={() => setEditingId(null)}
        />
      )}

      {/* Grouped skill chips */}
      {categoryNames.map((cat) => (
        <div key={cat}>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-4 first:mt-0">
            {cat}
          </h4>
          <div className="flex flex-wrap gap-2">
            {grouped[cat]
              .sort((a, b) => a.order - b.order)
              .map((skill) => (
                <div
                  key={skill.id}
                  className="group relative inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors duration-(--dur-state) hover:bg-muted cursor-pointer"
                  onClick={() => {
                    if (!adding && !editingId) setEditingId(skill.id)
                  }}
                >
                  <span>{skill.name}</span>
                  <LevelDots level={skill.level} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteId(skill.id)
                    }}
                    className="hidden group-hover:flex items-center justify-center h-4 w-4 rounded-full bg-destructive text-white transition-opacity duration-(--dur-state)"
                    aria-label={`Delete ${skill.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete skill"
        description={`Are you sure you want to remove "${skillToDelete?.name ?? ""}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  )
}
