import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Web-only document shell. Native builds ignore this file entirely.
 * Fonts are loaded here rather than through expo-font because the web app is
 * the only target we're iterating on right now.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#EDEFEA" />
        <title>Willo</title>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const css = `
  html, body, #root { height: 100%; background-color: #EDEFEA; }
  body { overscroll-behavior-y: none; -webkit-font-smoothing: antialiased; }

  /* The pager is the app's spine: one swipe per screen, no half-states. */
  [data-willo-pager]::-webkit-scrollbar { display: none; }
  [data-willo-pager] { scrollbar-width: none; }

  /* Hide scrollbars inside panels without losing wheel/trackpad scrolling. */
  [data-willo-scroll]::-webkit-scrollbar { width: 0; height: 0; }
  [data-willo-scroll] { scrollbar-width: none; }

  :focus-visible { outline: 2px solid #2E23C9; outline-offset: 2px; border-radius: 4px; }

  input, textarea { font-family: inherit; }
  ::selection { background: #2E23C9; color: #fff; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
