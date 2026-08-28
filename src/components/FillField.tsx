/**
 * A labelled text input that remembers what an admin has typed into it before.
 *
 * On focus it drops a list of past values for that specific field; clicking one
 * fills the box, and each row carries an × to forget it. The list is portalled
 * to the body and positioned against the input — flipping above it near the
 * bottom of the screen — so it is never clipped by the narrow detail panel or a
 * short mobile viewport. History lives in `localStorage` (see `fillHistory`).
 */

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Field, useFieldContext } from "./ui";
import {
  getFillHistory,
  removeFillHistory,
  type FillFieldKey,
} from "../lib/fillHistory";
import { useT } from "../i18n/language";
import { D } from "../i18n/dictionary";

interface Coords {
  left: number;
  width: number;
  top: number | null;
  bottom: number | null;
}

const ROW_HEIGHT = 40;
const MAX_HEIGHT = 232;

function HistoryInput({
  value,
  onChange,
  historyKey,
  maxLength,
  inputMode,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  historyKey: FillFieldKey;
  maxLength?: number;
  inputMode?: "text" | "tel";
  placeholder?: string;
}) {
  const field = useFieldContext();
  const { s: str } = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [active, setActive] = useState(-1);
  const [coords, setCoords] = useState<Coords | null>(null);
  const listId = `${field?.inputId ?? historyKey}-history`;

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return history;
    return history.filter((entry) => {
      const e = entry.toLowerCase();
      return e.includes(q) && e !== q;
    });
  }, [history, value]);

  const showing = open && suggestions.length > 0;

  const reposition = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const rows = Math.min(suggestions.length, 6);
    const wanted = Math.min(rows * ROW_HEIGHT + 8, MAX_HEIGHT);
    const below = window.innerHeight - rect.bottom - 8;
    const above = rect.top - 8;
    const flipUp = below < wanted && above > below;
    setCoords({
      left: rect.left,
      width: rect.width,
      top: flipUp ? null : rect.bottom + 4,
      bottom: flipUp ? window.innerHeight - rect.top + 4 : null,
    });
  }, [suggestions.length]);

  // Keep the portalled list pinned to the input while it is open.
  useLayoutEffect(() => {
    if (!showing) return;
    reposition();
    const handler = () => reposition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [showing, reposition]);

  const openList = () => {
    setHistory(getFillHistory(historyKey));
    setActive(-1);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const choose = (entry: string) => {
    onChange(entry);
    close();
    inputRef.current?.focus();
  };

  const forget = (entry: string) => {
    removeFillHistory(historyKey, entry);
    const next = getFillHistory(historyKey);
    setHistory(next);
    setActive(-1);
    if (next.length === 0) close();
    inputRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) return openList();
      if (suggestions.length) setActive((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      if (!showing) return;
      event.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter") {
      if (showing && active >= 0) {
        event.preventDefault();
        choose(suggestions[active]);
      }
    } else if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        close();
      }
    }
  };

  const filled = value.trim() !== "";
  const invalid = field?.invalid ?? false;
  const control =
    "w-full rounded-field border bg-card px-3.5 h-11 text-[0.95rem] text-ink " +
    "placeholder:text-faint transition-colors duration-150 outline-none " +
    (invalid
      ? "border-rose-line bg-rose-bg"
      : filled
        ? "border-green-300 focus:border-accent"
        : "border-line hover:border-green-300 focus:border-accent");

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={field?.inputId}
        type="text"
        role="combobox"
        aria-expanded={showing}
        aria-controls={showing ? listId : undefined}
        aria-autocomplete="list"
        aria-describedby={field?.describedBy}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
          if (!open) openList();
        }}
        onFocus={openList}
        onBlur={close}
        onKeyDown={onKeyDown}
        className={control}
      />

      {showing && coords
        ? createPortal(
            <ul
              id={listId}
              role="listbox"
              // Keep the input focused while interacting with the list.
              onMouseDown={(event) => event.preventDefault()}
              style={{
                position: "fixed",
                left: coords.left,
                width: coords.width,
                top: coords.top ?? undefined,
                bottom: coords.bottom ?? undefined,
                maxHeight: MAX_HEIGHT,
                zIndex: 60,
              }}
              className="m-0 list-none overflow-y-auto rounded-xl border border-line bg-card p-1 shadow-float"
            >
              {suggestions.map((entry, index) => (
                <li key={entry} role="option" aria-selected={index === active}>
                  <div
                    className={`flex min-h-10 items-center gap-1 rounded-lg pl-3 pr-1 text-[0.9rem] transition-colors ${
                      index === active ? "bg-accent-soft" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => choose(entry)}
                      onMouseEnter={() => setActive(index)}
                      className="min-w-0 flex-1 truncate py-2 text-left text-ink"
                    >
                      {entry}
                    </button>
                    <button
                      type="button"
                      onClick={() => forget(entry)}
                      aria-label={str(D.adminFill.forget)}
                      title={str(D.adminFill.forget)}
                      className="flex size-8 flex-none items-center justify-center rounded-lg text-faint transition-colors hover:bg-rose-bg hover:text-rose-ink"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}

export function FillField({
  label,
  value,
  onChange,
  historyKey,
  maxLength,
  inputMode,
  placeholder,
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  historyKey: FillFieldKey;
  maxLength?: number;
  inputMode?: "text" | "tel";
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <HistoryInput
        value={value}
        onChange={onChange}
        historyKey={historyKey}
        maxLength={maxLength}
        inputMode={inputMode}
        placeholder={placeholder}
      />
    </Field>
  );
}
