import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const SCHOOLS = [
  'Symbol Emergence',
  'Active Inference',
  'MHNG',
  'Emergent Communication',
  'Predictive Coding',
  'CPC-MS',
  'World Model',
  'Multi-agent',
] as const;

const papers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/papers' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    year: z.number().int().min(2000).max(2100),
    venue: z.string(),
    arxiv_id: z.string().optional(),
    doi: z.string().optional(),
    url: z.string().url(),
    abstract_en: z.string(),
    summary_ja: z.string().optional(),
    schools: z.array(z.enum(SCHOOLS)).min(1),
    methods: z.array(z.string()).optional(),
    date_added: z.date(),
    contributor: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const labs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/labs' }),
  schema: z.object({
    name_en: z.string(),
    name_ja: z.string().optional(),
    pi: z.string(),
    institution: z.string(),
    country: z.string(),
    homepage: z.string().url(),
    description_en: z.string(),
    description_ja: z.string().optional(),
    focus_areas: z.array(z.string()).min(1),
    date_added: z.date(),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/events' }),
  schema: z.object({
    title_en: z.string(),
    title_ja: z.string().optional(),
    type: z.enum(['Workshop', 'Conference', 'Seminar', 'Reading group']),
    date_start: z.date(),
    date_end: z.date(),
    language: z.enum(['EN', 'JA', 'Mixed']),
    location: z.string(),
    url: z.string().url(),
    description_en: z.string(),
    description_ja: z.string().optional(),
    date_added: z.date(),
  }),
});

export const collections = { papers, labs, events };
