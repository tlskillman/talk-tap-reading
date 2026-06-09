# Talk & Tap Reading

A small experimental reading-support tool. A child talks, sees their words appear, then taps any word to hear it spoken back. The main buttons are **Talk** and **Tap** — the child's actions, not the app's. The goal is to reinforce the connection between the printed word and the sound of the word.

This is not a medical or educational treatment and does not claim to diagnose or treat dyslexia.

## Features

- **Tap sample words** — on first visit, tappable demo words appear: *Talk. See words. Tap to hear.*
- **Talk** — speech recognition with live interim text
- **Tap words** — hear any word spoken individually, in any order
- **Tap button** — sequential read-back with word highlighting
- **New** — start a fresh sentence
- **Settings** — adjustable font size, spacing, line width, and dyslexia-friendly fonts (persisted in the browser)
- **For parents and teachers** — how to use, privacy, and known limitations

## Browser support

Requires the Web Speech API (speech recognition and synthesis). Works best in **Google Chrome** or **Microsoft Edge** on desktop or tablet. Microphone access and an internet connection are required for **Talk**. Tapping words and the **Tap** button work without a microphone once words are on screen.

## Privacy

- No server; sentences are not stored or uploaded by this app
- Display settings are saved in the browser only (`localStorage`)
- **Talk** sends audio to your browser vendor's cloud speech service (Google in Chrome, Microsoft in Edge)
- Tapping words and the **Tap** button use your browser's built-in text-to-speech

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

## Feedback

[Open an issue](https://github.com/tlskillman/talk-tap-reading/issues) on GitHub.
