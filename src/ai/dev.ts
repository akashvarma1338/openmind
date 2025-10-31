import { config } from 'dotenv';
config();

import '@/ai/flows/generate-daily-topic.ts';
import '@/ai/flows/build-micro-quiz.ts';
import '@/ai/flows/curate-reading-material.ts';