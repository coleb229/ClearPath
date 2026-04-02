"use client"

import { useState, useTransition, useId } from "react"
import { Award, Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import { SortableList, DragHandle } from "@/components/ui/sortable-list"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { EmptyState } from "@/components/ui/empty-state"
import {
  createCertification,
  updateCertification,
  deleteCertification,
  reorderCertifications,
} from "@/app/(app)/profile/actions"

interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: Date | null
  expiryDate: Date | null
  url: string | null
  order: number
}

interface CertificationsFormProps {
  certifications: Certification[]
}

function formatMonthValue(date: Date | null | undefined): string {
  if (!date) return ""
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
}

function formatDate(date: Date | null): string {
  if (!date) return ""
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
}

function CertificationForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Certification
  onSubmit: (formData: FormData) => void
  onCancel: () => void
}) {
  const id = useId()
  const [name, setName] = useState(initial?.name ?? "")
  const [issuer, setIssuer] = useState(initial?.issuer ?? "")
  const [issueDate, setIssueDate] = useState(formatMonthValue(initial?.issueDate))
  const [expiryDate, setExpiryDate] = useState(formatMonthValue(initial?.expiryDate))
  const [url, setUrl] = useState(initial?.url ?? "")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    if (initial) fd.set("id", initial.id)
    fd.set("name", name.trim())
    fd.set("issuer", issuer.trim())
    fd.set("issueDate", issueDate)
    fd.set("expiryDate", expiryDate)
    fd.set("url", url.trim())
    startTransition(() => onSubmit(fd))
  }

  const inputClasses =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Row 1: Name + Issuer */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-muted-foreground mb-1">
            Certification Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AWS Solutions Architect"
            required
            className={inputClasses}
            autoFocus
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-medium text-muted-foreground mb-1">
            Issuer <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="e.g. Amazon Web Services"
            required
            className={inputClasses}
          />
        </div>
      </div>

      {/* Row 2: Issue Date + Expiry Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label
            htmlFor={`${id}-issue`}
            className="text-xs font-medium text-muted-foreground mb-1"
          >
            Issue Date
          </label>
          <input
            id={`${id}-issue`}
            type="month"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor={`${id}-expiry`}
            className="text-xs font-medium text-muted-foreground mb-1"
          >
            Expiry Date
          </label>
          <input
            id={`${id}-expiry`}
            type="month"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Row 3: URL */}
      <div className="flex flex-col">
        <label className="text-xs font-medium text-muted-foreground mb-1">
          URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://credential.example.com/..."
          className={inputClasses}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={isPending || !name.trim() || !issuer.trim()}
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

export function CertificationsForm({ certifications }: CertificationsFormProps) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const sorted = [...certifications].sort((a, b) => a.order - b.order)

  function handleCreate(formData: FormData) {
    createCertification(formData)
    setAdding(false)
  }

  function handleUpdate(formData: FormData) {
    updateCertification(formData)
    setEditingId(null)
  }

  function handleDelete() {
    if (!deleteId) return
    startTransition(() => {
      deleteCertification(deleteId)
    })
    setDeleteId(null)
  }

  function handleReorder(orderedIds: string[]) {
    startTransition(() => {
      reorderCertifications(orderedIds)
    })
  }

  const certToDelete = certifications.find((c) => c.id === deleteId)

  if (certifications.length === 0 && !adding) {
    return (
      <EmptyState
        icon={Award}
        title="No certifications yet"
        description="Add professional certifications and licenses"
        action={{ label: "Add Certification", onClick: () => setAdding(true) }}
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
          Add Certification
        </button>
      )}

      {/* Add form */}
      {adding && (
        <CertificationForm
          onSubmit={handleCreate}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* List */}
      <SortableList
        items={sorted}
        keyExtractor={(c) => c.id}
        onReorder={handleReorder}
        renderItem={(cert) =>
          editingId === cert.id ? (
            <CertificationForm
              initial={cert}
              onSubmit={handleUpdate}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors duration-(--dur-state) hover:bg-muted/40">
              <DragHandle />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{cert.name}</span>
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-accent transition-colors duration-(--dur-state)"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-muted-foreground">{cert.issuer}</span>
                  {(cert.issueDate || cert.expiryDate) && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(cert.issueDate)}
                        {cert.issueDate && cert.expiryDate && " – "}
                        {cert.expiryDate && formatDate(cert.expiryDate)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-(--dur-state)">
                <button
                  type="button"
                  onClick={() => setEditingId(cert.id)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-(--dur-state)"
                  aria-label="Edit certification"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(cert.id)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-(--dur-state)"
                  aria-label="Delete certification"
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
        title="Delete certification"
        description={`Are you sure you want to delete "${certToDelete?.name ?? ""}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  )
}
