'use client'

import {
  Clock,
  Compass,
  Heart,
  Home,
  LayoutGrid,
  LogOut,
  PlayCircle,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/lib/store/authStore'
import { createClient } from '@/lib/supabase/client'
import { Tv } from 'lucide-react'
import { useRouter } from 'next/navigation'

const mainItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Explore', url: '/discover', icon: Compass },
  { title: 'Genres', url: '/genres', icon: LayoutGrid },
  { title: 'Watchlist', url: '/watchlist', icon: Heart },
]

const libraryItems = [
  { title: 'Upcoming Releases', url: '/upcoming', icon: Clock },
  { title: 'Recently Viewed', url: '/history', icon: PlayCircle }, // Assuming tracking history
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, clearUser } = useAuthStore()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearUser()
    router.push('/')
  }

  return (
    <Sidebar className='border-r-0 bg-transparent'>
      <div className='absolute inset-0 bg-sidebar/40 backdrop-blur-xl -z-10' />

      <SidebarHeader className='p-6'>
        <Link
          href='/'
          className='font-medium text-2xl flex items-center gap-3 transition-all hover:scale-105'
        >
          <div className='bg-primary/20 p-2 rounded-lg border border-primary/30'>
            <Tv className='size-6 text-primary' />
          </div>
          <span className='text-glow'>Drameeo</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className='px-3 gap-0'>
        <SidebarGroup>
          <SidebarGroupLabel className='px-3 text-xs font-medium uppercase text-muted-foreground/50 mb-2'>
            Menu
          </SidebarGroupLabel>
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  className='h-11 transition-all hover:bg-white/5 active:scale-95'
                >
                  <Link href={item.url}>
                    <item.icon className='size-5' />
                    <span className='text-[15px] font-medium'>
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className='mt-4'>
          <SidebarGroupLabel className='px-3 text-xs font-medium uppercase text-muted-foreground/50 mb-2'>
            Library
          </SidebarGroupLabel>
          <SidebarMenu>
            {libraryItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  className='h-11 transition-all hover:bg-white/5 active:scale-95'
                >
                  <Link href={item.url}>
                    <item.icon className='size-5' />
                    <span className='text-[15px] font-medium'>
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='p-4 gap-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='h-11 transition-all hover:bg-white/5'
            >
              <Link href='/settings'>
                <Settings className='size-5 text-muted-foreground' />
                <span className='text-[15px] font-medium text-muted-foreground'>
                  Settings
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className='h-11 transition-all hover:bg-destructive/10 hover:text-destructive text-muted-foreground'
              >
                <LogOut className='size-5' />
                <span className='text-[15px] font-medium'>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
