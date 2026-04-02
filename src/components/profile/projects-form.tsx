"use client"

import { useState, useTransition } from "react"
import { FolderOpen, Plus, Pencil, Trash2, ExternalLink, Sparkles } from "lucide-react"
import { SortableList, DragHandle } from "@/components/ui/sortable-list"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { AISuggestionInline } from "./ai-suggestion-inline"
import { useAISuggestion } from "@/hooks/use-ai-suggestion"
import {
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
} from "@/app/(app)/profile/actions"

interface Project {
  id: string
  name: string
  description: string | null
  url: string | null
  startDate: Date | null
  endDate: Date | null
  bullets: string[] | null
  order: number
}

interface ProjectsFormProps {
  projects: Project[]
}

function formatMonthValue(date: Date | null | undefined): string {
  if (!date) return ""
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
}

function ProjectForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Project
  onSubmit: (formData: FormData) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [url, setUrl] = useState(initial?.url ?? "")
  const [startDate, setStartDate] = useState(formatMonthValue(initial?.startDate))
  const [endDate, setEndDate] = useState(formatMonthValue(initial?.endDate))
  const [current, setCurrent] = useState(false)
  const [bullets, setBullets] = useState<string[]>(initial?.bullets ?? [])
  const [isPending, startTransition] = useTransition()

  const { suggestion, isStreaming, suggest, clear } = useAISuggestion("BULLET_POINT")
  const [improvingIndex, setImprovingIndex] = useState<number | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    if (initial) fd.set("id", initial.id)
    fd.set("name", name.trim())
    fd.set("description", description.trim())
    fd.set("url", url.trim())
    fd.set("startDate", startDate)
    fd.set("endDate", current ? "" : endDate)
    const filteredBullets = bullets.filter((b) => b.trim())
    if (filteredBullets.length > 0) {
      fd.set("bullets", JSON.stringify(filteredBullets))
    }
    startTransition(() => onSubmit(fd))
  }

  function addBullet() {
    setBullets([...bullets, ""])
  }

  function updateBullet(index: number, value: string) {
    const next = [...bullets]
    next[index] = value
    setBullets(next)
  }

  function removeBullet(index: number) {
    setBullets(bullets.filter((_, i) => i !== index))
  }

  function improveBullet(index: number) {
    setImprovingIndex(index)
    suggest({
      title: name,
      company: "Project",
      description: bullets[index],
    })
  }

  function acceptSuggestion(text: string) {
    if (improvingIndex !== null) {
      updateBullet(improvingIndex, text)
    }
    setImprovingIndex(null)
    clear()
  }

  function dismissSuggestion() {
    setImprovingIndex(null)
    clear()
  }

  const inputClasses =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Row 1: Project Name */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          Project Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Open Source CLI Tool"
          required
          className={inputClasses}
          autoFocus
        />
      </div>

      {/* Row 2: URL */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/..."
          className={inputClasses}
        />
      </div>

      {/* Row 3: Description */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the project"
          rows={2}
          className={inputClasses + " resize-none"}
        />
      </div>

      {/* Row 4: Date range */}
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        current={current}
        onChange={(s, e, c) => {
          setStartDate(s)
          setEndDate(e)
          setCurrent(c)
        }}
      />

      {/* Row 5: Bullets */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground">
          Key accomplishments
        </label>
        {bullets.map((bullet, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
              <textarea
                value={bullet}
                onChange={(e) => updateBullet(index, e.target.value)}
                placeholder="Describe what you did and the impact..."
                rows={2}
                className={inputClasses + " flex-1 resize-none"}
              />
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => improveBullet(index)}
                  disabled={!bullet.trim() || isStreaming}
                  className="rounded-md bg-accent/10 p-1.5 text-accent transition-colors duration-(--dur-state) hover:bg-accent/20 disabled:opacity-40"
                  title="Improve with AI"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBullet(index)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors duration-(--dur-state) hover:text-destructive hover:bg-destructive/10"
                  title="Remove bullet"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {improvingIndex === index && (suggestion || isStreaming) && (
              <div className="ml-4">
                <AISuggestionInline
                  suggestion={suggestion}
                  isStreaming={isStreaming}
                  onAccept={acceptSuggestion}
                  onDismiss={dismissSuggestion}
                />
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addBullet}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-(--dur-state) hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add bullet
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
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

export function ProjectsForm({ projects }: ProjectsFormProps) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const sorted = [...projects].sort((a, b) => a.order - b.order)

  function handleCreate(formData: FormData) {
    createProject(formData)
    setAdding(false)
  }

  function handleUpdate(formData: FormData) {
    updateProject(formData)
    setEditingId(null)
  }

  function handleDelete() {
    if (!deleteId) return
    startTransition(() => {
      deleteProject(deleteId)
    })
    setDeleteId(null)
  }

  function handleReorder(orderedIds: string[]) {
    startTransition(() => {
      reorderProjects(orderedIds)
    })
  }

  const projectToDelete = projects.find((p) => p.id === deleteId)

  if (projects.length === 0 && !adding) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="Highlight personal or professional projects you're proud of"
        action={{ label: "Add Project", onClick: () => setAdding(true) }}
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
          Add Project
        </button>
      )}

      {/* Add form */}
      {adding && (
        <ProjectForm onSubmit={handleCreate} onCancel={() => setAdding(false)} />
      )}

      {/* List */}
      <SortableList
        items={sorted}
        keyExtractor={(p) => p.id}
        onReorder={handleReorder}
        renderItem={(project) =>
          editingId === project.id ? (
            <ProjectForm
              initial={project}
              onSubmit={handleUpdate}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors duration-(--dur-state) hover:bg-muted/40">
              <DragHandle />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{project.name}</span>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-accent transition-colors duration-(--dur-state)"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {project.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground truncate">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-(--dur-state)">
                <button
                  type="button"
                  onClick={() => setEditingId(project.id)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-(--dur-state)"
                  aria-label="Edit project"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(project.id)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-(--dur-state)"
                  aria-label="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        }
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete project"
        description={`Are you sure you want to delete "${projectToDelete?.name ?? ""}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  )
}
