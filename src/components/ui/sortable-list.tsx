"use client";

import { useId, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { createContext, useContext } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

/* ------------------------------------------------------------------ */
/*  Drag handle                                                        */
/* ------------------------------------------------------------------ */

const DragHandleContext = createContext<{
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
}>({ attributes: {} as DraggableAttributes, listeners: undefined });

export function DragHandle() {
  const { attributes, listeners } = useContext(DragHandleContext);
  return (
    <button
      type="button"
      className="flex cursor-grab touch-none items-center text-muted-foreground transition-colors duration-(--dur-state) hover:text-foreground active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Sortable item wrapper                                              */
/* ------------------------------------------------------------------ */

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <DragHandleContext.Provider value={{ attributes, listeners }}>
        {children}
      </DragHandleContext.Provider>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sortable list                                                      */
/* ------------------------------------------------------------------ */

interface SortableListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  onReorder: (orderedIds: string[]) => void;
}

export function SortableList<T>({
  items,
  keyExtractor,
  renderItem,
  onReorder,
}: SortableListProps<T>) {
  const dndId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const ids = items.map(keyExtractor);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    const reordered = arrayMove(ids, oldIndex, newIndex);
    onReorder(reordered);
  }

  const activeItem = activeId
    ? items.find((item) => keyExtractor(item) === activeId)
    : null;
  const activeIndex = activeId ? ids.indexOf(activeId) : -1;

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <SortableItem key={keyExtractor(item)} id={keyExtractor(item)}>
              {renderItem(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem ? (
          <div className="rounded-lg shadow-lg ring-1 ring-border/10 scale-[1.02]">
            {renderItem(activeItem, activeIndex)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
