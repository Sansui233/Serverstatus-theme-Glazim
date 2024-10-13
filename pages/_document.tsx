import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </Head>
      <body className="antialiased bg-zinc-950  text-zinc-100 tabular-nums">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
