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
import { useT } from "../i18n/language";
import { D } from "../i18n/dictionary";

const TARGET_WIDTH = 640;
const TARGET_ASPECT = 2 / 2.6;
const TARGET_HEIGHT = Math.round(TARGET_WIDTH / TARGET_ASPECT);
const JPEG_QUALITY = 0.88;
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export class PhotoError extends Error {
  override readonly name = "PhotoError";
}

/** Reads a file into a bitmap, center-crops to portrait, returns a data URL. */
/** Codes the caller maps to a localised message. */
export type PhotoErrorCode = "tooBig" | "notImage" | "unreadable" | "unsupported";

export async function processPhoto(file: File): Promise<string> {
  if (file.size > MAX_INPUT_BYTES) throw new PhotoError("tooBig");
  if (file.type && !ACCEPTED.includes(file.type) && !file.type.startsWith("image/")) {
    throw new PhotoError("notImage");
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.addEventListener("load", () => resolve(element), { once: true });
      element.addEventListener(
        "error",
        () => reject(new PhotoError("unreadable")),
        { once: true },
      );
      element.src = url;
    });

    const source = { width: image.naturalWidth, height: image.naturalHeight };
    if (!source.width || !source.height) throw new PhotoError("unreadable");

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
    if (!context) throw new PhotoError("unsupported");
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
  const { s: str } = useT();
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
        const code = cause instanceof PhotoError ? cause.message : "unreadable";
        const messages = {
          tooBig: D.personal.photoTooBig,
          notImage: D.personal.photoNotImage,
          unreadable: D.personal.photoUnreadable,
          unsupported: D.personal.photoUnsupported,
        } as const;
        setError(str(messages[code as keyof typeof messages] ?? D.personal.photoUnreadable));
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange, str],
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
        <div className="mx-auto flex w-full max-w-[13rem] flex-col gap-2.5 rounded-2xl border border-green-300 bg-card p-3.5 shadow-card lg:max-w-none">
          <img
            src={value}
            alt={str(D.personal.photoUploaded)}
            className="aspect-[2/2.6] w-full rounded-lg object-cover"
          />
          <div className="flex gap-2">
            <label
              htmlFor={inputId}
              className="flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-lg border border-line text-[0.8125rem] font-semibold text-muted transition-colors hover:border-green-300 hover:text-ink"
            >
              {busy ? str(D.action.preparing) : str(D.personal.photoReplace)}
            </label>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setError(null);
              }}
              aria-label={str(D.personal.photoRemove)}
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
          className={`mx-auto flex aspect-[2/2.6] w-full max-w-[13rem] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed p-4 text-center transition-colors lg:max-w-none ${
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
            {busy ? str(D.personal.photoProcessing) : str(D.personal.photoAdd)}
          </span>
          <span className="text-[0.75rem] leading-snug text-faint">
            {str(D.personal.photoDrop)}
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
