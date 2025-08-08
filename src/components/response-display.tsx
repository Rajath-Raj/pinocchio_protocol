'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Copy, Save, LoaderCircle, Bot, Play, Pause } from 'lucide-react';

import { getRobotVoice } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Pinocchio from './pinocchio';

function AnimatedText({ text, onAnimationComplete }: { text: string; onAnimationComplete: () => void; }) {
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
    }, 35);

    return () => clearInterval(intervalId);
  }, [text, onAnimationComplete]);

  return <p className="text-xl md:text-2xl font-code p-6 bg-secondary rounded-md min-h-[120px] border border-border/50 shadow-inner">{displayedText}<span className="animate-ping">{displayedText.length === text.length ? '' : '_'}</span></p>;
}

function PlayButton({ isPlaying, isGeneratingAudio, onClick }: { isPlaying: boolean; isGeneratingAudio: boolean; onClick: () => void; }) {
  return (
    <Button variant="outline" onClick={onClick} disabled={isGeneratingAudio}>
      {isGeneratingAudio ? (
        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
      ) : isPlaying ? (
        <Pause className="mr-2 h-5 w-5" />
      ) : (
        <Play className="mr-2 h-5 w-5" />
      )}
      {isGeneratingAudio ? 'Generating' : isPlaying ? 'Pause' : 'Replay'}
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [noseProgress, setNoseProgress] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  
  const handlePlay = async () => {
    if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        return;
    }

    if (audioRef.current && audioRef.current.paused && audioDataUri) {
        audioRef.current.play();
        return;
    }

    setIsGeneratingAudio(true);
    try {
        const { audioDataUri: newAudioDataUri, error } = await getRobotVoice(confused);
        if (error || !newAudioDataUri) {
          throw new Error(error || 'Could not generate the robot voice.');
        }
        setAudioDataUri(newAudioDataUri);

        if (audioRef.current) {
            audioRef.current.removeEventListener('timeupdate', onTimeUpdate);
            audioRef.current.removeEventListener('ended', onEnded);
            audioRef.current.removeEventListener('play', onPlay);
            audioRef.current.removeEventListener('pause', onPause);
        }

        const newAudio = new Audio(newAudioDataUri);
        audioRef.current = newAudio;
        addAudioEventListeners(newAudio);
        newAudio.play();
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

  const onTimeUpdate = () => {
    if (audioRef.current) {
        setNoseProgress(audioRef.current.currentTime / audioRef.current.duration);
    }
  };
  const onPlay = () => setIsPlaying(true);
  const onPause = () => {
      setIsPlaying(false);
      // Retract nose only when audio finishes completely
      if (audioRef.current && audioRef.current.currentTime === audioRef.current.duration) {
          setNoseProgress(0);
      }
  };
  const onEnded = () => {
      setIsPlaying(false);
      setNoseProgress(0);
  };

  const addAudioEventListeners = (audio: HTMLAudioElement) => {
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
  };
  
  useEffect(() => {
    if (isAnimationComplete) {
      handlePlay();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimationComplete]); 

  // Cleanup effect
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
        if (audio) {
            audio.pause();
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
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
            <Pinocchio noseProgress={noseProgress} />
          </div>
        </CardHeader>
        <CardContent>
          <AnimatedText text={confused} onAnimationComplete={() => setIsAnimationComplete(true)} />
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
