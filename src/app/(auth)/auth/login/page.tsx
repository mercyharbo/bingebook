'use client'

import SignInButton from '@/components/LoginWithGoogle'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client' // 👈 Import Supabase client
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Film,
  Lock,
  Mail,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // --- 👇 MODIFIED SUBMIT HANDLER ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null) // Reset error before new attempt

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      setError(error.message) // Set error message from Supabase
      setIsLoading(false)
    } else {
      toast.success('Welcome back! You have successfully logged in.')
      router.refresh()
      router.push('/') // Redirect to home page
    }
  }

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden'>
      <div className='relative min-h-screen flex'>
        {/* Creative Aside - Hidden on mobile, visible on laptop+ */}
        <aside className='hidden lg:flex lg:flex-1 relative items-center justify-center p-12'>
          <div className='max-w-md space-y-8'>
            {/* Back Button */}
            <Button
              variant='secondary'
              size='sm'
              onClick={() => router.back()}
              className='absolute top-8 left-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 ring ring-border h-10'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>

            {/* Hero Content */}
            <div className='text-center space-y-6'>
              <div className='text-8xl animate-bounce'>🎬</div>

              <div>
                <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight'>
                  Welcome Back to
                  <span className='block'>Your Cinema</span>
                </h2>
                <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed'>
                  Continue your cinematic journey. Track your favorite movies
                  and TV shows.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className='grid grid-cols-1 gap-4 mt-8'>
                <div className='flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/50'>
                  <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center'>
                    <Film className='h-6 w-6 text-white' />
                  </div>
                  <div className='text-left'>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      Your Watchlists
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Access all your saved collections
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/50'>
                  <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center'>
                    <Lock className='h-6 w-6 text-white' />
                  </div>
                  <div className='text-left'>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      Secure Access
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Your data is protected and private
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Form Section */}
        <section className='flex-1 flex items-center justify-center p-4 lg:p-12'>
          <div className='w-full max-w-md'>
            {/* Mobile Header - Only visible on mobile */}
            <div className='lg:hidden text-center mb-8'>
              <div className='inline-flex items-center justify-center w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-4 relative'>
                <Film className='h-7 w-7 text-blue-600 dark:text-blue-400' />
              </div>
              <h1 className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-2'>
                Welcome Back
              </h1>
              <p className='text-gray-600 dark:text-gray-400 text-sm'>
                Sign in to continue your journey
              </p>
            </div>

            <Card className='shadow-lg'>
              <CardHeader className='space-y-1 text-center justify-center items-center'>
                <CardTitle className='text-2xl'>Sign In</CardTitle>
                <CardDescription className=''>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <SignInButton />

                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <Separator className='w-full' />
                  </div>
                  <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-background px-2 text-muted-foreground'>
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='email'
                        name='email'
                        type='email'
                        placeholder='Enter your email'
                        value={formData.email}
                        onChange={handleInputChange}
                        className='pl-10'
                        required
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='password'>Password</Label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='password'
                        name='password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter your password'
                        value={formData.password}
                        onChange={handleInputChange}
                        className='pl-10 pr-10'
                        required
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4 text-muted-foreground' />
                        ) : (
                          <Eye className='h-4 w-4 text-muted-foreground' />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* --- 👇 ERROR MESSAGE DISPLAY --- */}
                  {error && (
                    <div className='flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
                      <AlertCircle className='h-4 w-4' />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <input
                        id='remember'
                        type='checkbox'
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <Label htmlFor='remember' className='text-sm'>
                        Remember me
                      </Label>
                    </div>
                    <Link
                      href='/auth/forgot-password'
                      className='text-sm text-blue-600 hover:text-blue-500 hover:underline'
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type='submit'
                    className='w-full h-12 bg-blue-600 hover:bg-blue-700'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                <div className='text-center text-sm'>
                  <span className='text-muted-foreground'>
                    Don&apos;t have an account?{' '}
                  </span>
                  <Link
                    href='/auth/signup'
                    className='text-blue-600 hover:text-blue-500 hover:underline font-medium'
                  >
                    Sign up
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}
