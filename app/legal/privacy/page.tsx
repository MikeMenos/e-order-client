import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-600">
          Last updated: April 14, 2026
        </p>

        <div className="mt-6 space-y-4 text-sm leading-6 text-slate-700">
          <p>
            eorder processes personal and business data required to provide the
            ordering service, including account details, store data, and order
            history.
          </p>
          <p>
            Data is used only for service operation, security, and support. We
            do not disclose data to unauthorized third parties.
          </p>
          <p>
            For requests regarding access, correction, or deletion of personal
            data, contact us at{" "}
            <a className="text-brand-600 underline" href="mailto:info@eorder.gr">
              info@eorder.gr
            </a>
            .
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
