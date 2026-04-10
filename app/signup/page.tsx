import { Suspense } from "react";
import { SignupClient } from "./signup-client";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center px-4 py-16 text-zinc-500">
          Loading...
        </div>
      }
    >
      <SignupClient />
    </Suspense>
  );
}
