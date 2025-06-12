import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/layout/ClientLayout'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

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
    siteName: 'Jayakrishna Konda Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jayakrishna Konda - Portfolio',
    description: 'Full Stack Developer & DevOps Engineer specializing in AI/ML, Data Science, and Home Server solutions.',
    creator: '@jay739',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// Add viewport height CSS variable
const setViewportHeight = `
  :root {
    --vh: 1vh;
  }
  @media (max-height: 100vh) {
    :root {
      --vh: calc(var(--vh, 1vh));
    }
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: setViewportHeight }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function setViewportHeight() {
                  let vh = window.innerHeight * 0.01;
                  document.documentElement.style.setProperty('--vh', vh + 'px');
                }
                setViewportHeight();
                window.addEventListener('resize', setViewportHeight);
                window.addEventListener('orientationchange', setViewportHeight);
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-[calc(var(--vh,1vh)*100)] bg-background text-gray-900 dark:text-white`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
