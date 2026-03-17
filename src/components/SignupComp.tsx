'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
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
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
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
          'Account created successfully! Please check your email to verify your account.',
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
    <main className='min-h-screen bg-background relative flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <Card className='glass-dark p-6 sm:p-8 border-white/10'>
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
                <button
                  type='button'
                  className='absolute right-0 top-0 h-full px-3 py-2'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
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
                <button
                  type='button'
                  className='absolute right-0 top-0 h-full px-3 py-2'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
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
              {isLoading ? (
                <span className='flex items-center justify-center gap-2'>
                  <LoadingSpinner size={18} color='text-white' />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t border-gray-300 dark:border-gray-600' />
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-300'>
                  Or
                </span>
              </div>
            </div>

            <Button
              type='button'
              variant='outline'
              className='w-full h-11 bg-white dark:bg-input/30 text-black dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <svg className='w-4 h-4 mr-2' viewBox='0 0 24 24'>
                <path
                  fill='#4285F4'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                />
                <path
                  fill='#34A853'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='#FBBC05'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                />
                <path
                  fill='#EA4335'
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
    </main>
  )
}
