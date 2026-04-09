import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="flex items-center gap-2 text-lg font-semibold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-sm font-bold text-zinc-950">
              DC
            </span>
            DriverConnect
          </span>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.18),transparent)]" />
        <div className="relative mx-auto max-w-3xl text-center animate-fade-in">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-emerald-400/90">
            Two-sided hiring marketplace
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Hire drivers faster.{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Land shifts smarter.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
            Profiles, job posts, applications, live chat, and a live map — built
            for fleets and drivers who want a single place to connect.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Create account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="secondary" size="lg">
                Browse jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-2 sm:gap-6 sm:px-6 lg:grid-cols-4">
        {[
          {
            icon: Shield,
            title: "Supabase Auth",
            desc: "Email/password with driver vs employer roles and row-level security.",
          },
          {
            icon: MapPin,
            title: "Live map",
            desc: "Leaflet map with availability filters for nearby talent.",
          },
          {
            icon: MessageCircle,
            title: "Realtime chat",
            desc: "Message threads backed by Supabase Realtime channels.",
          },
          {
            icon: Zap,
            title: "Notifications",
            desc: "Application updates and new job alerts in one inbox.",
          },
        ].map(({ icon: Icon, title, desc }, i) => (
          <Card
            key={title}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <CardHeader>
              <Icon className="mb-2 h-8 w-8 text-emerald-400" />
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
