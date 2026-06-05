import type { Metadata } from 'next'
import Script from 'next/script'
import { JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/layout/ClientLayout'
import * as Sentry from '@sentry/nextjs'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export function generateMetadata(): Metadata {
  const title = 'Jayakrishna Konda — ML/AI Engineer'
  const description = 'ML/AI engineer building production RAG pipelines, LLM systems, MLOps workflows, and self-hosted AI infrastructure.'

  return {
    metadataBase: new URL('https://jay739.dev'),
    title: {
      default: title,
      template: '%s — Jayakrishna Konda',
    },
    description,
    icons: {
      icon: '/images/profile/icon-192x192.png',
      shortcut: '/images/profile/icon-192x192.png',
      apple: '/images/profile/icon-192x192.png',
    },
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
    >
      <head>
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
