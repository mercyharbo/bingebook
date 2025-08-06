'use client'

import { useDebounce } from '@/hooks/use-debounce'
import { fetcher } from '@/lib/utils'
import { Menu, Search, Tv, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import SearchResults from './SearchResults'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

export default function NavHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 500)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const { data: searchResults } = useSWR(
    debouncedSearch
      ? `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/search/multi?query=${encodeURIComponent(
          debouncedSearch
        )}&include_adult=false&language=en-US&page=1`
      : null,
    fetcher
  )

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setShowResults(!!value)
  }

  const handleViewAllResults = () => {
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  const isActive = (href: string) => pathname === href

  return (
    <nav className='sticky top-0 z-50 flex justify-between items-center w-full h-16 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-5 lg:px-10 mx-auto'>
      <Link
        href='/'
        className={`font-bold text-xl lg:text-2xl flex items-center gap-2 transition-colors ${
          isActive('/')
            ? 'text-primary font-semibold'
            : 'text-primary hover:text-primary/80'
        }`}
      >
        <Tv />
        BingeBook
      </Link>

      <div className='hidden md:flex items-center gap-8'>
        <Link
          href='/watchlist'
          className={`text-sm font-medium transition-colors ${
            isActive('/watchlist')
              ? 'text-primary font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Watchlist
        </Link>
        <Link
          href='/discover'
          className={`text-sm font-medium transition-colors ${
            isActive('/discover')
              ? 'text-primary font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Discover
        </Link>

        <Link
          href='/upcoming'
          className={`text-sm font-medium transition-colors ${
            isActive('/upcoming')
              ? 'text-primary font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Upcoming
        </Link>
      </div>

      <div className='flex items-center gap-3'>
        <div className='hidden lg:block relative' ref={searchRef}>
          <Input
            placeholder='Search movies & series...'
            className='w-64 h-9'
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setShowResults(!!searchQuery)}
          />
          {showResults && debouncedSearch && (
            <div className='absolute z-50 w-[350px]'>
              <SearchResults
                results={searchResults?.results || []}
                onViewAll={() => {
                  handleViewAllResults()
                  setShowResults(false)
                }}
              />
            </div>
          )}
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

        <Avatar className='h-8 w-8'>
          <AvatarFallback className='text-xs'>M</AvatarFallback>
        </Avatar>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant='ghost' size='icon' className='md:hidden'>
              <Menu className='h-4 w-4' />
              <span className='sr-only'>Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='sm:w-[80%]'>
            <Link
              href='/'
              className={`font-bold text-xl px-5 pt-2 lg:text-2xl flex items-center gap-2 transition-colors ${
                isActive('/')
                  ? 'text-primary font-semibold'
                  : 'text-primary hover:text-primary/80'
              }`}
            >
              <Tv />
              BingeBook
            </Link>

            <div className='flex flex-col gap-6 pt-[3rem] px-5'>
              <Link
                href='/watchlist'
                className={`text-lg font-medium transition-colors ${
                  isActive('/watchlist')
                    ? 'text-primary font-semibold'
                    : 'hover:text-primary'
                }`}
              >
                Watchlist
              </Link>
              <Link
                href='/discover'
                className={`text-lg font-medium transition-colors ${
                  isActive('/discover')
                    ? 'text-primary font-semibold'
                    : 'hover:text-primary'
                }`}
              >
                Discover
              </Link>

              <Link
                href='/upcoming'
                className={`text-lg font-medium transition-colors ${
                  isActive('/upcoming')
                    ? 'text-primary font-semibold'
                    : 'hover:text-primary'
                }`}
              >
                Upcoming
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isSearchOpen && (
        <div className='absolute top-full left-0 right-0 lg:hidden bg-white dark:bg-background border-b border-gray-200 dark:border-gray-800 p-4 shadow-sm'>
          <div className='flex items-center gap-2'>
            <div className='relative flex-1' ref={searchRef}>
              <Input
                placeholder='Search movies & series...'
                className='w-full'
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowResults(!!searchQuery)}
                autoFocus
              />
              {showResults && debouncedSearch && (
                <div className='absolute z-50 left-0 right-0 mt-2 w-full'>
                  <SearchResults
                    results={searchResults?.results || []}
                    onViewAll={() => {
                      handleViewAllResults()
                      setIsSearchOpen(false)
                      setShowResults(false)
                    }}
                  />
                </div>
              )}
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => {
                setIsSearchOpen(false)
                setShowResults(false)
              }}
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
