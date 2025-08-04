'use client'

import { Menu, Search, Tv, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

export default function NavHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <nav className='sticky top-0 z-50 flex justify-between items-center w-full h-16 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-4 lg:px-8'>
      <Link
        href='/'
        className='font-bold text-xl lg:text-2xl text-primary flex items-center gap-2 hover:text-primary/80 transition-colors'
      >
        <Tv />
        BingeBook
      </Link>

      <div className='hidden md:flex items-center gap-8'>
        <Link
          href='/watchlist'
          className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
        >
          Watchlist
        </Link>
        <Link
          href='/discover'
          className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
        >
          Discover
        </Link>
        <Link
          href='/upcoming'
          className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
        >
          Upcoming
        </Link>
      </div>

      <div className='flex items-center gap-3'>
        <div className='hidden lg:block'>
          <Input placeholder='Search movies & series...' className='w-64 h-9' />
        </div>

        <Button
          variant='ghost'
          size='icon'
          className='lg:hidden'
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          <Search className='h-4 w-4' />
          <span className='sr-only'>Toggle search</span>
        </Button>

        {/* Avatar */}
        <Avatar className='h-8 w-8'>
          <AvatarFallback className='text-xs'>M</AvatarFallback>
        </Avatar>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='ghost' size='icon' className='md:hidden'>
              <Menu className='h-4 w-4' />
              <span className='sr-only'>Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-[300px] sm:w-[80%]'>
            <Link
              href='/'
              className='font-bold text-xl px-5 pt-2 lg:text-2xl text-primary flex items-center gap-2 hover:text-primary/80 transition-colors'
            >
              <Tv />
              BingeBook
            </Link>

            <div className='flex flex-col gap-6 pt-[3rem] px-5 '>
              <Link
                href='/watchlist'
                className='text-lg font-medium hover:text-primary transition-colors'
              >
                Watchlist
              </Link>
              <Link
                href='/discover'
                className='text-lg font-medium hover:text-primary transition-colors'
              >
                Discover
              </Link>
              <Link
                href='/upcoming'
                className='text-lg font-medium hover:text-primary transition-colors'
              >
                Upcoming
              </Link>
              <div className='pt-4 border-t'>
                <Input
                  placeholder='Search movies & series...'
                  className='w-full'
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Search Bar (slides down when toggled) */}
      {isSearchOpen && (
        <div className='absolute top-full left-0 right-0 lg:hidden bg-white dark:bg-background border-b border-gray-200 dark:border-gray-800 p-4 shadow-sm'>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='Search movies & series...'
              className='flex-1'
              autoFocus
            />
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsSearchOpen(false)}
            >
              <X className='h-4 w-4' />
              <span className='sr-only'>Close search</span>
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
