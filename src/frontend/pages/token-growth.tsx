import React from 'react';
import Head from 'next/head';
import TokenGrowthSection from '@/components/TokenGrowthSection';

export default function TokenGrowthPage() {
  return (
    <>
      <Head>
        <title>HYPE Token Growth - Математически Неизбежный Рост | HypeAI</title>
        <meta
          name="description"
          content="Узнайте почему токен HYPE обречен на рост. Математическое доказательство: 50% burn + реальная utility = неизбежный рост цены. Conservative: 3.5x, Optimistic: 1000x."
        />
        <meta name="keywords" content="hype token, inevitable growth, deflationary crypto, burn mechanism, guaranteed returns, cryptocurrency investment" />

        {/* Open Graph */}
        <meta property="og:title" content="HYPE Token: Математически Неизбежный Рост" />
        <meta property="og:description" content="50% burn mechanism + Real utility = Цена ОБЯЗАНА расти. Не надежда. Математика." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hypeai.com/token-growth" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HYPE Token: Неизбежный Рост 🚀" />
        <meta name="twitter:description" content="Математическое доказательство роста: 50% burns + Real utility = Price MUST rise" />
      </Head>

      <TokenGrowthSection />
    </>
  );
}
