/**
 * The detail-panel "Team & mentor" tab: the same section (3)/(4) fill fields as
 * the expanded editor, laid out single-column to sit inside the narrow panel
 * without taking more room. No instructions — the fields are always the same.
 * Saving stays in the panel (the expanded editor is the one that navigates back).
 */

import { useState } from "react";
import { adminUpdateApplicationFills, type ApplicationRecord } from "../lib/api";
import type { AdminFills } from "../form/model";
import { recordFillHistory } from "../lib/fillHistory";
import { AdminFillFields } from "../components/AdminFillFields";
import { cloneFills, sameFills } from "./AdminFillEditor";
import { useT } from "../i18n/language";
import { D } from "../i18n/dictionary";
import type { Phrase } from "../i18n/types";
import { Button, Callout, ExternalIcon, SpinnerIcon } from "../components/ui";

export function AdminFillTab({
  record,
  onSaved,
  onOpenExpanded,
}: {
  record: ApplicationRecord;
  onSaved: (record: ApplicationRecord) => void;
  onOpenExpanded: () => void;
}) {
  const { s: str } = useT();
  const [draft, setDraft] = useState<AdminFills>(() => cloneFills(record.data.adminFills));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: Phrase } | null>(null);

  const dirty = !sameFills(draft, record.data.adminFills);

  const change = (next: AdminFills) => {
    setStatus(null);
    setDraft(next);
  };

  const save = async () => {
    setSaving(true);
    setStatus(null);
    const result = await adminUpdateApplicationFills(record.id, draft);
    setSaving(false);
    if (!result.ok) {
      setStatus({ ok: false, message: result.error });
      return;
    }
    recordFillHistory(draft);
    onSaved(result.value.application);
    setDraft(cloneFills(result.value.application.data.adminFills));
    setStatus({ ok: true, message: D.adminFill.saved });
  };

  return (
    <div className="flex flex-col gap-5">
      <AdminFillFields value={draft} onChange={change} dense />

      {status ? (
        <Callout tone={status.ok ? "success" : "error"}>{str(status.message)}</Callout>
      ) : null}

      <div className="sticky bottom-0 -mx-6 flex flex-col gap-3 border-t border-line-soft bg-card/95 px-6 pb-1 pt-3 backdrop-blur-md">
        <Button onClick={() => void save()} disabled={saving || !dirty} className="w-full rounded-lg">
          {saving ? (
            <>
              <SpinnerIcon size={16} />
              {str(D.adminFill.saving)}
            </>
          ) : (
            str(D.adminFill.save)
          )}
        </Button>
        <button
          type="button"
          onClick={onOpenExpanded}
          className="mx-auto inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-[0.8125rem] font-semibold text-muted transition-colors hover:text-ink"
        >
          <ExternalIcon size={13} />
          {str(D.adminFill.openExpanded)}
        </button>
      </div>
    </div>
  );
}
