import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Map as MapIcon,
  MapPin,
  Sparkles,
  Star,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LandingDriverCard } from "@/components/landing/landing-driver-card";
import { LandingJobCard } from "@/components/landing/landing-job-card";
import { MapPreview } from "@/components/landing/map-preview";
import { DemoBetaBar } from "@/components/demo/demo-beta-bar";
import { SITE_DOMAIN, SITE_MONOGRAM, SITE_NAME } from "@/lib/brand";
import {
  getLandingDriverPreviews,
  getLandingJobPreviews,
  getLandingMapPins,
  LANDING_TESTIMONIALS,
} from "@/lib/landing-preview";

export default function HomePage() {
  const driverPreviews = getLandingDriverPreviews();
  const jobPreviews = getLandingJobPreviews();
  const mapPins = getLandingMapPins();

  return (
    <div className="flex flex-1 flex-col">
      <DemoBetaBar />
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-[11px] font-bold leading-none text-zinc-950">
              {SITE_MONOGRAM}
            </span>
            <span className="hidden sm:inline">{SITE_NAME}</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm text-zinc-400 md:flex">
            <Link href="/drivers" className="rounded-lg px-2 py-1.5 hover:bg-zinc-800/80 hover:text-white">
              Drivers
            </Link>
            <Link href="/jobs" className="rounded-lg px-2 py-1.5 hover:bg-zinc-800/80 hover:text-white">
              Jobs
            </Link>
            <Link href="/map" className="rounded-lg px-2 py-1.5 hover:bg-zinc-800/80 hover:text-white">
              Map
            </Link>
            <Link href="/employers" className="rounded-lg px-2 py-1.5 hover:bg-zinc-800/80 hover:text-white">
              Companies
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="cta-glow">
                Get started
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex border-t border-zinc-800/60 md:hidden">
          <div className="flex w-full gap-1 overflow-x-auto px-2 py-2 text-xs font-medium text-zinc-400">
            {[
              ["Drivers", "/drivers"],
              ["Jobs", "/jobs"],
              ["Map", "/map"],
              ["Companies", "/employers"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-zinc-800/80 hover:text-white"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/login"
              className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-zinc-800/80 hover:text-white"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.2),transparent)]" />
        <div className="relative mx-auto max-w-3xl text-center animate-fade-in">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-emerald-300/95">
            <Sparkles className="h-3.5 w-3.5" />
            Hiring marketplace
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl sm:leading-tight">
            Hire drivers or find driving jobs in minutes.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400 sm:text-lg">
            Real-time matching, live map, and instant chat.
          </p>
          <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-500 sm:text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/60 px-3 py-1.5">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              Trusted by <strong className="text-zinc-300">500+</strong> drivers
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/60 px-3 py-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              Active in <strong className="text-zinc-300">Bay Area</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/60 px-3 py-1.5">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              Top rated drivers
            </span>
          </div>
          <div className="mx-auto mt-10 flex max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup?role=employer" className="sm:flex-1">
              <Button size="lg" className="h-12 w-full gap-2 cta-glow">
                Post a job in 60 seconds <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/drivers" className="sm:flex-1">
              <Button size="lg" variant="secondary" className="h-12 w-full min-h-[48px] gap-2">
                Find drivers near you <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mx-auto mt-4 max-w-lg">
            <Link href="/signup?role=driver">
              <Button variant="ghost" className="h-12 w-full min-h-[48px] text-zinc-300 hover:text-white">
                Start earning as a driver →
              </Button>
            </Link>
          </div>
        </div>

        {/* Role cards — onboarding guidance */}
        <div className="relative mx-auto mt-14 grid max-w-6xl gap-4 sm:gap-6 md:grid-cols-2">
          <Card className="animate-fade-in border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-zinc-900/40 transition hover:border-emerald-500/35">
            <CardHeader className="space-y-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <BriefcaseBusiness className="h-5 w-5" />
              </span>
              <CardTitle className="text-2xl">For employers</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Post roles, browse verified drivers, and message matches without friction.
              </CardDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="/signup?role=employer">
                  <Button className="gap-2 cta-glow">
                    Post a job <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/drivers">
                  <Button variant="secondary">Browse directory</Button>
                </Link>
              </div>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in border-teal-500/20 bg-gradient-to-b from-teal-500/10 to-zinc-900/40 transition hover:border-teal-500/35">
            <CardHeader className="space-y-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                <Truck className="h-5 w-5" />
              </span>
              <CardTitle className="text-2xl">For drivers</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Build a profile once, see pay & location upfront, apply when you are ready.
              </CardDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="/signup?role=driver">
                  <Button className="gap-2 cta-glow">
                    Start earning <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button variant="secondary">Browse jobs</Button>
                </Link>
                <Link href="/employers">
                  <Button variant="ghost" className="text-zinc-300">
                    Companies
                  </Button>
                </Link>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Drivers near you */}
      <section
        id="drivers-near-you"
        className="border-t border-zinc-800/80 bg-zinc-950/50 px-4 py-16 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Drivers near you</h2>
              <p className="mt-2 max-w-xl text-zinc-400">
                Real profiles with ratings, availability, and distance — pulled from our active directory.
              </p>
            </div>
            <Link href="/drivers">
              <Button variant="secondary" className="min-h-[44px] w-full sm:w-auto">
                View all drivers
              </Button>
            </Link>
          </div>
          {driverPreviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-14 text-center">
              <p className="text-zinc-400">
                No drivers yet — be the first to join and show up here.
              </p>
              <Link href="/signup?role=driver" className="mt-4 inline-block">
                <Button>Create a driver profile</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {driverPreviews.slice(0, 5).map((d, i) => (
                <div
                  key={d.userId}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <LandingDriverCard driver={d} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest jobs */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Latest jobs</h2>
              <p className="mt-2 max-w-xl text-zinc-400">
                Open roles with pay and location — updated as employers post.
              </p>
            </div>
            <Link href="/jobs">
              <Button variant="secondary" className="min-h-[44px] w-full sm:w-auto">
                Browse jobs
              </Button>
            </Link>
          </div>
          {jobPreviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-14 text-center text-zinc-400">
              No listings yet — employers can post in under a minute.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {jobPreviews.map((job, i) => (
                <div
                  key={job.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <LandingJobCard job={job} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Map preview */}
      <section className="border-t border-zinc-800/80 bg-zinc-950/40 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Live map of drivers & jobs</h2>
              <p className="mt-2 max-w-xl text-zinc-400">
                Explore where talent and open roles cluster — same map experience in the app.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  Drivers
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  Job openings
                </span>
              </div>
            </div>
            <Link href="/map">
              <Button variant="secondary" className="min-h-[44px] gap-2">
                <MapIcon className="h-4 w-4" />
                Open full map
              </Button>
            </Link>
          </div>
          <MapPreview
            drivers={mapPins.drivers}
            jobs={mapPins.jobs}
            empty={mapPins.drivers.length === 0 && mapPins.jobs.length === 0}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">How it works</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-zinc-400">
            Two paths — same platform. Pick your flow and get started in minutes.
          </p>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <Card className="border-emerald-500/15 bg-zinc-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BriefcaseBusiness className="h-5 w-5 text-emerald-400" />
                  For employers
                </CardTitle>
                <ol className="mt-4 space-y-4 text-sm text-zinc-300">
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                      1
                    </span>
                    <span>
                      <strong className="text-white">Post a job</strong> — title, pay, and shift in one screen.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                      2
                    </span>
                    <span>
                      <strong className="text-white">Get matched</strong> — browse drivers on the map and directory.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                      3
                    </span>
                    <span>
                      <strong className="text-white">Hire instantly</strong> — message, interview, and onboard in-app.
                    </span>
                  </li>
                </ol>
              </CardHeader>
            </Card>
            <Card className="border-teal-500/15 bg-zinc-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="h-5 w-5 text-teal-400" />
                  For drivers
                </CardTitle>
                <ol className="mt-4 space-y-4 text-sm text-zinc-300">
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-300">
                      1
                    </span>
                    <span>
                      <strong className="text-white">Create profile</strong> — CDL, endorsements, and availability.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-300">
                      2
                    </span>
                    <span>
                      <strong className="text-white">Get notified</strong> — new jobs and employer messages in real time.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-300">
                      3
                    </span>
                    <span>
                      <strong className="text-white">Get hired</strong> — apply once, chat, and land the right role.
                    </span>
                  </li>
                </ol>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-t border-zinc-800/80 bg-gradient-to-b from-zinc-900/40 to-zinc-950 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">Loved by fleets & drivers</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-zinc-500">
            Early teams use {SITE_NAME} to move faster — here is what they say.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {LANDING_TESTIMONIALS.map((t, i) => (
              <Card
                key={t.name}
                className="animate-fade-in border-zinc-800/80 bg-zinc-900/40 transition hover:border-emerald-500/25"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <CardHeader className="space-y-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-zinc-800/80 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-zinc-900/50 to-zinc-950 px-6 py-12 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">Ready to move faster?</h2>
          <p className="mx-auto mt-2 max-w-lg text-zinc-400">
            Join drivers and employers who already use {SITE_NAME} to hire and get hired without the noise.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/signup?role=employer">
              <Button size="lg" className="h-12 min-h-[48px] w-full gap-2 cta-glow sm:w-auto">
                Post a job <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signup?role=driver">
              <Button size="lg" variant="secondary" className="h-12 min-h-[48px] w-full sm:w-auto">
                Start as a driver
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800/80 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} {SITE_NAME} · {SITE_DOMAIN}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-400">
            <Link href="/drivers" className="hover:text-emerald-400">
              Drivers
            </Link>
            <Link href="/jobs" className="hover:text-emerald-400">
              Jobs
            </Link>
            <Link href="/map" className="hover:text-emerald-400">
              Map
            </Link>
            <Link href="/login" className="hover:text-emerald-400">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
