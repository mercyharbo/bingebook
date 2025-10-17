'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/lib/store/authStore'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar,
  Camera,
  Globe,
  Loader2,
  Mail,
  MapPin,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const supabase = createClient()

  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  )
  const [avatarUrl, setAvatarUrl] = useState(
    user?.user_metadata?.avatar_url || ''
  )
  const [bio, setBio] = useState(user?.user_metadata?.bio || '')
  const [location, setLocation] = useState(user?.user_metadata?.location || '')
  const [preferredLanguage, setPreferredLanguage] = useState(
    user?.user_metadata?.preferred_language || 'en'
  )
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Mock user stats
  const userStats = {
    moviesWatched: 127,
    tvShowsWatched: 43,
    totalHours: 284,
    favoriteGenre: 'Action',
    joinDate: user?.created_at || new Date().toISOString(),
    watchlistItems: 23,
    reviews: 8,
    followers: 156,
    following: 89,
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const names = name.split(' ')
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase()
    }
    return email ? email[0].toUpperCase() : 'U'
  }

  const uploadAvatar = async (file: File) => {
    try {
      if (!user) throw new Error('User not authenticated')

      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      let newAvatarUrl = avatarUrl
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar(avatarFile)
      }

      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: newAvatarUrl,
          bio,
          location,
          preferred_language: preferredLanguage,
          updated_at: new Date().toISOString(),
        },
      })

      if (error) throw error

      useAuthStore.getState().setUser(data.user)
      setAvatarUrl(newAvatarUrl)
      setAvatarFile(null)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
      console.error('Update profile error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        return
      }
      setAvatarFile(file)
    }
  }

  return (
    <main className='min-h-screen flex flex-col gap-5 pb-8 dark:bg-background'>
      <header className='relative bg-white dark:bg-gray-900'>
        <div className='container mx-auto px-4 py-8 grid place-items-center'>
          <div className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <Avatar className='h-28 w-28 ring-4 ring-white dark:ring-gray-800 shadow-xl'>
                {avatarUrl && (
                  <AvatarImage
                    src={avatarUrl || '/placeholder.svg'}
                    alt='User avatar'
                    className='object-cover object-top'
                  />
                )}
                <AvatarFallback className='text-3xl bg-gray-500 text-white font-bold'>
                  {getInitials(fullName, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className='absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg ring-2 ring-white dark:ring-gray-800'>
                <Camera className='h-4 w-4 text-gray-600 dark:text-gray-400' />
              </div>
            </div>
            <div className='space-y-3 text-center'>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                {fullName || 'User'}
              </h1>
              <div className='flex flex-col sm:flex-row items-center gap-1 lg:gap-4 text-gray-600 dark:text-gray-400'>
                <span className='flex items-center gap-2'>
                  <Mail className='h-4 w-4' />
                  {user?.email}
                </span>
                <span className='hidden sm:inline text-gray-300 dark:text-gray-600'>
                  •
                </span>
                <span className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  Member since{' '}
                  {new Date(userStats.joinDate).toLocaleDateString()}
                </span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className='mt-4'>
                    <User className='mr-2 h-4 w-4' />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-[600px]'>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information and how others see you on
                      the platform.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateProfile} className='space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div className='space-y-2'>
                        <Label htmlFor='fullName'>Full Name</Label>
                        <Input
                          id='fullName'
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder='Enter your full name'
                          disabled={isUpdating}
                          className='h-11'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='avatar'>Profile Picture</Label>
                        <div className='space-y-2'>
                          <Input
                            id='avatar'
                            type='file'
                            accept='image/*'
                            onChange={handleAvatarChange}
                            disabled={isUpdating || isUploading}
                            className='cursor-pointer h-11'
                          />
                          {avatarFile && (
                            <div className='flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                              <Camera className='h-4 w-4 text-blue-600' />
                              <p className='text-sm text-blue-600'>
                                Selected: {avatarFile.name}
                              </p>
                            </div>
                          )}
                          {isUploading && (
                            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                              <Loader2 className='h-4 w-4 animate-spin' />
                              Uploading...
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label
                          htmlFor='location'
                          className='flex items-center gap-2'
                        >
                          <MapPin className='h-4 w-4' />
                          Location
                        </Label>
                        <Input
                          id='location'
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder='Enter your location'
                          disabled={isUpdating}
                          className='h-11'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label
                          htmlFor='language'
                          className='flex items-center gap-2'
                        >
                          <Globe className='h-4 w-4' />
                          Preferred Language
                        </Label>
                        <Select
                          value={preferredLanguage}
                          onValueChange={setPreferredLanguage}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className='w-full h-11'>
                            <SelectValue placeholder='Select language' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='en'>🇺🇸 English</SelectItem>
                            <SelectItem value='es'>🇪🇸 Spanish</SelectItem>
                            <SelectItem value='fr'>🇫🇷 French</SelectItem>
                            <SelectItem value='de'>🇩🇪 German</SelectItem>
                            <SelectItem value='it'>🇮🇹 Italian</SelectItem>
                            <SelectItem value='pt'>🇵🇹 Portuguese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2 md:col-span-2'>
                        <Label htmlFor='bio'>Bio</Label>
                        <Textarea
                          id='bio'
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder='Tell us about yourself and your favorite movies/shows...'
                          disabled={isUpdating}
                          className='min-h-[120px] resize-vertical'
                        />
                        <p className='text-xs text-muted-foreground'>
                          {bio.length}/500 characters
                        </p>
                      </div>
                    </div>

                    <Button
                      type='submit'
                      disabled={isUpdating}
                      className='w-full h-12'
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Updating Profile...
                        </>
                      ) : (
                        <>
                          <User className='mr-2 h-4 w-4' />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <Separator />

      <div className='container mx-auto space-y-5 px-5'>
        <div className='grid grid-cols-1 gap-6'>
          <Card className='overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm'>
            <CardHeader className='border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50'>
              <CardTitle className='flex items-center gap-2 text-gray-900 dark:text-white'>
                <User className='h-5 w-5' />
                Profile Information
              </CardTitle>
              <CardDescription className='text-gray-600 dark:text-gray-400'>
                Your profile details and information.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label>Full Name</Label>
                  <p className='text-sm text-gray-900 dark:text-white font-medium'>
                    {fullName || 'Not set'}
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label>Location</Label>
                  <p className='text-sm text-gray-900 dark:text-white font-medium flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    {location || 'Not set'}
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label>Preferred Language</Label>
                  <p className='text-sm text-gray-900 dark:text-white font-medium flex items-center gap-2'>
                    <Globe className='h-4 w-4' />
                    {preferredLanguage === 'en'
                      ? '🇺🇸 English'
                      : preferredLanguage === 'es'
                      ? '🇪🇸 Spanish'
                      : preferredLanguage === 'fr'
                      ? '🇫🇷 French'
                      : preferredLanguage === 'de'
                      ? '🇩🇪 German'
                      : preferredLanguage === 'it'
                      ? '🇮🇹 Italian'
                      : preferredLanguage === 'pt'
                      ? '🇵🇹 Portuguese'
                      : 'English'}
                  </p>
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label>Bio</Label>
                  <p className='text-sm text-gray-900 dark:text-white font-medium'>
                    {bio || 'No bio added yet.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
