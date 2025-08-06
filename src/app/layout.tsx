import NavHeader from '@/components/NavHeader'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'BingeBook – Track Your Movies & Series Seamlessly',
  description:
    'BingeBook helps you stay on top of your entertainment. Track upcoming movies, current watchlist, and your progress in series episodes—never lose track of what to watch next.',
  keywords: [
    'movie tracker',
    'series tracker',
    'watchlist app',
    'episode tracker',
    'TV show organizer',
    'BingeBook',
    'track movies',
    'track series',
    'next episode reminder',
    'watch history',
  ],
  authors: [{ name: 'Damilare', url: 'https://github.com/mercyharbo' }],
  creator: 'Damilare',
  openGraph: {
    title: 'BingeBook – Your Personal Movie & Series Tracker',
    description:
      'Organize your watchlist, track episodes, and discover upcoming releases with BingeBook.',
    url: 'https://bingebook.vercel.app/',
    siteName: 'BingeBook',
    images: [
      {
        url: 'https://bingebook.vercel.app/cover.png',
        width: 1200,
        height: 630,
        alt: 'BingeBook preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BingeBook – Track Your Watchlist',
    description:
      'Stay organized with BingeBook. Track movies, series, and episode progress effortlessly.',
    images: ['https://bingebook.vercel.app/cover.png'],
    creator: '@codewithmercy',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavHeader />
        <div className=''>{children}</div>
      </body>
    </html>
  )
}
