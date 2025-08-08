'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Copy, Save, LoaderCircle, Bot } from 'lucide-react';

import { getRobotVoice } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Pinocchio from './pinocchio';

function AnimatedText({ text }: { text: string; }) {
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
    }, 35);

    return () => clearInterval(intervalId);
  }, [text]);

  return <p className="text-xl md:text-2xl font-code p-6 bg-secondary rounded-md min-h-[120px] border border-border/50 shadow-inner">{displayedText}<span className="animate-ping">{displayedText.length === text.length ? '' : '_'}</span></p>;
}

function PlayButton({ isPlaying, isGeneratingAudio, onClick }: { isPlaying: boolean; isGeneratingAudio: boolean; onClick: () => void; }) {
  return (
    <Button variant="outline" onClick={onClick} disabled={isGeneratingAudio}>
      {isGeneratingAudio ? (
        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Bot className="mr-2 h-5 w-5" />

      )}
      {isGeneratingAudio ? 'Generating' : isPlaying ? 'Playing...' : 'Replay'}
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
  
  const handlePlay = async () => {
    if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        setNoseProgress(0); // Retract nose on pause
        return;
    }

    if (audioDataUri) {
        if (!audioRef.current) {
            audioRef.current = new Audio(audioDataUri);
            addAudioEventListeners(audioRef.current);
        }
        audioRef.current.play();
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
    const newAudio = new Audio(newAudioDataUri);
    audioRef.current = newAudio;
    addAudioEventListeners(newAudio);
    newAudio.play();
    setIsPlaying(true);
  };

  const addAudioEventListeners = (audio: HTMLAudioElement) => {
    const onTimeUpdate = () => {
        if (audio.duration > 0) {
            setNoseProgress(audio.currentTime / audio.duration);
        }
    };
    const onEnded = () => {
        setIsPlaying(false);
        setNoseProgress(0); // Retract nose when done
    };
    const onPause = () => {
      if (audio.currentTime < audio.duration) {
        setIsPlaying(false);
        // Do not retract nose on pause, only on end or manual stop.
      }
    };

    // Clear old listeners before adding new ones
    audio.removeEventListener('timeupdate', onTimeUpdate);
    audio.removeEventListener('ended', onEnded);
    audio.removeEventListener('pause', onPause);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
  };
  
  useEffect(() => {
    const animationDuration = confused.length * 35; 
    const timer = setTimeout(() => {
      handlePlay();
    }, animationDuration + 250);

    return () => {
        clearTimeout(timer);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confused]); 

  // Cleanup effect
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
        if (audio) {
            audio.pause();
            // The event listeners are attached to the audio object itself, so they don't need manual cleanup here
            // unless we were recreating it constantly, which we are not.
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
