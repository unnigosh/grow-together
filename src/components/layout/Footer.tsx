import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-leaf-600/20 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-base font-bold tracking-tight text-leaf-700">
              <span aria-hidden>🌿</span> GrowTogether
            </p>
            <p className="mt-1 max-w-xs text-sm text-earth-800/60">
              A community for people who grow things — plants, food, and friendships.
            </p>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-earth-800/40">
                Community
              </p>
              <nav className="flex flex-col gap-1.5 text-sm text-earth-800/70">
                <Link href="/" className="hover:text-leaf-700 transition-colors">Feed</Link>
                <Link href="/questions" className="hover:text-leaf-700 transition-colors">Questions</Link>
              </nav>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-earth-800/40">
                Marketplace
              </p>
              <nav className="flex flex-col gap-1.5 text-sm text-earth-800/70">
                <Link href="/market" className="hover:text-leaf-700 transition-colors">Browse listings</Link>
                <Link href="/listings/new" className="hover:text-leaf-700 transition-colors">Sell something</Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-earth-100 pt-6">
          <p className="text-xs text-earth-800/40">
            © {new Date().getFullYear()} GrowTogether. Built for neighbors who grow together.
          </p>
        </div>
      </div>
    </footer>
  );
}
