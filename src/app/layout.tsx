import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import ClientLayout from '@/components/layout/ClientLayout'
import * as Sentry from '@sentry/nextjs'

export function generateMetadata(): Metadata {
  const title = 'Jayakrishna Konda - Portfolio'
  const description = 'ML/AI engineer building production RAG pipelines, LLM systems, MLOps workflows, and self-hosted AI infrastructure.'

  return {
    metadataBase: new URL('https://jay739.dev'),
    title,
    description,
    keywords: ['Full Stack Developer', 'DevOps Engineer', 'AI/ML Engineer', 'Data Science', 'Home Server'],
    authors: [{ name: 'Jayakrishna Konda' }],
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://jay739.dev',
      title,
      description,
      siteName: 'Jayakrishna Konda Portfolio',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: 'Jayakrishna Konda portfolio preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/opengraph-image'],
    },
    other: {
      ...Sentry.getTraceData()
    }
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=JetBrains+Mono:wght@300..700&display=swap"
          rel="stylesheet"
        />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
