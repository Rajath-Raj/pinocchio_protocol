'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Wand2, LoaderCircle, Languages, SlidersHorizontal, Mic, Keyboard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { confuseSentence } from '@/ai/flows/confuse-sentence';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const result = await confuseSentence({ sentence: values.sentence });
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
    <Card className="w-full shadow-lg border-border/50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Start Confusing</CardTitle>
            <CardDescription>Enter a sentence and watch it become beautifully ambiguous.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text"><Keyboard className="mr-2 h-4 w-4"/>Text Input</TabsTrigger>
                <TabsTrigger value="voice" disabled><Mic className="mr-2 h-4 w-4"/>Voice Input</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                 <FormField
                  control={form.control}
                  name="sentence"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., The quick brown fox jumps over the lazy dog."
                          className="mt-2 min-h-[100px] text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Languages className="mr-2 h-4 w-4" />Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="malayalam" disabled>Malayalam (coming soon)</SelectItem>
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
                     <FormLabel className="flex items-center"><SlidersHorizontal className="mr-2 h-4 w-4" />Confusion: {confusionLabel}</FormLabel>
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
            <Button type="submit" className="w-full text-lg" size="lg" disabled={isLoading}>
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
