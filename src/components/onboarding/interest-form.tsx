"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const formSchema = z.object({
  interests: z.string().min(3, {
    message: "Tell us at least one thing you're interested in!",
  }),
});

type InterestFormProps = {
  onInterestsSubmit: (interests: string[]) => void;
};

export function InterestForm({ onInterestsSubmit }: InterestFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interests: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const interestsArray = values.interests
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onInterestsSubmit(interestsArray);
  }

  const heroImage = PlaceHolderImages.find(p => p.id === 'interest-profiler-hero');

  return (
    <Card className="w-full max-w-2xl mx-auto border-0 md:border md:shadow-lg">
      {heroImage && (
         <div className="relative h-48 w-full">
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover rounded-t-lg"
                data-ai-hint={heroImage.imageHint}
                priority
            />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
         </div>
      )}
      <CardHeader className="text-center -mt-16 z-10 relative">
        <CardTitle className="text-3xl md:text-4xl font-extrabold">
          Welcome to OpenMind
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Turn any interest into a personalized learning journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">What are you curious about?</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., The Roman Empire, sci-fi movies, black holes..."
                      {...field}
                      className="text-base py-6"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a few topics, separated by commas. Our AI will craft a
                    learning path for you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              <Button type="submit" size="lg" className="text-lg font-semibold">
                <Sparkles className="mr-2 h-5 w-5" />
                Ignite My Curiosity
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
