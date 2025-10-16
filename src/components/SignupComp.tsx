'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Film,
  Lock,
  Mail,
  Star,
  User,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import { Card } from './ui/card'

// Define Yup validation schema
const signupSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
})

export default function SignupComponent() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      // Validate form data with Yup
      await signupSchema.validate(formData, { abortEarly: false })

      setIsLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        toast.success(
          'Account created successfully! Please check your email to verify your account.'
        )
        router.push('/auth/login')
      }
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {}
        err.inner.forEach((errorItem) => {
          if (errorItem.path) {
            validationErrors[errorItem.path] = errorItem.message
          }
        })
        setErrors(validationErrors)
      } else if (err && typeof err === 'object' && 'message' in err) {
        setErrors({
          general:
            (err as { message?: string }).message ||
            'An error occurred during signup',
        })
      } else {
        setErrors({
          general: 'An unexpected error occurred',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: unknown) {
      setErrors({
        general:
          (error as { message?: string }).message ||
          'An error occurred during Google signup',
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
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
              <div className='relative'>
                <div className='text-8xl mb-4 animate-bounce'>🍿</div>
                <div className='absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping'></div>
                <div className='absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full'></div>
              </div>

              <div>
                <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight'>
                  Your Cinematic Journey
                  <span className='block'>Starts Here</span>
                </h2>
                <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed'>
                  Discover, track, and share your favorite movies and TV shows
                  with a community of film enthusiasts.
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
                      Unlimited Watchlists
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Create and organize your personal collections
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/50'>
                  <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center'>
                    <Star className='h-6 w-6 text-white' />
                  </div>
                  <div className='text-left'>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      Smart Recommendations
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Get personalized movie suggestions
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/50'>
                  <div className='w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center'>
                    <Users className='h-6 w-6 text-white' />
                  </div>
                  <div className='text-left'>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      Community Driven
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Connect with fellow movie lovers
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
                <div className='absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse'></div>
              </div>
              <h1 className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-800 dark:from-white dark:to-purple-200 bg-clip-text text-transparent mb-2'>
                Join the Cinema
              </h1>
              <p className='text-gray-600 dark:text-gray-400 text-sm'>
                Start your cinematic journey
              </p>
            </div>

            {/* Form Card */}
            <Card className='shadow p-5'>
              {errors.general && (
                <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center'>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='firstName'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      First Name
                    </Label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        id='firstName'
                        name='firstName'
                        type='text'
                        placeholder='John'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className='pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                      />
                      {errors.firstName && (
                        <div className='text-red-500 text-sm mt-1'>
                          {errors.firstName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='lastName'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Last Name
                    </Label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        id='lastName'
                        name='lastName'
                        type='text'
                        placeholder='Doe'
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className='pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                      />
                      {errors.lastName && (
                        <div className='text-red-500 text-sm mt-1'>
                          {errors.lastName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='email'
                    className='text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Email
                  </Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      placeholder='john@example.com'
                      value={formData.email}
                      onChange={handleInputChange}
                      className='pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    />
                    {errors.email && (
                      <div className='text-red-500 text-sm mt-1'>
                        {errors.email}
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='password'
                    className='text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Password
                  </Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <Input
                      id='password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Create a strong password'
                      value={formData.password}
                      onChange={handleInputChange}
                      className='pl-10 pr-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className='h-4 w-4 text-gray-400' />
                      ) : (
                        <Eye className='h-4 w-4 text-gray-400' />
                      )}
                    </Button>
                    {errors.password && (
                      <div className='text-red-500 text-sm mt-1'>
                        {errors.password}
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='confirmPassword'
                    className='text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Confirm Password
                  </Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <Input
                      id='confirmPassword'
                      name='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder='Confirm your password'
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className='pl-10 pr-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-4 w-4 text-gray-400' />
                      ) : (
                        <Eye className='h-4 w-4 text-gray-400' />
                      )}
                    </Button>
                    {errors.confirmPassword && (
                      <div className='text-red-500 text-sm mt-1'>
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type='submit'
                  className='w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium'
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <span className='w-full border-t border-gray-300 dark:border-gray-600' />
                  </div>
                  <div className='relative flex justify-center text-sm'>
                    <span className='px-2 bg-white dark:bg-gray-800 text-gray-500'>
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type='button'
                  variant='outline'
                  className='w-full h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                >
                  <svg className='w-4 h-4 mr-2' viewBox='0 0 24 24'>
                    <path
                      fill='currentColor'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='currentColor'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                  Continue with Google
                </Button>
              </form>

              <div className='text-center mt-6'>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  Already have an account?{' '}
                </span>
                <Link
                  href='/auth/login'
                  className='text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline'
                >
                  Sign in
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}
