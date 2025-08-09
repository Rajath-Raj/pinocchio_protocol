'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Copy, Save, Bot } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

function AnimatedText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, 50); // Slightly slower animation

    return () => clearInterval(intervalId);
  }, [text]);

  return <p className="text-xl md:text-2xl font-code p-6 bg-secondary rounded-md min-h-[120px] border border-border/50 shadow-inner">{displayedText}<span className="animate-ping">{displayedText.length === text.length ? '' : '_'}</span></p>;
}

interface ResponseDisplayProps {
  original: string;
  confused: string;
}

export default function ResponseDisplay({ original, confused }: ResponseDisplayProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(confused);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleSave = () => {
    toast({
      title: 'Feature Locked',
      description: 'Please create an account to save your interactions.',
    });
  };

  const handleConfuseAgain = () => {
    router.push('/');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="shadow-lg border-border/50 rounded-2xl">
        <CardHeader>
           <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-3xl">Your Confused Response</CardTitle>
              <CardDescription>
                Original: <span className="italic">"{original}"</span>
              </CardDescription>
            </div>
            <div className="bg-primary/20 p-3 rounded-full border-2 border-primary/50 -mt-2">
                <Bot className="w-8 h-8 text-primary" />
            </div>
           </div>
        </CardHeader>
        <CardContent>
          <AnimatedText text={confused} />
        </CardContent>
        <CardFooter className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button variant="outline" onClick={handleConfuseAgain}>
                <RefreshCw className="mr-2 h-4 w-4" /> Again
            </Button>
            <Button variant="outline" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button variant="outline" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
