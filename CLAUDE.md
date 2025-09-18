# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SoulFit AI is an AI-powered Pilates program generator that analyzes user posture from 4 angles using GPT-5-Mini and creates personalized 50-minute workout routines. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Environment Setup

Required environment variables in `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Architecture Overview

### Multi-Step User Flow
1. **Posture Analysis** - Upload 4 images (front, back, left, right) for GPT-5-Mini analysis
2. **Health Assessment** - Body metrics, muscle balance, health conditions
3. **Analysis Results** - Combined posture and health analysis with personalized recommendations
4. **Goals Questionnaire** - Comprehensive 6-section questionnaire covering goals, habits, barriers, medical conditions, physical measurements, and expectations

### State Management
- Uses Zustand store (`src/stores/appStore.ts`) for global state
- Main state includes: currentStep, postureAnalysis, healthAssessment, userGoals, generatedProgram

### API Routes
- `/api/analyze-posture` - Processes 4 posture images with GPT-5-Mini
- `/api/generate-program` - Creates personalized Pilates program

### Key Components
- `PostureAnalysis.tsx` - 4-image upload with drag-and-drop
- `HealthAssessment.tsx` - Tabbed interface for health metrics
- `AnalysisResults.tsx` - Combined posture and health analysis display with intelligent recommendations
- `GoalsQuestionnaire.tsx` - 6-section comprehensive questionnaire (Goals, Exercise Habits, Barriers & Concerns, Medical Conditions, Physical Assessment, Expectations)

### OpenAI Integration
- GPT-5-Mini for posture analysis (`src/lib/openai.ts`)
- GPT-5-Mini for body composition extraction from uploaded reports
- Uses structured JSON schema responses for reliable output format
- Images converted to base64 for API submission
- Intelligent analysis combining posture patterns with health metrics

## Design System

### Apple-Inspired UI
- Clean, minimal interface with glassmorphism effects
- Smooth animations using Framer Motion
- Card-based layouts with hover effects
- Blue/purple gradient primary colors

### Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Touch-friendly interactions

## Development Notes

- Uses Next.js 14 App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React Dropzone for file uploads
- Lucide React for icons

## Testing

Currently no test framework configured. Consider adding:
- Jest for unit testing
- Cypress or Playwright for E2E testing
- React Testing Library for component testing