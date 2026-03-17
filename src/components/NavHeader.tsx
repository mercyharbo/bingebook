'use client'

import { useDebounce } from '@/hooks/use-debounce'
import { useAuthStore } from '@/lib/store/authStore'
import { useSearchStore } from '@/lib/store/searchStore'
import { createClient } from '@/lib/supabase/client'
import { fetcher } from '@/lib/utils'
import { Bell, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import SearchResults from './SearchResults'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { SidebarTrigger } from './ui/sidebar'

export default function NavHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const searchRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const {
    searchQuery,
    setSearchQuery,
    showResults,
    setShowResults,
  } = useSearchStore()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
  }, [setShowResults])

  useEffect(() => {
    function handleProfileMenuClickOutside(event: MouseEvent) {
      const target = event.target as Element
      if (
        profileMenuOpen &&
        !target.closest('[data-profile-menu]') &&
        !target.closest('[data-profile-trigger]')
      ) {
        setProfileMenuOpen(false)
      }
    }

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleProfileMenuClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleProfileMenuClickOutside)
      }
    }
  }, [profileMenuOpen])

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

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const names = name.split(' ')
      return names.length > 1
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0][0].toUpperCase()
    }
    return email ? email[0].toUpperCase() : 'U'
  }

  const handleUserSignout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error(`Error signing out: ${error.message}`)
    }

    clearUser()
    setProfileMenuOpen(false)
    router.refresh()
  }

  return (
    <header className={`sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between gap-4 px-6 lg:px-8 transition-all duration-300 ${isScrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="-ml-1 size-10 hover:bg-white/10 rounded-lg transition-all active:scale-95" />
        
        <div className="relative w-full max-w-lg" ref={searchRef}>
          <div className="relative flex items-center group">
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Search for films, directors, or actors..."
              className="w-full h-12 rounded-lg bg-white/5 border-white/5 pl-11 pr-4 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:bg-white/10 transition-all placeholder:text-muted-foreground/60"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowResults(!!searchQuery)}
            />
          </div>
          {showResults && debouncedSearch && searchResults?.results && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2">
              <SearchResults
                results={searchResults.results || []}
                onViewAll={() => {
                  handleViewAllResults()
                  setShowResults(false)
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative size-10 rounded-lg hover:bg-white/10 transition-all active:scale-95"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary border-2 border-background" />
          <span className="sr-only">Notifications</span>
        </Button>

        <div className="relative">
          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white/5" />
          ) : user ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg hover:ring-2 hover:ring-primary/50 transition-all"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              data-profile-trigger
            >
              <Avatar className="h-10 w-10 border border-white/10 rounded-lg">
                {user.user_metadata?.avatar_url && (
                  <AvatarImage
                    src={user.user_metadata.avatar_url}
                    alt="User avatar"
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="text-xs bg-white/5 text-muted-foreground font-medium">
                  {getInitials(
                    user.user_metadata?.full_name || user.user_metadata?.name,
                    user.email
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-[-2px] right-[-2px] h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            </Button>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Sign In
            </Link>
          )}

          {profileMenuOpen && (
            <div
              className="absolute right-0 top-full mt-3 w-56 rounded-lg border border-white/10 bg-black/60 backdrop-blur-2xl p-2 text-popover-foreground shadow-2xl animate-in fade-in-80 zoom-in-95"
              data-profile-menu
            >
              <div className="flex flex-col gap-1">
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setProfileMenuOpen(false)}
                  asChild
                  className="w-full justify-start text-sm hover:bg-white/5 rounded-lg h-10 mt-1"
                >
                  <Link href="/profile">Profile Settings</Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleUserSignout}
                  className="w-full justify-start text-sm text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg h-10"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
