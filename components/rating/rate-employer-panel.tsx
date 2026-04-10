"use client";

import { useState } from "react";
import { upsertEmployerRatingByDriver } from "@/lib/ratings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StarPicker } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  driverId: string;
  employerId: string;
  companyLabel: string;
  initial: { score: number; comment: string | null } | null;
  onSaved?: () => void;
};

export function RateEmployerPanel({
  driverId,
  employerId,
  companyLabel,
  initial,
  onSaved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(initial?.score ?? 0);
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    if (score < 1 || score > 5) {
      setMsg("Choose 1–5 stars.");
      return;
    }
    setSaving(true);
    setMsg(null);
    const { error } = await upsertEmployerRatingByDriver({
      driverId,
      employerId,
      score,
      comment: comment.trim() || null,
    });
    setSaving(false);
    if (error) setMsg(error);
    else {
      setMsg("Saved.");
      onSaved?.();
      setOpen(false);
    }
  }

  if (!open && initial) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span>
          You rated {companyLabel}: {initial.score}★
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto py-0 text-emerald-400"
          onClick={() => setOpen(true)}
        >
          Edit
        </Button>
      </div>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-2"
        onClick={() => setOpen(true)}
      >
        Rate employer
      </Button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
      <p className="mb-2 text-sm text-white">Rate {companyLabel}</p>
      <div className="space-y-2">
        <Label>Stars</Label>
        <StarPicker value={score} onChange={setScore} disabled={saving} />
      </div>
      <div className="mt-2 space-y-2">
        <Label htmlFor={`emp-cmt-${employerId}`}>Comment (optional)</Label>
        <Textarea
          id={`emp-cmt-${employerId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          disabled={saving}
        />
      </div>
      {msg && (
        <p
          className={`mt-2 text-sm ${msg === "Saved." ? "text-emerald-400" : "text-red-300"}`}
        >
          {msg}
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <Button type="button" size="sm" disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setMsg(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
