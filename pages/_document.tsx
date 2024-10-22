import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="zh" className="antialiased bg-zinc-950  text-zinc-100 tabular-nums">
      <Head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link rel="icon" type="image/png" href="/favicon-48x48.png" sizes="48x48" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="ServerStatus" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body className="antialiased bg-zinc-950  text-zinc-100 tabular-nums">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
