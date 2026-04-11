"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  getPublicFeedbackEmail,
  getPublicFeedbackFormUrl,
} from "@/lib/feedback-public";

const STORAGE_PREFIX = "djh-demo-beta-banner-dismissed";
const DISMISS_EVENT = "djh-demo-dismiss";

function dismissStorageKey(pathname: string): string {
  return `${STORAGE_PREFIX}:${pathname || "/"}`;
}

function subscribeDismiss(pathname: string, onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const key = dismissStorageKey(pathname);
  const onStorage = (e: StorageEvent) => {
    if (e.key === key || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(DISMISS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DISMISS_EVENT, onChange);
  };
}

function getDismissedSnapshot(pathname: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(dismissStorageKey(pathname)) === "1";
  } catch {
    return false;
  }
}

function useDismissedForPath(pathname: string | null) {
  const path = pathname ?? "/";
  const subscribe = useCallback(
    (onChange: () => void) => subscribeDismiss(path, onChange),
    [path]
  );
  const getSnapshot = useCallback(() => getDismissedSnapshot(path), [path]);
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(dismissStorageKey(path), "1");
      window.dispatchEvent(new Event(DISMISS_EVENT));
    } catch {
      /* ignore */
    }
  }, [path]);
  return [dismissed, dismiss] as const;
}

export function DemoBetaBar({
  className = "",
  dismissible = true,
}: {
  className?: string;
  dismissible?: boolean;
}) {
  const pathname = usePathname();
  const [dismissed, dismiss] = useDismissedForPath(pathname);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  if (dismissible && dismissed) return null;

  return (
    <>
      <div
        role="status"
        className={`border-b border-amber-500/25 bg-amber-950/40 px-3 py-2.5 text-center text-sm text-amber-100/95 sm:px-4 ${className}`}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
          <p className="max-w-3xl leading-snug">
            <span className="font-medium text-amber-50">Beta / demo</span>
            {" — "}
            Data may be sample content; we&apos;d love your feedback.
          </p>
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="border-amber-500/30 bg-amber-950/50 text-amber-50 hover:bg-amber-900/60"
              onClick={() => setFeedbackOpen(true)}
            >
              <MessageSquarePlus className="h-4 w-4" aria-hidden />
              Feedback
            </Button>
            {dismissible && (
              <button
                type="button"
                onClick={dismiss}
                className="rounded-lg p-1.5 text-amber-200/80 hover:bg-amber-900/50 hover:text-amber-50"
                aria-label="Dismiss notice"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      <FeedbackDialog open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}

function FeedbackDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const headingId = useId();
  const formUrl = getPublicFeedbackFormUrl();
  const email = getPublicFeedbackEmail();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  const composedBody = `[Page: ${pathname ?? "/"}]\n\n${message.trim()}`;

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(composedBody);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [composedBody]);

  const sendMail = useCallback(() => {
    if (!email) return;
    const subject = encodeURIComponent("Drivers Job Hub — feedback");
    const body = encodeURIComponent(composedBody);
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
  }, [email, composedBody]);

  function handleDialogClose() {
    setCopied(false);
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-[100] w-[min(100vw-1.5rem,28rem)] max-w-[calc(100vw-1.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-700 bg-zinc-900 p-0 text-zinc-100 shadow-2xl backdrop:bg-black/60"
      onClose={handleDialogClose}
    >
      <div className="flex max-h-[min(85vh,32rem)] flex-col">
        <div className="border-b border-zinc-800 px-4 py-3">
          <h2 id={headingId} className="text-base font-semibold text-white">
            Share your feedback
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            What&apos;s missing on this screen? Leave a short note — thank you.
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-auto px-4 py-3">
          <Label htmlFor="feedback-msg" className="text-zinc-400">
            Your message
          </Label>
          <Textarea
            id="feedback-msg"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. filters on the map, salary field on job posts…"
            className="min-h-[120px] resize-y border-zinc-700 bg-zinc-950/80 text-sm"
            aria-labelledby={headingId}
          />
          <p className="text-xs text-zinc-600">
            Page: <span className="font-mono text-zinc-500">{pathname ?? "/"}</span>
          </p>
        </div>
        <div className="flex flex-col gap-2 border-t border-zinc-800 px-4 py-3 sm:flex-row sm:flex-wrap sm:justify-end">
          {formUrl ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                window.open(formUrl, "_blank", "noopener,noreferrer");
              }}
            >
              Open form
            </Button>
          ) : null}
          {email ? (
            <Button
              type="button"
              size="sm"
              className="w-full sm:w-auto"
              onClick={sendMail}
              disabled={!message.trim()}
            >
              Send via email
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => void copy()}
          >
            {copied ? "Copied" : "Copy to clipboard"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </Button>
        </div>
      </div>
    </dialog>
  );
}
