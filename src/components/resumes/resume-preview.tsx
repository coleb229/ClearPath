"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, X } from "lucide-react";
import type { ResolvedResumeData } from "@/types/resume";
import { templateComponents } from "@/components/resumes/templates";

interface ResumePreviewProps {
  data: ResolvedResumeData;
  templateSlug: string;
}

const PAPER_WIDTH = 816;
const PAPER_HEIGHT = 1056;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.15;
const PADDING = 32;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ResumePreview({ data, templateSlug }: ResumePreviewProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.5);
  const [fitZoom, setFitZoom] = useState(0.5);
  const [fullscreen, setFullscreen] = useState(false);
  const hasInitialized = useRef(false);

  // Drag-to-pan state
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Calculate fit-to-width zoom
  const calculateFitZoom = useCallback(() => {
    if (!canvasRef.current) return 0.5;
    const containerWidth = canvasRef.current.clientWidth - PADDING * 2;
    return clamp(containerWidth / PAPER_WIDTH, ZOOM_MIN, 1.5);
  }, []);

  // On mount: set initial zoom. On resize: only update fitZoom.
  useEffect(() => {
    function init() {
      const fit = calculateFitZoom();
      setFitZoom(fit);
      if (!hasInitialized.current) {
        setZoom(fit);
        hasInitialized.current = true;
      }
    }

    init();
    const observer = new ResizeObserver(() => {
      setFitZoom(calculateFitZoom());
    });
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [calculateFitZoom]);

  // Recalculate fit zoom when entering/exiting fullscreen (container size changes)
  useEffect(() => {
    // Small delay to let the layout settle
    const id = setTimeout(() => {
      const fit = calculateFitZoom();
      setFitZoom(fit);
      setZoom(fit);
    }, 50);
    return () => clearTimeout(id);
  }, [fullscreen, calculateFitZoom]);

  // Ctrl/Cmd + scroll wheel zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function handleWheel(e: WheelEvent) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom((prev) => clamp(prev + delta, ZOOM_MIN, ZOOM_MAX));
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && fullscreen) {
        setFullscreen(false);
        return;
      }
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        setZoom((prev) => clamp(prev + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
      } else if (e.key === "-") {
        e.preventDefault();
        setZoom((prev) => clamp(prev - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
      } else if (e.key === "0") {
        e.preventDefault();
        setZoom(fitZoom);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fitZoom, fullscreen]);

  // Drag-to-pan handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only drag on primary button, and not on interactive elements
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, [role='button']")) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: canvas.scrollLeft,
      scrollTop: canvas.scrollTop,
    };
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = "grabbing";
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    canvas.scrollLeft = dragStart.current.scrollLeft - dx;
    canvas.scrollTop = dragStart.current.scrollTop - dy;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = "";
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => clamp(prev + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => clamp(prev - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));
  }, []);

  const handleFit = useCallback(() => {
    setZoom(fitZoom);
  }, [fitZoom]);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((prev) => !prev);
  }, []);

  const zoomPercent = Math.round(zoom * 100);

  const TemplateComponent =
    templateComponents[templateSlug] ?? templateComponents.clean;

  const scaledWidth = PAPER_WIDTH * zoom;
  const scaledHeight = PAPER_HEIGHT * zoom;

  const canvasContent = (
    <>
      {/* Scrollable canvas */}
      <div
        ref={canvasRef}
        className="relative flex-1 overflow-auto rounded-xl cursor-grab select-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(0.46 0.02 60 / 0.12) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundColor: "oklch(0.94 0.004 60)",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Centering wrapper */}
        <div
          className="flex justify-center"
          style={{
            paddingTop: PADDING,
            paddingBottom: PADDING + 56,
            minHeight: "100%",
          }}
        >
          {/* Scaled paper container */}
          <div
            style={{
              width: scaledWidth,
              height: scaledHeight,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: PAPER_WIDTH,
                minHeight: PAPER_HEIGHT,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                transition: "transform 200ms cubic-bezier(0.25, 1, 0.5, 1)",
              }}
              className="bg-white shadow-xl shadow-black/8 ring-1 ring-black/4 rounded-sm"
            >
              <TemplateComponent data={data} />
            </div>
          </div>
        </div>

        {/* Zoom controls — sticky bottom */}
        <div className="sticky bottom-3 z-10 flex justify-center pointer-events-none pb-3">
          <div className="pointer-events-auto flex items-center gap-0.5 rounded-lg border border-border/60 bg-card/80 px-1 py-1 shadow-lg backdrop-blur-sm">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= ZOOM_MIN}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={handleFit}
              className="min-w-14 rounded-md px-2 py-1 text-center text-[11px] font-semibold tabular-nums text-foreground/80 transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
              title="Reset to fit"
            >
              {zoomPercent}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= ZOOM_MAX}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>

            <div className="mx-0.5 h-4 w-px bg-border/60" />

            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Fullscreen overlay
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
        {/* Close button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-card/80 text-muted-foreground shadow-lg backdrop-blur-sm transition-colors duration-(--dur-state) ease-(--ease-out-quart) hover:bg-muted hover:text-foreground"
            aria-label="Exit fullscreen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {canvasContent}
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "100%" }}>
      {canvasContent}
    </div>
  );
}