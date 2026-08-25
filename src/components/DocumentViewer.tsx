/**
 * A scaled, scrollable viewport for the reproduced form.
 *
 * The document is drawn at true A4 and only scaled with a CSS transform, so
 * what you see is exactly what prints and exactly what the PDF captures — one
 * DOM, never re-laid out. `documentRef` hands that same element to the PDF
 * exporter.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ApplicationDocument } from "../document/ApplicationDocument";
import type { ApplicationData } from "../form/model";

/** A4 width in CSS pixels at 96 dpi. */
const A4_WIDTH_PX = (210 / 25.4) * 96;

const ZOOM_STEPS = [0.4, 0.5, 0.65, 0.8, 0.92, 1, 1.25, 1.5] as const;

/** Scale that fits an A4 page inside `ref`'s content box. */
export function useFitScale(ref: RefObject<HTMLElement | null>, padding = 32): number {
  const [scale, setScale] = useState(0.8);

  const measure = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    const available = element.clientWidth - padding;
    if (available <= 0) return;
    setScale(Math.min(1, Math.max(0.24, available / A4_WIDTH_PX)));
  }, [ref, padding]);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, measure]);

  return scale;
}

const ZoomIcon = ({ plus }: { plus?: boolean }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    {plus ? <path d="M12 5v14" /> : null}
  </svg>
);

export function DocumentViewer({
  data,
  mode = "official",
  documentRef,
  className = "",
  showZoom = true,
  toolbarExtra,
}: {
  data: ApplicationData;
  mode?: "applicant" | "official";
  documentRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  showZoom?: boolean;
  toolbarExtra?: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const fitScale = useFitScale(frameRef);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const scale = zoomIndex == null ? fitScale : ZOOM_STEPS[zoomIndex];

  const nearestZoomIndex = () => {
    let best = 0;
    for (let index = 1; index < ZOOM_STEPS.length; index += 1) {
      if (Math.abs(ZOOM_STEPS[index] - scale) < Math.abs(ZOOM_STEPS[best] - scale)) {
        best = index;
      }
    }
    return best;
  };

  return (
    <div className={`flex min-w-0 flex-col gap-3 ${className}`}>
      {showZoom || toolbarExtra ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">{toolbarExtra}</div>
          {showZoom ? (
            <div className="flex flex-none items-center gap-1 rounded-full border border-line bg-card p-1">
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => setZoomIndex(Math.max(0, nearestZoomIndex() - 1))}
                className="flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-ink"
              >
                <ZoomIcon />
              </button>
              <button
                type="button"
                onClick={() => setZoomIndex(null)}
                title="Fit to width"
                className="min-w-12 rounded-full px-1 text-center text-[0.78125rem] font-semibold text-ink"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() =>
                  setZoomIndex(Math.min(ZOOM_STEPS.length - 1, nearestZoomIndex() + 1))
                }
                className="flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-accent-soft hover:text-ink"
              >
                <ZoomIcon plus />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        ref={frameRef}
        className="min-w-0 overflow-x-auto rounded-2xl bg-sunken p-4 no-scrollbar sm:p-6"
      >
        <ApplicationDocument
          rootRef={documentRef}
          id="avct-document"
          data={data}
          mode={mode}
          scale={scale}
          className="mx-auto"
        />
      </div>
    </div>
  );
}
