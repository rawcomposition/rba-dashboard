import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta
            name="description"
            content="Plan your next birding adventure with ease using our interactive map tool. The user-friendly interface lets you customize your trip and stay organized along the way."
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <meta name="theme-color" content="#0f172a" />
          <link rel="manifest" href="/manifest.json"></link>
          <link
            href="https://fonts.googleapis.com/css2?family=Lobster&family=Ubuntu:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/apple-icon.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
