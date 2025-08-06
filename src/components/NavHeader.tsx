'use client'

import { useDebounce } from '@/hooks/use-debounce'
import { useAuthStore } from '@/lib/store/authStore'
import { createClient } from '@/lib/supabase/client'
import { fetcher } from '@/lib/utils'
import { ChevronDown, Menu, Search, Tv, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import SearchResults from './SearchResults'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

export default function NavHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const searchRef = useRef<HTMLDivElement>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggleMenu, setToggleMenu] = useState<boolean>(false)

  const debouncedSearch = useDebounce(searchQuery, 500)

  const { user, setUser, clearUser } = useAuthStore()

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        setUser(null)
        setLoading(false)
        return
      }

      if (session) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          setUser(null)
        } else {
          setUser(user)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      console.log('event', event)
    })

    return () => subscription.unsubscribe()
  }, [supabase, setUser])

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

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const names = name.split(' ')
      return names.length > 1
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase()
    }
    return email ? email[0].toUpperCase() : 'U'
  }

  /**
   * The function `handleUserSignout` signs the user out using Supabase authentication and closes the
   * menu.
   */
  const handleUserSignout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error signing out:', error.message)
    }

    clearUser()
    setToggleMenu(false)
  }

  const handleToggleMenu = () => {
    setToggleMenu(!toggleMenu)
  }

  console.log('user info:', user)

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
        {user && (
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
        )}
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

      <div className='flex items-center gap-4 relative'>
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

        {loading ? (
          <div className='h-8 w-8 animate-pulse bg-gray-200 rounded-full' />
        ) : user ? (
          <Button
            variant={'ghost'}
            size={'icon'}
            className='shadow-none cursor-pointer hover:bg-transparent px-0'
            onClick={handleToggleMenu}
          >
            <Avatar className='h-8 w-8'>
              {user.user_metadata?.avatar_url && (
                <AvatarImage
                  src={user.user_metadata.avatar_url}
                  alt='User avatar'
                />
              )}
              <AvatarFallback className='text-xs'>
                {getInitials(
                  user.user_metadata?.full_name || user.user_metadata?.name,
                  user.email
                )}
              </AvatarFallback>
            </Avatar>

            <ChevronDown />
          </Button>
        ) : (
          <div className='hidden items-center gap-5 lg:flex'>
            <Link
              href='/auth/login'
              className='hidden md:inline-block text-sm font-medium text-primary hover:text-primary/80'
            >
              Sign In
            </Link>
          </div>
        )}

        {toggleMenu && (
          <div className='absolute top-full right-0'>
            <div className='flex flex-col justify-start items-start gap-2 bg-white group-hover:cursor-pointer shadow-lg rounded-lg ring-1 ring-gray-300 p-2 w-36'>
              <Button
                variant={'secondary'}
                onClick={() => setToggleMenu(false)}
                asChild
                className='w-full justify-start'
              >
                <Link href='/profile'>Profile</Link>
              </Button>
              <Button
                variant={'secondary'}
                onClick={() => setToggleMenu(false)}
                asChild
                className='w-full justify-start'
              >
                <Link href='/settings'>Settings</Link>
              </Button>
              <Button
                variant={'secondary'}
                onClick={handleUserSignout}
                className='w-full justify-start'
              >
                Sign Out
              </Button>
            </div>
          </div>
        )}

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
              {user && (
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
              )}
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
              {loading ? (
                <div className='h-6 w-20 animate-pulse bg-gray-200 rounded' />
              ) : (
                <Link
                  href='/auth/login'
                  className='text-lg font-medium transition-colors hover:text-primary'
                >
                  Sign In
                </Link>
              )}
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
