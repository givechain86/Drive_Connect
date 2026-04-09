import { Suspense } from "react";
import { LoginClient } from "./login-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center px-4 py-16 text-zinc-500">
          Loading…
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
