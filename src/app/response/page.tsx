import ResponseDisplay from '@/components/response-display';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ResponseContent({ original, confused }: { original?: string; confused?: string }) {
  if (!original || !confused) {
    return (
      <div className="text-center p-8 bg-card rounded-lg shadow-lg">
        <h2 className="text-2xl font-headline text-destructive">Invalid Response</h2>
        <p className="text-muted-foreground mt-2">Could not find the sentences to display.</p>
        <Button asChild className="mt-4">
            <Link href="/">Try Again</Link>
        </Button>
      </div>
    );
  }

  return <ResponseDisplay original={original} confused={confused} />;
}

export default function ResponsePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const original = typeof searchParams.original === 'string' ? searchParams.original : undefined;
  const confused = typeof searchParams.confused === 'string' ? searchParams.confused : undefined;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 bg-background">
       <Suspense fallback={<div className="text-xl font-headline">Loading Response...</div>}>
         <ResponseContent original={original} confused={confused} />
       </Suspense>
    </main>
  );
}
