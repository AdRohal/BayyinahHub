# BayyinahHub

BayyinahHub is a web application designed to help users search and understand Islamic Hadiths (prophetic traditions and sayings). The application provides an intuitive search interface and AI-powered explanations of Hadiths to make Islamic knowledge more accessible.

## Features

- **Hadith Search**: Search through authentic Hadith collections using the Sunnah API
- **AI-Powered Explanations**: Get simplified, context-aware explanations of Hadiths using GPT-4
- **Bilingual Support**: Full Arabic language support for an authentic experience
- **Responsive Design**: Modern, mobile-friendly interface with smooth animations
- **Demo Mode**: Built-in demo data for development and testing without API keys

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (v16.1.6) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **API Integration**:
  - [Sunnah.com API](https://sunnah.com/api) for Hadith search
  - OpenAI GPT-4o-mini for Hadith explanations

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables by creating a `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
SUNNAH_API_KEY=your_sunnah_api_key_here
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```

## API Endpoints

- `POST /api/explain` - Get an AI-powered explanation of a Hadith text
- `GET /api/search?q={query}` - Search for Hadiths by keyword

## Project Structure

- `/src/app` - Next.js app directory with main pages and API routes
- `/src/components` - React components for different page sections
- `/public` - Static assets and logos

## Development

The application supports development without API keys using demo data. Missing API keys will automatically fall back to demonstration data for testing purposes.
