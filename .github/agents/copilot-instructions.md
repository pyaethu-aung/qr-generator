# qr-generator Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-15

## Active Technologies
- N/A (Client-side state only; session persistence not required for MVP) (001-qr-generator-mvp)
- TypeScript, React 18, Vite 5 + react, react-dom, qrcode.react (QR rendering), tailwindcss; browser APIs `navigator.share`, `ClipboardItem`, `HTMLCanvasElement.toDataURL` (feature/003-qr-share-button)
- N/A (client-side only) (feature/003-qr-share-button)

- (Transient client state only) (001-qr-generator-mvp)
- TypeScript 5.x (React 19) + React 19, Vite 7, Tailwind CSS v4, `qrcode.react` (display), `qrcode` (generation/download) (001-qr-generator-mvp)
- (Client-side state only; session persistence not required for MVP) (001-qr-generator-mvp)

- TypeScript 5.x (Node 20+ for tooling) + React 18+, Vite 5+, qrcode.react, qrcode (001-qr-generator-mvp)

## Project Structure

```text
src/
├── components/
├── data/
├── hooks/
├── utils/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (Node 20+ for tooling): Follow standard conventions

## Recent Changes
- feature/003-qr-share-button: Added TypeScript, React 18, Vite 5 + react, react-dom, qrcode.react (QR rendering), tailwindcss; browser APIs `navigator.share`, `ClipboardItem`, `HTMLCanvasElement.toDataURL`
- 001-qr-generator-mvp: Added TypeScript 5.x (React 19) + React 19, Vite 7, Tailwind CSS v4, `qrcode.react` (display), `qrcode` (generation/download)
- 001-qr-generator-mvp: Added TypeScript 5.x (React 19) + React 19, Vite 7, Tailwind CSS v4, `qrcode.react` (display), `qrcode` (generation/download)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
