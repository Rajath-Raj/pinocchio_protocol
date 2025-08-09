'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Copy, Save, LoaderCircle, Bot, Play, Pause } from 'lucide-react';

import { getRobotVoice } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

function AnimatedText({ text, onAnimationComplete }: { text: string, onAnimationComplete: () => void }) {
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
        onAnimationComplete();
      }
    }, 25);

    return () => clearInterval(intervalId);
  }, [text, onAnimationComplete]);

  return <p className="text-xl md:text-2xl font-code p-6 bg-secondary rounded-md min-h-[120px] border border-border/50 shadow-inner">{displayedText}<span className="animate-ping">{displayedText.length === text.length ? '' : '_'}</span></p>;
}

interface ResponseDisplayProps {
  original: string;
  confused: string;
}

export default function ResponseDisplay({ original, confused }: ResponseDisplayProps) {
  const router = useRouter();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isTextAnimationComplete, setIsTextAnimationComplete] = useState(false);

  const handlePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // If audio is already generated, just play it.
    if (audioDataUri && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // Otherwise, generate and play it.
    setIsGeneratingAudio(true);
    try {
      const { audioDataUri: newAudioDataUri, error } = await getRobotVoice(confused);
      if (error || !newAudioDataUri) {
        throw new Error(error || 'Could not generate the robot voice.');
      }
      setAudioDataUri(newAudioDataUri);

      // Stop any previously playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const newAudio = new Audio(newAudioDataUri);
      audioRef.current = newAudio;
      
      newAudio.addEventListener('ended', () => setIsPlaying(false));
      newAudio.play();
      setIsPlaying(true);

    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Audio Generation Failed',
        description: err instanceof Error ? err.message : 'An unknown error occurred.',
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };
  
  // Auto-play when text animation is complete
  useEffect(() => {
    if (isTextAnimationComplete) {
      handlePlay();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTextAnimationComplete]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
          <AnimatedText text={confused} onAnimationComplete={() => setIsTextAnimationComplete(true)} />
        </CardContent>
        <CardFooter className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" onClick={handleConfuseAgain}>
                <RefreshCw className="mr-2 h-4 w-4" /> Again
            </Button>
            <Button variant="outline" onClick={handlePlay} disabled={isGeneratingAudio}>
              {isGeneratingAudio ? (
                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="mr-2 h-5 w-5" />
              ) : (
                <Play className="mr-2 h-5 w-5" />
              )}
              {isGeneratingAudio ? 'Generating' : isPlaying ? 'Pause' : 'Replay'}
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
