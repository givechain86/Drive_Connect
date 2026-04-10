"use client";

import { useState } from "react";
import { upsertDriverRatingByEmployer } from "@/lib/ratings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StarPicker, StarRatingDisplay } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  employerId: string;
  driverId: string;
  initial: { score: number; comment: string | null } | null;
  publicAvg: number | null;
  publicCount: number;
  onSaved?: () => void;
};

export function RateDriverPanel({
  employerId,
  driverId,
  initial,
  publicAvg,
  publicCount,
  onSaved,
}: Props) {
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
    const { error } = await upsertDriverRatingByEmployer({
      employerId,
      driverId,
      score,
      comment: comment.trim() || null,
    });
    setSaving(false);
    if (error) setMsg(error);
    else {
      setMsg("Saved.");
      onSaved?.();
    }
  }

  return (
    <div className="space-y-3 border-t border-zinc-800 px-5 py-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Driver rating
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Visible to other employers. You can update your rating anytime.
        </p>
        <div className="mt-2">
          <StarRatingDisplay avg={publicAvg} count={publicCount} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Your rating</Label>
        <StarPicker value={score} onChange={setScore} disabled={saving} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="drv-cmt">Comment (optional)</Label>
        <Textarea
          id="drv-cmt"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Professionalism, punctuality…"
          disabled={saving}
        />
      </div>
      {msg && (
        <p
          className={`text-sm ${msg === "Saved." ? "text-emerald-400" : "text-red-300"}`}
        >
          {msg}
        </p>
      )}
      <Button type="button" disabled={saving} onClick={() => void save()}>
        {saving ? "Saving…" : initial ? "Update rating" : "Submit rating"}
      </Button>
    </div>
  );
}
