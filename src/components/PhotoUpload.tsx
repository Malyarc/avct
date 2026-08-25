/**
 * 2-inch headshot upload.
 *
 * Photos come straight off a phone at 4–12 MB, which would blow the request
 * limit and the localStorage quota. Everything is resized and re-encoded in
 * the browser before it ever enters application state: a 2:2.6 portrait crop
 * at 640x832, JPEG — comfortably sharp for a 35x45 mm print, ~90 KB on the
 * wire.
 */

import { useCallback, useId, useRef, useState } from "react";
import { AlertIcon, ImageIcon, TrashIcon } from "./ui";

const TARGET_WIDTH = 640;
const TARGET_ASPECT = 2 / 2.6;
const TARGET_HEIGHT = Math.round(TARGET_WIDTH / TARGET_ASPECT);
const JPEG_QUALITY = 0.88;
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export class PhotoError extends Error {
  override readonly name = "PhotoError";
}

/** Reads a file into a bitmap, centre-crops to portrait, returns a data URL. */
export async function processPhoto(file: File): Promise<string> {
  if (file.size > MAX_INPUT_BYTES) {
    throw new PhotoError("That image is over 25 MB. Please choose a smaller photo.");
  }
  if (file.type && !ACCEPTED.includes(file.type) && !file.type.startsWith("image/")) {
    throw new PhotoError("Please choose an image file (JPG, PNG or HEIC).");
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () =>
        reject(new PhotoError("That image could not be read. Please try another file."));
      element.src = url;
    });

    const source = { width: image.naturalWidth, height: image.naturalHeight };
    if (!source.width || !source.height) {
      throw new PhotoError("That image could not be read. Please try another file.");
    }

    // Centre-crop the source to the portrait aspect the form prints at.
    const sourceAspect = source.width / source.height;
    let sx = 0;
    let sy = 0;
    let sw = source.width;
    let sh = source.height;
    if (sourceAspect > TARGET_ASPECT) {
      sw = Math.round(source.height * TARGET_ASPECT);
      sx = Math.round((source.width - sw) / 2);
    } else {
      sh = Math.round(source.width / TARGET_ASPECT);
      sy = Math.round((source.height - sh) / 2);
    }

    const canvas = document.createElement("canvas");
    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new PhotoError("Your browser could not process the image.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingQuality = "high";
    context.drawImage(image, sx, sy, sw, sh, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function PhotoUpload({
  value,
  onChange,
  invalid,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  invalid?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const accept = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setBusy(true);
      setError(null);
      try {
        onChange(await processPhoto(file));
      } catch (cause) {
        setError(
          cause instanceof PhotoError
            ? cause.message
            : "That image could not be processed. Please try another file.",
        );
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only-focusable absolute size-px"
        onChange={(event) => void accept(event.target.files?.[0])}
      />

      {value ? (
        <div className="flex flex-col gap-2.5 rounded-2xl border border-green-300 bg-card p-3.5 shadow-card">
          <img
            src={value}
            alt="Your uploaded headshot"
            className="aspect-[2/2.6] w-full rounded-lg object-cover"
          />
          <div className="flex gap-2">
            <label
              htmlFor={inputId}
              className="flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-lg border border-line text-[0.8125rem] font-semibold text-muted transition-colors hover:border-green-300 hover:text-ink"
            >
              {busy ? "Working…" : "Replace"}
            </label>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setError(null);
              }}
              aria-label="Remove photo"
              className="flex min-h-10 w-11 items-center justify-center rounded-lg border border-line text-rose-ink transition-colors hover:border-rose-line hover:bg-rose-bg"
            >
              <TrashIcon size={15} />
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void accept(event.dataTransfer.files?.[0]);
          }}
          className={`flex aspect-[2/2.6] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed p-4 text-center transition-colors ${
            dragging
              ? "border-accent bg-accent-soft"
              : invalid
                ? "border-rose-line bg-rose-bg"
                : "border-line bg-card hover:border-green-300 hover:bg-accent-soft"
          }`}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent-text">
            <ImageIcon size={19} />
          </span>
          <span className="text-[0.8125rem] font-semibold text-ink">
            {busy ? "Processing…" : "Add your photo"}
          </span>
          <span className="text-[0.75rem] leading-snug text-faint">
            Tap to choose, or drop an image here
          </span>
        </label>
      )}

      {error ? (
        <span className="flex items-start gap-1.5 text-[0.78125rem] text-rose-ink">
          <AlertIcon size={13} className="mt-0.5 flex-none" />
          {error}
        </span>
      ) : null}
    </div>
  );
}
