'use client'

import { Github, Twitter, Youtube } from 'lucide-react'
import Link from 'next/link'

export default function FooterComp() {
  const year = new Date().getFullYear()

  return (
    <footer className='bg-white border-t border-border p-6 md:p-10 lg:p-14'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-[90%] mx-auto '>
        <div className='space-y-4'>
          <div className='text-xl font-semibold'>Watchlist</div>
          <p className='text-sm text-muted-foreground'>
            Discover trending movies and top-rated TV shows. Curate your
            watchlist with ease.
          </p>
          <div className='flex items-center gap-3'>
            <Link
              href='#'
              aria-label='GitHub'
              className='rounded-full p-2 border border-input hover:bg-accent transition-colors'
            >
              <Github className='h-4 w-4' />
              <span className='sr-only'>GitHub</span>
            </Link>
            <Link
              href='#'
              aria-label='Twitter'
              className='rounded-full p-2 border border-input hover:bg-accent transition-colors'
            >
              <Twitter className='h-4 w-4' />
              <span className='sr-only'>Twitter</span>
            </Link>
            <Link
              href='#'
              aria-label='YouTube'
              className='rounded-full p-2 border border-input hover:bg-accent transition-colors'
            >
              <Youtube className='h-4 w-4' />
              <span className='sr-only'>YouTube</span>
            </Link>
          </div>
        </div>

        <nav aria-label='Browse' className='space-y-3'>
          <div className='text-sm font-semibold'>Browse</div>
          <ul className='space-y-2 text-sm text-muted-foreground'>
            <li>
              <Link
                href='/discover'
                className='hover:text-foreground transition-colors'
              >
                Discover
              </Link>
            </li>
            <li>
              <Link
                href='/trending'
                className='hover:text-foreground transition-colors'
              >
                Trending
              </Link>
            </li>
            <li>
              <Link
                href='/tv'
                className='hover:text-foreground transition-colors'
              >
                TV Shows
              </Link>
            </li>
            <li>
              <Link
                href='/upcoming'
                className='hover:text-foreground transition-colors'
              >
                Upcoming
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label='Account' className='space-y-3'>
          <div className='text-sm font-semibold'>Account</div>
          <ul className='space-y-2 text-sm text-muted-foreground'>
            <li>
              <Link
                href='/watchlist'
                className='hover:text-foreground transition-colors'
              >
                My Watchlist
              </Link>
            </li>
            <li>
              <Link
                href='/profile'
                className='hover:text-foreground transition-colors'
              >
                Profile
              </Link>
            </li>
            <li>
              <Link
                href='/settings'
                className='hover:text-foreground transition-colors'
              >
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className='mt-10 w-[90%] mx-auto  flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground'>
        <p>
          {'© '}
          {year}
          {' Watchlist. All rights reserved.'}
        </p>
        <div className='flex items-center gap-4'>
          <Link
            href='/privacy'
            className='hover:text-foreground transition-colors'
          >
            Privacy
          </Link>
          <Link
            href='/terms'
            className='hover:text-foreground transition-colors'
          >
            Terms
          </Link>
          <Link
            href='/contact'
            className='hover:text-foreground transition-colors'
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
