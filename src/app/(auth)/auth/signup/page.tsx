import { Metadata } from 'next'
import SignupComponent from '@/components/SignupComp'

export const metadata: Metadata = {
  title: 'Sign Up for BingeBook - Create Your Movie Watchlist Account',
  description:
    'Join BingeBook to create your personalized movie watchlist. Sign up with email or Google to discover, track, and share your favorite movies and shows.',
  keywords: [
    'movie watchlist',
    'signup',
    'BingeBook',
    'movie tracking',
    'entertainment',
  ],
  openGraph: {
    title: 'Sign Up for BingeBook',
    description:
      'Create your BingeBook account to start building your movie watchlist and discover new favorites.',
    url: 'https://yourdomain.com/auth/signup',
    siteName: 'BingeBook',
    images: [
      {
        url: 'https://bingebook.vercel.app/cover.png',
        width: 1200,
        height: 630,
        alt: 'BingeBook Signup',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign Up for BingeBook',
    description: 'Join BingeBook to create and manage your movie watchlist.',
    images: ['https://yourdomain.com/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SignupPage() {
  return <SignupComponent />
}
