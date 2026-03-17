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
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'
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
    <main className='min-h-screen bg-background relative flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <Card className='glass-dark border-white/10 shadow-lg pb-6'>
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
              <div className='relative flex justify-center text-xs'>
                <span className='bg-background px-2 text-gray-300'>Or</span>
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
                    className='h-11 pl-10'
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
                    className='h-11 pl-10 pr-10'
                    required
                  />
                  <button
                    type='button'
                    className='absolute right-0 top-0 h-full px-3 py-2'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4 text-muted-foreground' />
                    ) : (
                      <Eye className='h-4 w-4 text-muted-foreground' />
                    )}
                  </button>
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
    </main>
  )
}
