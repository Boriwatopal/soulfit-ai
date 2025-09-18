# SoulFit AI - AI-Powered Pilates Program Generator

A comprehensive web application that uses GPT-4 Vision to analyze posture from multiple angles and creates personalized 50-minute Pilates programs based on individual health assessments and goals.

## Features

### 🔍 4-Angle Posture Analysis
- Upload photos from front, back, left side, and right side views
- AI-powered analysis using GPT-4 Vision API
- Detailed posture assessment with specific recommendations
- Identification of muscle imbalances and alignment issues

### 🏥 Comprehensive Health Assessment
- Body composition metrics (weight, height, body fat, muscle percentage)
- Muscle balance evaluation
- Health conditions and injury history tracking
- Additional assessment images upload

### 🎯 Goals & Preferences Questionnaire
- Primary goal selection (strength, flexibility, rehabilitation, weight loss, general fitness)
- Experience level assessment
- Session duration and frequency preferences
- Focus areas and physical limitations
- Equipment availability and style preferences

### 💪 Personalized Program Generation
- 50-minute structured Pilates routines
- Warm-up, main workout, and cool-down sections
- Exercise modifications for different skill levels
- Reasoning behind exercise selection
- Progress tracking and completion status
- Program regeneration capability

### 🍎 Apple-Inspired Design
- Modern, clean interface with smooth animations
- Glassmorphism and card-hover effects
- Responsive design for all devices
- Intuitive step-by-step workflow

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **AI Integration**: OpenAI GPT-4 Vision API
- **File Upload**: React Dropzone
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key with GPT-4 Vision access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd soulfit
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── analyze-posture/
│   │   └── generate-program/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── PostureAnalysis.tsx
│   ├── HealthAssessment.tsx
│   ├── GoalsQuestionnaire.tsx
│   ├── PilatesProgram.tsx
│   └── StepIndicator.tsx
├── lib/                   # Utility libraries
│   └── openai.ts          # OpenAI integration
├── stores/                # State management
│   └── appStore.ts        # Zustand store
└── types/                 # TypeScript type definitions
    └── index.ts
```

## Usage

### Step 1: Posture Analysis
1. Upload clear photos from all 4 angles (front, back, left side, right side)
2. Stand naturally in minimal clothing for best results
3. Click "Analyze My Posture" to process the images

### Step 2: Health Assessment
1. Enter body metrics (weight, height, body composition)
2. Assess muscle balance across different body parts
3. Add any health conditions or injury history
4. Upload additional assessment images if needed

### Step 3: Goals & Preferences
1. Select your primary fitness goal
2. Choose experience level and session preferences
3. Identify focus areas and physical limitations
4. Set equipment availability and intensity preferences

### Step 4: Your Program
1. Review your personalized 50-minute Pilates program
2. Track exercise completion with interactive checkboxes
3. View reasoning behind exercise selection
4. Regenerate program or export for offline use

## API Integration

### Posture Analysis API
```typescript
// POST /api/analyze-posture
const formData = new FormData();
formData.append('frontImage', frontImageFile);
formData.append('backImage', backImageFile);
formData.append('leftSideImage', leftSideImageFile);
formData.append('rightSideImage', rightSideImageFile);

const response = await fetch('/api/analyze-posture', {
  method: 'POST',
  body: formData,
});
```

### Program Generation API
```typescript
// POST /api/generate-program
const response = await fetch('/api/generate-program', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    postureAnalysis,
    healthAssessment,
    userGoals,
  }),
});
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Adding New Features

1. **New Exercise Types**: Extend the `Exercise` interface in `src/types/index.ts`
2. **Additional Assessments**: Add new tabs to `HealthAssessment.tsx`
3. **New Goals**: Extend the goals array in `GoalsQuestionnaire.tsx`
4. **Custom Styling**: Add new classes to `globals.css` or Tailwind config

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Set environment variables in Vercel dashboard
4. Deploy with `vercel --prod`

### Other Platforms

The application can be deployed to any platform supporting Next.js applications:
- Netlify
- Railway
- Heroku
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Contact support at support@soulfit.com

## Acknowledgments

- OpenAI for GPT-4 Vision API
- Joseph Pilates for the foundational exercise methodology
- The React and Next.js communities for excellent documentation