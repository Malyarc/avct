/**
 * Mouse / trackpad / finger signature capture.
 *
 * Draws on a device-pixel-ratio-scaled canvas so the stroke is crisp on
 * retina screens and in the printed PDF, and exports a trimmed, transparent
 * PNG so the signature sits on the form's ruled line rather than in a white
 * box.
 */

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { useT } from "../i18n/language";
import { D } from "../i18n/dictionary";

const STROKE_COLOR = "#0a3f8f";
const STROKE_WIDTH = 2.6;
/** Ignore taps: a real signature is more than a dot. */
const MIN_STROKE_POINTS = 6;

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
}

interface Point {
  x: number;
  y: number;
}

export function SignaturePad({
  onChange,
  value,
  invalid,
  handleRef,
  label,
}: {
  onChange: (dataUrl: string | null) => void;
  value: string | null;
  invalid?: boolean;
  handleRef?: RefObject<SignaturePadHandle | null>;
  label?: string;
}) {
  const { s: str } = useT();
  const hint = label ?? str(D.review.signHere);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Point[][]>([]);
  const current = useRef<Point[]>([]);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  /** Resizes the backing store to the CSS box and repaints every stroke. */
  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    const width = Math.round(rect.width * ratio);
    const height = Math.round(rect.height * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    context.strokeStyle = STROKE_COLOR;
    context.lineWidth = STROKE_WIDTH;
    context.lineCap = "round";
    context.lineJoin = "round";

    for (const stroke of strokes.current) {
      if (stroke.length === 0) continue;
      context.beginPath();
      if (stroke.length === 1) {
        context.arc(stroke[0].x, stroke[0].y, STROKE_WIDTH / 2, 0, Math.PI * 2);
        context.fillStyle = STROKE_COLOR;
        context.fill();
        continue;
      }
      context.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length - 1; i += 1) {
        const midpoint = {
          x: (stroke[i].x + stroke[i + 1].x) / 2,
          y: (stroke[i].y + stroke[i + 1].y) / 2,
        };
        context.quadraticCurveTo(stroke[i].x, stroke[i].y, midpoint.x, midpoint.y);
      }
      context.lineTo(stroke[stroke.length - 1].x, stroke[stroke.length - 1].y);
      context.stroke();
    }
  }, []);

  useEffect(() => {
    repaint();
    const observer = new ResizeObserver(() => repaint());
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [repaint]);

  /** Crops the canvas to the drawn ink so the PNG has no dead margin. */
  const exportTrimmed = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return null;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;

    const { width, height } = canvas;
    const { data } = context.getImageData(0, 0, width, height);
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;

    const pad = Math.round(STROKE_WIDTH * (window.devicePixelRatio || 1));
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad);
    maxY = Math.min(height - 1, maxY + pad);

    const out = document.createElement("canvas");
    out.width = maxX - minX + 1;
    out.height = maxY - minY + 1;
    const outContext = out.getContext("2d");
    if (!outContext) return null;
    outContext.drawImage(
      canvas,
      minX,
      minY,
      out.width,
      out.height,
      0,
      0,
      out.width,
      out.height,
    );
    return out.toDataURL("image/png");
  }, []);

  const pointFrom = (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const commit = useCallback(() => {
    const totalPoints = strokes.current.reduce((sum, stroke) => sum + stroke.length, 0);
    if (totalPoints < MIN_STROKE_POINTS) {
      setHasInk(false);
      onChange(null);
      return;
    }
    setHasInk(true);
    onChange(exportTrimmed());
  }, [exportTrimmed, onChange]);

  const clear = useCallback(() => {
    strokes.current = [];
    current.current = [];
    setHasInk(false);
    repaint();
    onChange(null);
  }, [onChange, repaint]);

  useImperativeHandle(handleRef, () => ({ clear, isEmpty: () => !hasInk }), [clear, hasInk]);

  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    current.current = [pointFrom(event)];
    strokes.current.push(current.current);
    repaint();
  };

  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    event.preventDefault();
    current.current.push(pointFrom(event));
    repaint();
  };

  const end = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    commit();
  };

  const showPlaceholder = !hasInk && !value;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`relative h-40 overflow-hidden rounded-xl border-2 border-dashed bg-white transition-colors ${
          invalid ? "border-rose-line" : hasInk ? "border-green-300" : "border-line"
        }`}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
          aria-label={hint}
          role="img"
          className="absolute inset-0 size-full cursor-crosshair touch-none"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 bottom-8 border-b border-line"
        />
        {showPlaceholder ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 bottom-2.5 text-[0.6875rem] text-faint"
          >
  <span lang="zh-Hant" className="font-zh">同意人簽名</span> · {hint}
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[0.78125rem] text-faint">
          {hasInk ? str(D.review.signatureCaptured) : str(D.review.signaturePrompt)}
        </span>
        <button
          type="button"
          onClick={clear}
          disabled={!hasInk}
          className="rounded-lg px-2 py-1 text-[0.8125rem] font-semibold text-accent-text transition-opacity disabled:opacity-40"
        >
          {str(D.action.clear)}
        </button>
      </div>
    </div>
  );
}
