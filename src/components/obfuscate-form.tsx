
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Wand2, LoaderCircle, Languages, SlidersHorizontal, Mic, Keyboard, Square, MicOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { confuseSentence, getTranscription } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { isAudioRecordingSupported, getSupportedMimeType } from '@/lib/audio-utils';

const formSchema = z.object({
  sentence: z.string().min(10, { message: 'Please enter a sentence with at least 10 characters.' }),
  language: z.string(),
  confusionLevel: z.number().min(0).max(2),
});

type FormValues = z.infer<typeof formSchema>;

export default function ObfuscateForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [confusionLabel, setConfusionLabel] = useState('Moderate');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioSupported, setAudioSupported] = useState<boolean>(false);

  useEffect(() => {
    setAudioSupported(isAudioRecordingSupported());
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sentence: '',
      language: 'english',
      confusionLevel: 1,
    },
  });

  const handleSliderChange = (value: number[]) => {
    const level = value[0];
    form.setValue('confusionLevel', level);
    switch (level) {
      case 0:
        setConfusionLabel('Mild');
        break;
      case 1:
        setConfusionLabel('Moderate');
        break;
      case 2:
        setConfusionLabel('Maximum Nonsense');
        break;
    }
  };

  const handleStartRecording = async () => {
    if (!audioSupported) {
      toast({
        variant: 'destructive',
        title: 'Audio Not Supported',
        description: 'Your browser does not support audio recording.',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        throw new Error('No supported audio format found for recording.');
      }
      const options = { mimeType };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      mediaRecorderRef.current.addEventListener('stop', () => {
        const mimeType = mediaRecorderRef.current?.mimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size === 0) {
           toast({
            variant: 'destructive',
            title: 'No audio detected',
            description: 'Please try recording again and speak clearly.',
           });
           setIsTranscribing(false);
           return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const { text, error } = await getTranscription({ audioDataUri: base64Audio });
            if (error || !text) {
               throw new Error(error || 'Transcription failed to return text.');
            }
            form.setValue('sentence', text);
          } catch (transcriptionError) {
            console.error(transcriptionError);
            toast({
              variant: 'destructive',
              title: 'Transcription Failed',
              description: transcriptionError instanceof Error ? transcriptionError.message : 'An unknown error occurred.',
            });
          } finally {
            setIsTranscribing(false);
          }
        };
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      toast({
        variant: 'destructive',
        title: 'Recording Error',
        description: err instanceof Error ? err.message : 'Could not start recording. Please ensure you have given microphone permissions and are on a secure (HTTPS) connection.',
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setIsTranscribing(true);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const result = await confuseSentence({ sentence: values.sentence, language: values.language });
      if (result.confusedSentence) {
        const params = new URLSearchParams({
          original: values.sentence,
          confused: result.confusedSentence,
        });
        router.push(`/response?${params.toString()}`);
      } else {
        throw new Error('The AI failed to generate a response. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: error instanceof Error ? error.message : 'Something went wrong.',
      });
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-lg border-border/50 rounded-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Start Confusing</CardTitle>
            <CardDescription>Enter a sentence and watch it become beautifully ambiguous.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="rounded-full"><Keyboard className="mr-2 h-4 w-4"/>Text Input</TabsTrigger>
                <TabsTrigger value="voice" className="rounded-full" disabled={!audioSupported}><Mic className="mr-2 h-4 w-4"/>Voice Input</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="pt-2">
                 <FormField
                  control={form.control}
                  name="sentence"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., The quick brown fox jumps over the lazy dog."
                          className="min-h-[100px] text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
               <TabsContent value="voice" className="pt-2">
                <div className="flex flex-col items-center justify-center min-h-[100px] border-2 border-dashed border-border rounded-lg p-4 space-y-4">
                  {audioSupported ? (
                    <>
                    <Button type="button" size="icon" className={`w-16 h-16 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`} onClick={toggleRecording} disabled={isTranscribing}>
                      {isTranscribing ? <LoaderCircle className="h-8 w-8 animate-spin" /> : isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {isTranscribing ? 'Transcribing...' : isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                    </p>
                    </>
                  ) : (
                    <>
                      <MicOff className="h-8 w-8 text-destructive" />
                      <p className="text-sm text-destructive text-center">
                        Voice input is not supported on this browser or you may need to be on a secure (HTTPS) connection.
                      </p>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-bold"><Languages className="mr-2 h-4 w-4 text-primary" />Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-full">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="malayalam">Malayalam</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confusionLevel"
                render={({ field }) => (
                  <FormItem>
                     <FormLabel className="flex items-center font-bold"><SlidersHorizontal className="mr-2 h-4 w-4 text-primary" />Confusion: {confusionLabel}</FormLabel>
                    <FormControl>
                        <Slider
                            min={0}
                            max={2}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={handleSliderChange}
                        />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-lg" size="lg" disabled={isLoading || isRecording || isTranscribing}>
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                  Confusing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Confuse Me
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
