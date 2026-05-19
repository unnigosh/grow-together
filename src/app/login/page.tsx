import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-earth-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-earth-900">Welcome back</h1>
        <p className="mt-1 text-sm text-earth-800/70">
          Log in to message sellers, save listings, and post your own.
        </p>
        <Suspense fallback={<p className="mt-6 text-sm text-earth-800/60">Loading...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
