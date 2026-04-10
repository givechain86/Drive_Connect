import "server-only";
import path from "path";
import { loadEnvConfig } from "@next/env";

let loaded = false;

/** Ensures `.env.local` from `process.cwd()` is merged when Next infers a parent workspace root. */
export function loadEnvFromAppRoot(): void {
  if (loaded) return;
  loaded = true;
  loadEnvConfig(path.resolve(process.cwd()));
}
