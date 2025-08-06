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
import { ArrowLeft, Eye, EyeOff, Film, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Handle login logic here
      console.log('Login attempt:', formData)
    }, 2000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <main className='min-h-screen flex'>
      {/* Left Side - Form */}
      <section className='flex-1 flex items-center justify-center p-5 lg:p-10 bg-background'>
        <div className='w-full max-w-md space-y-8'>
          {/* Header */}
          <div className='text-center space-y-5'>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => router.back()}
              className='absolute top-4 left-4 lg:top-8 lg:left-8'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>

            <div className='flex items-center justify-center gap-2'>
              <div className='bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg'>
                <Film className='h-6 w-6 text-white' />
              </div>
              <span className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                BingeBook
              </span>
            </div>

            <div className='space-y-2'>
              <h1 className='text-3xl font-bold text-foreground'>
                Welcome back
              </h1>
              <p className='text-muted-foreground'>
                Sign in to your account to continue your movie journey
              </p>
            </div>
          </div>

          <Card className='border-0 shadow-lg'>
            <CardHeader className='space-y-1 justify-start items-start'>
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

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <input
                      id='remember'
                      type='checkbox'
                      className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
                    />
                    <Label htmlFor='remember' className='text-sm'>
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href='/auth/forgot-password'
                    className='text-sm text-purple-600 hover:text-purple-500 hover:underline'
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type='submit'
                  className='w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
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
                  className='text-purple-600 hover:text-purple-500 hover:underline font-medium'
                >
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Right Side - Hero Image */}
      <div className='hidden lg:flex flex-1 relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-600'>
        <div className='absolute inset-0 bg-black/20' />
        <div className='relative z-10 flex flex-col justify-center items-center w-full text-white p-12 text-center'>
          <div className='space-y-6 max-w-md m-auto w-full'>
            <div className='text-6xl'>🎬</div>
            <h2 className='text-4xl font-bold leading-tight'>
              Your Movie Journey Continues
            </h2>
            <p className='text-xl text-white/90 leading-relaxed'>
              Discover, track, and enjoy thousands of movies and TV shows. Your
              personalized entertainment hub awaits.
            </p>
            <div className='flex items-center justify-center gap-8'>
              <div className='text-center'>
                <div className='text-2xl font-bold'>10K+</div>
                <div className='text-sm text-white/80'>Movies</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold'>5K+</div>
                <div className='text-sm text-white/80'>TV Shows</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold'>1M+</div>
                <div className='text-sm text-white/80'>Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Movie Cards */}
        <div className='absolute top-20 right-20 w-32 h-48 bg-white/10 backdrop-blur-sm rounded-lg transform rotate-12 opacity-60' />
        <div className='absolute bottom-32 right-32 w-28 h-42 bg-white/10 backdrop-blur-sm rounded-lg transform -rotate-6 opacity-40' />
        <div className='absolute top-1/2 right-12 w-24 h-36 bg-white/10 backdrop-blur-sm rounded-lg transform rotate-6 opacity-50' />
      </div>
    </main>
  )
}
