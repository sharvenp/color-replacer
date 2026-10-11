

# color-replacer

A lightweight browser-based tool for replacing a selected color in an image with a new color. It is designed for quick edits, mockups, and simple creative color swaps without needing any server-side processing.

<p align="center">
   <img src="./public/logo.svg" alt="color-replacer logo" width="120" />
   <br />
   <a href="https://sharvenp.github.io/color-replacer/">Try it out!</a>
</p>

## What it does

- Upload an image from your device or drag and drop it into the app
- Choose the original color to replace
- Choose the new color to apply
- Adjust the threshold to control how close a pixel must match the original color
- Use opacity smoothing to soften the transition and create a more natural result
- Preview the transformed image live
- Download the final result as a PNG

## Tech stack

- Vite
- Vanilla JavaScript
- HTML5 canvas

## Local setup

1. Open a terminal in the project folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open the local URL shown in the terminal, usually:

   ```text
   http://localhost:5173/
   ```

## Production build

To generate a production build:

```bash
npm run build
```

To preview the built app locally:

```bash
npm run preview
```

## Notes

- The app runs completely in the browser.
- Images are not uploaded to any external service.
- The canvas preserves the original uploaded image dimensions, while the UI scales the preview for display.

## Disclaimer

This project was generated with GitHub Copilot as a lightweight local utility for image color replacement. It is provided for educational and creative use only.

The tool is intended to help users experiment with simple recoloring workflows in a browser-based environment. It does not guarantee perfect color matching, accurate semantic recoloring, or production-grade image editing fidelity for all files or use cases. Results may vary depending on image content, lighting, contrast, and the selected threshold and smoothing settings.

Users are responsible for reviewing the output before using it in professional, commercial, or publication workflows. This project is distributed as-is, without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, or non-infringement.
