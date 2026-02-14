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
- `GET /api/search?q={query}` - Search for Hadiths by keyword across multiple sources

## Data Sources

BayyinahHub integrates with multiple trusted Islamic knowledge sources:

- **Sunnah.com API**: Complete hadith database with thousands of authentic hadiths
  - Uses **paginated API calls** to fetch up to 1,000+ hadiths per search
  - Makes multiple sequential requests (10 pages × 100 hadiths per page) to gather comprehensive results
  - Automatically deduplicates results to ensure no repeated hadiths
  - Each Imam/collection page loads **hundreds of hadiths** for that specific imam
  - Covers all major hadith collections:
    - صحيح البخاري (Sahih Bukhari) - 7,563 hadiths
    - صحيح مسلم (Sahih Muslim) - 3,033 hadiths
    - موطأ مالك (Muwatta Malik) - 1,594 hadiths
    - سنن الترمذي (Sunan Tirmidhi) - 3,996 hadiths
    - سنن ابن ماجه (Sunan Ibn Majah) - 4,341 hadiths
    - سنن ابن داود (Sunan Abi Dawud) - 4,800 hadiths
    - سنن النسائي (Sunan Nasai) - 5,761 hadiths
    - مسند أحمد (Musnad Ahmad) - 26,000+ hadiths
  - Each hadith includes: Arabic text, authenticity grade (Sahih/Hasan/Weak), book name, chapter, and hadith number

- **Quran.com**: Comprehensive Islamic knowledge platform
  - Complete Quran with translations and recitations
  - Authentic Hadiths and Islamic teachings
  - Islamic sciences and scholarly references
  
- **Dorar.net**: Certified platform for authentic Islamic content
  - Trusted source for Hadith narration and verification
  - Selected and authenticated hadiths

- **Hisnmuslim.com**: Fortress of the Muslim application
  - Daily supplications and authenticated hadiths
  - Personal spiritual development resources

All hadiths are authenticated and graded according to Islamic scholarly standards.

## Fallback Data

Comprehensive dataset of authentic hadiths used when API is unavailable.

## Project Structure

- `/src/app` - Next.js app directory with main pages and API routes
- `/src/components` - React components for different page sections
- `/public` - Static assets and logos

## Development

The application supports development without API keys using demo data. Missing API keys will automatically fall back to demonstration data for testing purposes.
