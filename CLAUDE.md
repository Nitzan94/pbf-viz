# PBF Visualization Studio

## Project Overview
Next.js 16 app for generating architectural visualizations of Pure Blue Fish aquaculture facilities using Gemini API.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript 5
- @google/generative-ai for image generation

## Commands
```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint
```

## Architecture

### Pages (app/)
- `/` - Main studio: chat mode + direct prompt mode for image generation
- `/blueprints` - Blueprint selection for reference images
- `/specs` - Context editor (facility specs, design guidelines, company context)
- `/help` - Help page

### API Routes (app/api/)
- `/api/chat` - Streaming chat with Gemini (text model)
- `/api/generate` - Image generation with Gemini Imagen
- `/api/specs` - CRUD for context files

### Lib (lib/)
- `prompts.ts` - System prompts, initial messages
- `context.ts` - Storage keys, default contexts
- `imageStore.ts` - IndexedDB for image history

## Key Patterns
- Agent-native: 3 contexts (facilitySpecs, designGuidelines, companyContext) passed to chat API
- State persisted to localStorage (text) + IndexedDB (images)
- Chat extracts prompts via `---PROMPT---...---END---` markers
- Reference images support: upload or select from blueprints

## CSS Variables (globals.css)
PBF brand colors defined as CSS vars: `--pbf-navy`, `--pbf-ocean`, `--pbf-turquoise`, `--pbf-aqua-*`

## Notes
- API key stored client-side (user provides own Gemini key)
- Images stored in IndexedDB to avoid localStorage quota issues
