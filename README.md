# Talk & Tap Reading

A browser-based reading tool for learners who benefit from seeing spoken words on screen and hearing them back on demand. Speak into the microphone, see each word appear in a tappable box, then tap any word or use **Read** to hear it spoken aloud.

## Features

- **Listen** — continuous speech recognition with live interim text
- **Tap** — hear any word spoken individually
- **Read** — sequential read-back with word highlighting
- **Settings** — adjustable font size, spacing, line width, and dyslexia-friendly fonts (persisted in the browser)

## Browser support

Requires the Web Speech API (speech recognition and synthesis). Works best in **Google Chrome** or **Microsoft Edge** on desktop or tablet. Microphone access and an internet connection are required for speech recognition.

## Development

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run lint    # ESLint
npm run build   # TypeScript check + production build
npm run preview # Preview production build locally
```

## Deployment

Pushes to `main` deploy automatically to GitHub Pages at `/talk-tap-reading/`.
