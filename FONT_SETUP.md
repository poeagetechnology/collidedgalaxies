# Beatrice Deck Trial Font Setup

## Overview
The website has been configured to use **Beatrice Deck Trial** font globally across all pages.

## Font Files Location
Font files should be placed in: `/public/fonts/`

## Required Font Files
Place the following font files in the `/public/fonts/` directory:

1. **BeatriceDeckTrial.woff2** (Regular weight)
2. **BeatriceDeckTrial.woff** (Regular weight)
3. **BeatriceDeckTrial.ttf** (Regular weight)
4. **BeatriceDeckTrial-Bold.woff2** (Bold weight)
5. **BeatriceDeckTrial-Bold.woff** (Bold weight)
6. **BeatriceDeckTrial-Bold.ttf** (Bold weight)

## How It Works
- The font is declared in `/app/globals.css` with `@font-face` rules
- The CSS applies the font globally to all elements using the `*` selector as a fallback
- If the font files are not found, it will fall back to system fonts

## Files Modified
1. **app/globals.css** - Added @font-face declarations for Beatrice Deck Trial
2. **src/components/header.tsx** - Removed unused Google Fonts imports and applied Beatrice Deck Trial globally

## Steps to Complete Font Setup

1. Download or obtain the **Beatrice Deck Trial** font files in the following formats:
   - WOFF2 (modern, compressed)
   - WOFF (fallback)
   - TTF (additional fallback)

2. Create the directory structure if it doesn't exist:
   ```
   public/fonts/
   ```

3. Place all 6 font files in the `/public/fonts/` directory

4. Restart the development server:
   ```
   npm run dev
   ```

5. The font will now be applied to the entire website

## Font Weight Support
- **Regular (400)**: Used for body text and standard elements
- **Bold (700)**: Used for headings and emphasized text

## Fallback System
If fonts fail to load, the following fallback fonts will be used:
- Apple system fonts
- BlinkMacSystemFont
- Segoe UI
- Roboto
- Generic sans-serif

## Browser Support
The font setup supports:
- Modern browsers (WOFF2)
- Legacy browsers (WOFF, TTF)
- All devices and platforms
