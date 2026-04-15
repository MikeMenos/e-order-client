import Link from "next/link";

export default function TermsOfUsePage() {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Terms of Use</h1>
        <p className="mt-2 text-sm text-slate-600">
          Last updated: April 14, 2026
        </p>

        <div className="mt-6 space-y-4 text-sm leading-6 text-slate-700">
          <p>
            By using eorder, you agree to use the service in accordance with
            applicable laws and your business agreement.
          </p>
          <p>
            Users are responsible for protecting their account credentials and
            for the accuracy of the information submitted through the service.
          </p>
          <p>
            We may update features and terms when required for legal,
            operational, or security reasons.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-sm font-medium text-brand-600 underline">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
