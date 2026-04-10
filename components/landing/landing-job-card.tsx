import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Job } from "@/types";

type Props = {
  job: Job;
  className?: string;
};

export function LandingJobCard({ job, className }: Props) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "landing-card-hover group block rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-4 shadow-lg shadow-black/20 transition-all duration-200",
        "hover:border-emerald-500/40 hover:shadow-[0_0_32px_-8px_rgba(16,185,129,0.35)]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
          <Briefcase className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-snug text-white group-hover:text-emerald-100">
            {job.title}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="h-3 w-3 shrink-0" />
            {job.location}
          </p>
          <p className="mt-2 text-sm font-semibold text-emerald-400">{job.pay_rate}</p>
        </div>
      </div>
    </Link>
  );
}
