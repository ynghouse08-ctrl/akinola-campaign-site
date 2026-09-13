export default function BlockedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl text-ink">Account blocked</h1>
        <p className="mt-3 text-sm text-ink/60">
          Your account has been blocked from this platform. If you believe
          this is a mistake, please contact the campaign team.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-md bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-forest"
        >
          Back to home
        </a>
      </div>
    </main>
  );
}
