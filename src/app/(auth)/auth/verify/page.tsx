'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Film } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // If the user is signed in, the email has been verified
      if (event === 'SIGNED_IN' && session) {
        // Redirect to the profile page after a short delay
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    })

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <main className='min-h-screen flex items-center justify-center p-5 bg-background'>
      <Card className='w-full max-w-md border-0 shadow-none bg-transparent'>
        <CardHeader className='space-y-1 text-center'>
          <div className='flex items-center justify-center gap-1 mb-4'>
            <div className='bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg'>
              <Film className='h-6 w-6 text-white' />
            </div>
            <span className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              BingeBook
            </span>
          </div>
          <CardTitle className='text-2xl'>Email Verified!</CardTitle>
          <CardDescription>
            Thank you for verifying your email. You will be redirected to your
            profile shortly...
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center'>
          <Button
            asChild
            variant='default'
            className='bg-blue-600 hover:bg-blue-500 text-white'
          >
            <Link href='/auth/login'>Go to Login Now</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
