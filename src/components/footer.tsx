'use client'

import { Github, Mail, Twitter, Youtube } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function FooterComp() {
  const year = new Date().getFullYear()

  function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') || '')
    if (!email) return
    toast.success('Subscribed successfully')
    form.reset()
  }

  return (
    <footer className='border-t'>
      <div className='container mx-auto px-5 lg:px-10 py-10'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10'>
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

          <div className='space-y-3'>
            <div className='text-sm font-semibold'>Newsletter</div>
            <p className='text-sm text-muted-foreground'>
              Get weekly updates on new releases and trending titles.
            </p>
            <form
              onSubmit={handleSubscribe}
              className='flex w-full max-w-sm items-center gap-2'
            >
              <div className='relative flex-1'>
                <Mail className='absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  name='email'
                  type='email'
                  required
                  autoComplete='email'
                  placeholder='you@example.com'
                  className='pl-8'
                  aria-label='Email address'
                />
              </div>
              <Button type='submit' className='whitespace-nowrap'>
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className='mt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground'>
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
      </div>
    </footer>
  )
}
