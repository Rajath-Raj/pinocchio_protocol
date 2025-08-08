import ObfuscateForm from '@/components/obfuscate-form';
import { Bot } from 'lucide-react';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 bg-background">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <div className="inline-block bg-primary/20 p-4 rounded-full mb-4 border-2 border-primary/50">
                <Bot className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">Obfuscate</h1>
            <p className="text-lg text-muted-foreground mt-2 font-body">"The truth exists, but not here."</p>
        </div>
        <Suspense fallback={<div className="text-center text-lg">Loading form...</div>}>
            <ObfuscateForm />
        </Suspense>
      </div>
    </main>
  );
}
