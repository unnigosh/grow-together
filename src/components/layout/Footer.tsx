import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-leaf-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-semibold text-leaf-700">
              <span aria-hidden>🌿</span> GrowTogether
            </p>
            <p className="mt-1 text-sm text-earth-800/70">
              Your local community for plants, produce, and gardening.
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-earth-800/80">
            <Link href="/" className="hover:text-leaf-700">
              Browse listings
            </Link>
            <Link href="/listings/new" className="hover:text-leaf-700">
              Sell something
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-center text-xs text-earth-800/50 sm:text-left">
          © {new Date().getFullYear()} GrowTogether. Built for neighbors who grow together.
        </p>
      </div>
    </footer>
  );
}
