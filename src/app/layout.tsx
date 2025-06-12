import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from '@/components/layout/ClientLayout'

export const metadata: Metadata = {
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
}

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
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
