'use client'

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
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Eye, EyeOff, Film, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import * as Yup from 'yup'

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
        router.push('/')
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
    <main className='min-h-screen flex'>
      {/* Left Side - Hero Image */}
      <section className='hidden lg:flex flex-1 relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'>
        <Button
          variant='secondary'
          size='sm'
          onClick={() => router.back()}
          className='absolute top-4 left-4 lg:top-8 lg:left-8'
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>

        <div className='absolute inset-0 bg-black/20' />
        <div className='relative z-10 flex flex-col justify-center items-center text-white p-12 text-center'>
          <div className='space-y-6 max-w-md'>
            <div className='text-6xl'>🍿</div>
            <h2 className='text-4xl font-bold leading-tight'>
              Start Your Entertainment Journey
            </h2>
            <p className='text-xl text-white/90 leading-relaxed'>
              Join millions of movie lovers. Create your watchlist, discover new
              favorites, and never miss a great show again.
            </p>
            <div className='grid grid-cols-2 gap-4'>
              <div className='text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg'>
                <div className='text-2xl font-bold'>Free</div>
                <div className='text-sm text-white/80'>Forever</div>
              </div>
              <div className='text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg'>
                <div className='text-2xl font-bold'>Unlimited</div>
                <div className='text-sm text-white/80'>Watchlists</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className='absolute top-16 right-16 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl'>
          🎭
        </div>
        <div className='absolute bottom-16 left-30 w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl'>
          🎪
        </div>
        <div className='absolute top-1/4 left-8 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-xl'>
          🎨
        </div>
      </section>

      {/* Right Side - Form */}
      <div className='flex-1 flex items-center justify-center p-5 lg:p-0 bg-background'>
        <div className='w-full space-y-8'>
          {/* Header */}
          <div className='text-center space-y-2'>
            <div className='flex items-center justify-center gap-1'>
              <div className='bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg'>
                <Film className='h-6 w-6 text-white' />
              </div>
              <span className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                BingeBook
              </span>
            </div>
          </div>

          <Card className='border-0 shadow-none bg-transparent space-y-5'>
            <CardHeader className='space-y-1 justify-start items-start gap-1'>
              <CardTitle className='text-2xl'>Sign Up</CardTitle>
              <CardDescription className=''>
                Create your account to get started
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {errors.general && (
                <div className='text-red-500 text-sm text-center'>
                  {errors.general}
                </div>
              )}
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='firstName'>First Name</Label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='firstName'
                        name='firstName'
                        type='text'
                        placeholder='John'
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className='pl-10'
                      />
                      {errors.firstName && (
                        <div className='text-red-500 text-sm'>
                          {errors.firstName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='lastName'>Last Name</Label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='lastName'
                        name='lastName'
                        type='text'
                        placeholder='Doe'
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className='pl-10'
                      />
                      {errors.lastName && (
                        <div className='text-red-500 text-sm'>
                          {errors.lastName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      placeholder='john@example.com'
                      value={formData.email}
                      onChange={handleInputChange}
                      className='pl-10'
                    />
                    {errors.email && (
                      <div className='text-red-500 text-sm'>{errors.email}</div>
                    )}
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
                      placeholder='Create a strong password'
                      value={formData.password}
                      onChange={handleInputChange}
                      className='pl-10 pr-10'
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
                    {errors.password && (
                      <div className='text-red-500 text-sm'>
                        {errors.password}
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>Confirm Password</Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                      id='confirmPassword'
                      name='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder='Confirm your password'
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className='pl-10 pr-10'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-4 w-4 text-muted-foreground' />
                      ) : (
                        <Eye className='h-4 w-4 text-muted-foreground' />
                      )}
                    </Button>
                    {errors.confirmPassword && (
                      <div className='text-red-500 text-sm'>
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                </div>

                {errors.acceptTerms && (
                  <div className='text-red-500 text-sm'>
                    {errors.acceptTerms}
                  </div>
                )}

                <Button
                  type='submit'
                  variant={'default'}
                  className='w-full h-12 bg-blue-600 hover:bg-blue-500 text-white '
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  className='w-full h-12'
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                >
                  Sign up with Google
                </Button>
              </form>

              <div className='text-center text-sm'>
                <span className='text-muted-foreground'>
                  Already have an account?{' '}
                </span>
                <Link
                  href='/auth/login'
                  className='text-purple-600 hover:text-purple-500 hover:underline font-medium'
                >
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
