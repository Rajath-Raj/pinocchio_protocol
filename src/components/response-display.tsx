'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Copy, Save, LoaderCircle, Eye } from 'lucide-react';

import { getRobotVoice } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

function AnimatedText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    const chars = text.split('');
    chars.forEach((char, index) => {
      setTimeout(() => {
        setDisplayedText((prev) => prev + char);
      }, index * 25);
    });
  }, [text]);

  return <p className="text-xl md:text-2xl font-code p-6 bg-secondary rounded-md min-h-[120px] border border-border/50 shadow-inner">{displayedText}<span className="animate-ping">_</span></p>;
}

function PlayButton({ isPlaying, isGeneratingAudio, onClick }: { isPlaying: boolean; isGeneratingAudio: boolean; onClick: () => void; }) {
  const [isWinking, setIsWinking] = useState(false);

  useEffect(() => {
    let winkTimeout: NodeJS.Timeout;
    if (isPlaying) {
      const wink = () => {
        setIsWinking(true);
        setTimeout(() => setIsWinking(false), 200);
        winkTimeout = setTimeout(wink, Math.random() * 4000 + 2000);
      };
      wink();
    }
    return () => clearTimeout(winkTimeout);
  }, [isPlaying]);

  return (
    <Button variant="outline" onClick={onClick} disabled={isGeneratingAudio}>
      {isGeneratingAudio ? (
        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <div className="relative mr-2 h-5 w-5">
          <Eye className={`transition-transform duration-200 ${isWinking ? 'scale-y-0' : 'scale-y-100'}`} />
        </div>
      )}
      {isGeneratingAudio ? 'Generating' : isPlaying ? 'Listening...' : 'Listen'}
    </Button>
  );
}


interface ResponseDisplayProps {
  original: string;
  confused: string;
}

export default function ResponseDisplay({ original, confused }: ResponseDisplayProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);

  useEffect(() => {
    if (audio) {
        audio.onended = () => setIsPlaying(false);
    }
    return () => {
        if (audio) {
            audio.pause();
            audio.onended = null;
        }
    };
  }, [audio]);

  const handlePlay = async () => {
    if (isPlaying && audio) {
        audio.pause();
        setIsPlaying(false);
        return;
    }

    if (audioDataUri && audio) {
        audio.play();
        setIsPlaying(true);
        return;
    }

    setIsGeneratingAudio(true);
    const { audioDataUri: newAudioDataUri, error } = await getRobotVoice(confused);
    setIsGeneratingAudio(false);

    if (error || !newAudioDataUri) {
      toast({
        variant: 'destructive',
        title: 'Audio Generation Failed',
        description: error || 'Could not generate the robot voice.',
      });
      return;
    }
    
    setAudioDataUri(newAudioDataUri);
    const currentAudio = new Audio(newAudioDataUri);
    setAudio(currentAudio);
    currentAudio.play();
    setIsPlaying(true);
  };
  
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
          <CardTitle className="font-headline text-3xl">Your Confused Response</CardTitle>
          <CardDescription>
            Original: <span className="italic">"{original}"</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatedText text={confused} />
        </CardContent>
        <CardFooter className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" onClick={handleConfuseAgain}>
                <RefreshCw className="mr-2 h-4 w-4" /> Again
            </Button>
            <PlayButton isPlaying={isPlaying} isGeneratingAudio={isGeneratingAudio} onClick={handlePlay} />
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
