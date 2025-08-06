'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/lib/store/authStore'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Shield, UserCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'

export default function ProfilePage() {
  const { user, clearUser } = useAuthStore()
  const router = useRouter()
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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
        // 5MB limit
        toast.error('File size should be less than 5MB')
        return
      }
      setAvatarFile(file)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.rpc('delete_user')
      if (error) throw error

      await supabase.auth.signOut()
      clearUser()
      router.push('/')
      toast.success('Account deleted successfully')
    } catch (error) {
      toast.error('Failed to delete account')
      console.error('Delete account error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='container mx-auto p-4 max-w-4xl'>
      <Tabs defaultValue='profile' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='profile' className='flex items-center gap-2'>
            <UserCircle className='w-4 h-4' />
            Profile Information
          </TabsTrigger>
          <TabsTrigger value='settings' className='flex items-center gap-2'>
            <Shield className='w-4 h-4' />
            Account Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value='profile'>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and how others see you on the
                platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-6 mb-8'>
                <Avatar className='h-24 w-24'>
                  {avatarUrl && (
                    <AvatarImage
                      src={avatarUrl}
                      alt='User avatar'
                      className='object-cover object-top'
                    />
                  )}
                  <AvatarFallback className='text-2xl'>
                    {getInitials(fullName, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className='text-2xl font-semibold'>
                    {fullName || 'User'}
                  </h2>
                  <p className='text-sm text-muted-foreground'>{user?.email}</p>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Member since{' '}
                    {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>

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
                        className='cursor-pointer'
                      />
                      {avatarFile && (
                        <p className='text-sm text-muted-foreground'>
                          Selected: {avatarFile.name}
                        </p>
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
                    <Label htmlFor='location'>Location</Label>
                    <Input
                      id='location'
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder='Enter your location'
                      disabled={isUpdating}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='language'>Preferred Language</Label>
                    <Select
                      value={preferredLanguage}
                      onValueChange={setPreferredLanguage}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select language' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='en'>English</SelectItem>
                        <SelectItem value='es'>Spanish</SelectItem>
                        <SelectItem value='fr'>French</SelectItem>
                        <SelectItem value='de'>German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2 md:col-span-2'>
                    <Label htmlFor='bio'>Bio</Label>
                    <Textarea
                      id='bio'
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder='Tell us about yourself'
                      disabled={isUpdating}
                      className='min-h-[120px] resize-vertical'
                    />
                  </div>
                </div>

                <Button
                  type='submit'
                  disabled={isUpdating}
                  className='w-full cursor-pointer'
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings'>
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Account Actions</h3>
                <div className='space-y-4'>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='destructive' className='w-full'>
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove all your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className='bg-destructive text-destructive-foreground'
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                              Deleting...
                            </>
                          ) : (
                            'Delete Account'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
