import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-earth-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-earth-900">Join GrowTogether</h1>
        <p className="mt-1 text-sm text-earth-800/70">
          Connect with local growers and plant lovers in your area.
        </p>
        <SignupForm />
      </div>
    </div>
  );
}
