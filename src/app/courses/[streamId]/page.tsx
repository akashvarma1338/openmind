'use client';

import { useParams } from 'next/navigation';
import { streams } from '@/lib/pregenerated-courses';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function StreamPage() {
    const params = useParams();
    const router = useRouter();
    const auth = useAuth();
    const streamId = params.streamId as string;
    const stream = streams.find(s => s.id === streamId);

    const handleSignOut = async () => {
        if (auth) {
          await signOut(auth);
          router.push('/auth');
        }
    };

    const handleHomeClick = () => {
        router.push('/');
    }

    if (!stream) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header streak={0} onSignOut={handleSignOut} onHomeClick={handleHomeClick} onHistoryClick={() => {}} />
                <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
                    <p>Stream not found.</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header streak={0} onSignOut={handleSignOut} onHomeClick={handleHomeClick} onHistoryClick={() => router.push('/')} />
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-extrabold font-headline">{stream.name}</h1>
                        <p className="text-lg text-muted-foreground">{stream.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stream.subjects.map((subject, index) => (
                            <Card key={subject.id} className="flex flex-col">
                                <div className="relative h-40 w-full">
                                    <Image
                                        src={`https://picsum.photos/seed/${index + 100}/${600}/${400}`}
                                        alt={subject.description}
                                        fill
                                        className="object-cover rounded-t-lg"
                                        data-ai-hint={subject.imageHint}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                </div>
                                <CardHeader>
                                    <CardTitle>{subject.name}</CardTitle>
                                    <CardDescription className="flex-grow">{subject.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto">
                                     <div className="flex items-center text-muted-foreground text-sm mb-4">
                                        <Clock className="mr-2 h-4 w-4" />
                                        <span>{subject.duration}</span>
                                    </div>
                                    <Link href={`/courses/${stream.id}/${subject.id}`} passHref>
                                        <Button className="w-full">
                                            Start Learning <ArrowRight className="ml-2" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
