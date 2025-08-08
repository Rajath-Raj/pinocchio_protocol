'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ObfuscateForm = dynamic(() => import('@/components/obfuscate-form'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  ),
});

export default function ObfuscateFormLoader() {
  return <ObfuscateForm />;
}
