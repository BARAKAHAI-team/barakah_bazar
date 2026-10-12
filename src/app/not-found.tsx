import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="max-w-[700px] mx-auto px-4 py-20 text-center">
      <div className="p-10 border border-[var(--line)] bg-[var(--surface)] rounded-[2px] space-y-4">
        <span className="text-xs uppercase tracking-widest font-semibold text-[var(--ink-muted)] block">
          404 &bull; Page Not Found
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--ink)] m-0">
          The requested page does not exist
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-muted)] max-w-md mx-auto">
          The link may be outdated or the category/product has been moved. Explore one of our main collections below.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link href="/">
            <Button variant="primary" size="md">
              Return to Storefront
            </Button>
          </Link>
          <Link href="/bridal">
            <Button variant="secondary" size="md">
              Bridal Collections
            </Button>
          </Link>
          <Link href="/naturals">
            <Button variant="secondary" size="md">
              Naturals
            </Button>
          </Link>
          <Link href="/coconut-oil">
            <Button variant="secondary" size="md">
              Coconut Oil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
