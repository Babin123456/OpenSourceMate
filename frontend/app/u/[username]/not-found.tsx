import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
      <h1 className="text-2xl font-semibold">That GitHub username isn&apos;t valid</h1>
      <p className="max-w-md text-sm text-gray-400">
        Usernames use up to 39 letters, numbers or single hyphens. Check the link and try again.
      </p>
      <Link href="/" className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black">
        Back to the analyzer
      </Link>
    </main>
  );
}
