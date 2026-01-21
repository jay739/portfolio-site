import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import ClientLayout from '@/components/layout/ClientLayout'
import * as Sentry from '@sentry/nextjs'

export function generateMetadata(): Metadata {
  return {
    title: 'Jayakrishna Konda - Portfolio',
    description: 'Full Stack Developer & DevOps Engineer specializing in AI/ML, Data Science, and Home Server solutions.',
    keywords: ['Full Stack Developer', 'DevOps Engineer', 'AI/ML Engineer', 'Data Science', 'Home Server'],
    authors: [{ name: 'Jayakrishna Konda' }],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://jay739.dev',
      title: 'Jayakrishna Konda - Portfolio',
      description: 'Full Stack Developer & DevOps Engineer specializing in AI/ML, Data Science, and Home Server solutions.',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
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
