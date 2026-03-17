'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Bell, Palette, User } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <main className='flex flex-col min-h-screen bg-gradient-premium overflow-x-hidden'>
      <div className='flex flex-col gap-12 px-6 py-12 lg:px-12 max-w-5xl mx-auto w-full'>
        <header className='space-y-1'>
          <h1 className='text-4xl font-bold text-glow'>Settings</h1>
          <p className='text-muted-foreground font-medium'>
            Manage your account settings and preferences.
          </p>
        </header>

        <div className='grid gap-8'>
          {/* Appearance Section */}
          <section className='space-y-6'>
            <div className='flex items-center gap-3'>
              <Palette className='size-5 text-primary' />
              <h2 className='text-xl font-medium'>Appearance</h2>
            </div>

            <Card className='glass-dark border-white/5 overflow-hidden rounded-3xl'>
              <CardContent className='p-8 space-y-8'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='text-base font-medium'>Theme Mode</Label>
                    <p className='text-sm text-muted-foreground'>
                      Switch between light and dark themes.
                    </p>
                  </div>
                  <div className='flex bg-white/5 p-1 rounded-xl gap-1'>
                    {['light', 'dark', 'system'].map((t) => (
                      <Button
                        key={t}
                        variant={theme === t ? 'default' : 'ghost'}
                        size='sm'
                        onClick={() => setTheme(t)}
                        className={`rounded-lg capitalize ${theme === t ? 'bg-primary shadow-lg shadow-primary/20' : 'hover:bg-white/5'}`}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className='bg-white/5' />

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='text-base font-medium'>
                      Glassmorphism Effects
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Enable premium glass transparency and blur.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Notifications Section */}
          <section className='space-y-6'>
            <div className='flex items-center gap-3'>
              <Bell className='size-5 text-primary' />
              <h2 className='text-xl font-medium'>Notifications</h2>
            </div>

            <Card className='glass-dark border-white/5 overflow-hidden rounded-3xl'>
              <CardContent className='p-8 space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='text-base font-medium'>
                      Upcoming Releases
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Get notified when a tracked show has a new episode.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className='bg-white/5' />
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='text-base font-medium'>
                      Market Reminders
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Daily notifications for your tracking list.
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Account Section */}
          <section className='space-y-6'>
            <div className='flex items-center gap-3'>
              <User className='size-5 text-primary' />
              <h2 className='text-xl font-medium'>Account</h2>
            </div>

            <Card className='glass-dark border-white/5 overflow-hidden rounded-3xl'>
              <CardContent className='p-8 space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='text-base font-medium'>
                      Profile Details
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Manage your profile information and email.
                    </p>
                  </div>
                  <Button
                    variant='outline'
                    className='rounded-xl border-white/10 hover:bg-white/5'
                  >
                    Edit Profile
                  </Button>
                </div>
                <Separator className='bg-white/5' />
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label className='text-base font-medium text-destructive'>
                      Danger Zone
                    </Label>
                    <p className='text-sm text-destructive/60'>
                      Permanently delete your account and all data.
                    </p>
                  </div>
                  <Button
                    variant='destructive'
                    className='rounded-xl shadow-lg shadow-destructive/20'
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
