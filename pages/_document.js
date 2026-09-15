import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ja" className="dark h-full">
      <Head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = { darkMode: 'class', theme: { extend: { colors: { spotify: { green: '#1DB954', black: '#121212' } } } } }
            `,
          }}
        ></script>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossOrigin=""></script>
      </Head>
      <body className="bg-spotify-black text-white select-none font-sans h-full w-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
