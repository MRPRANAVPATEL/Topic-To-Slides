# Topic to Slides

Turn any topic into a presentation. Type a subject, choose how detailed you want it, review the outline, and create a Google Slides deck with photos in one click.

## Features

- **Topic to outline:** enter any topic and get a structured slide outline (title slide plus content slides with short bullet points)
- **Explanation levels:** Simple, Student, or Advanced, so the same topic can suit different audiences
- **Editable preview:** review and edit slide titles and bullets before the deck is created
- **Topic photos:** relevant photos for each slide, including a full-slide background image for the title slide
- **Readable design:** text overlays on photos, varied slide layouts, and a consistent color theme
- **Google Slides export:** sign in with Google and the finished deck is created directly in your Google account, ready to edit and present
- **Photo credits:** photographers are credited on every slide that uses their photo
- **Graceful fallbacks:** if a photo can't be found or a limit is reached, the slide uses a gradient background and the deck is still created
- **Resilient requests:** automatic retries and model fallback when the language model is busy

## How it works

1. You enter a topic and choose a level.
2. The Gemini API produces a slide outline and a short photo search term for each slide.
3. The app searches Unsplash for matching photos.
4. You review and edit the outline in the preview.
5. The Google Slides API creates the presentation in your Google Drive, including text, background images, and credits.

## APIs and services used

| Service | Used for |
|---|---|
| [Gemini API](https://ai.google.dev/gemini-api/docs) | Generating slide outlines and image search terms |
| [Google Slides API](https://developers.google.com/slides/api) | Creating and formatting the presentation |
| Sign in with Google (OAuth) | Letting users create decks in their own Google account |
| [Unsplash API](https://unsplash.com/developers) | Topic photos and backgrounds |

## Getting started

### Prerequisites

- Node.js [version, for example 18 or later]
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)
- An Unsplash developer account and Access Key
- A Google Cloud project with the Google Slides API enabled and OAuth credentials, if you run the app outside Google AI Studio

### Installation

```bash
git clone https://github.com/[your-username]/[repository-name].git
cd [repository-name]
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

Never commit your `.env` file or share these keys. Keep API keys on the server side only.

### Run locally

```bash
npm run dev
```

Then open the local address shown in your terminal.

## Usage

1. Open the app and sign in with Google when prompted.
2. Enter a topic, such as "How volcanoes work", and pick a level.
3. Review the generated outline and edit any title or bullet.
4. Choose your image layout (background photos, side photos, or no images).
5. Click **Create presentation** and open the new deck in Google Slides.

## Limits to be aware of

- **Unsplash:** apps start in demo mode with 50 requests per hour, so very frequent use may temporarily fall back to gradient backgrounds.
- **Gemini API:** the free tier is rate-limited, and high demand can cause temporary errors, which the app handles by retrying.
- **Google Slides:** the Slides API creates content and images but does not support slide animations or transitions, so those can be added manually in Google Slides.

## Project structure

```
[Replace with your actual folders after checking the repo, for example:]
├── src/            Frontend code
├── server/         API routes and integrations
├── package.json
└── README.md
```

## Photo credits

Photos are provided by [Unsplash](https://unsplash.com) and credited to their photographers on each slide that uses them.

## Roadmap

- Additional slide layouts and themes
- More image sources
- Export to PDF
