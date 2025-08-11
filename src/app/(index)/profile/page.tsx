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
import { Badge } from '@/components/ui/badge'
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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/lib/store/authStore'
import { createClient } from '@/lib/supabase/client'
import {
  Bell,
  Calendar,
  Camera,
  ChevronRight,
  Download,
  Eye,
  Globe,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Palette,
  Shield,
  Sun,
  Trash2,
  User,
  UserCircle,
  Users,
} from 'lucide-react'
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

  // New state for enhanced features
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  })
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showWatchlist: false,
    showActivity: true,
  })
  const [theme, setTheme] = useState('system')

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
    <main className='min-h-screen p-5 lg:p-10 dark:bg-background space-y-5'>
      <header className='h-48 bg-gradient-to-r from-black via-black to-blue-600 rounded-2xl relative overflow-hidden'>
        <div className='absolute inset-0 bg-black/20' />
        <div className='absolute bottom-10 left-6 right-6'>
          <div className='flex items-center gap-6'>
            <div className='relative'>
              <Avatar className='h-24 w-24 shadow-xl'>
                {avatarUrl && (
                  <AvatarImage
                    src={avatarUrl || '/placeholder.svg'}
                    alt='User avatar'
                    className='object-cover object-top'
                  />
                )}
                <AvatarFallback className='text-2xl bg-white text-gray-900 font-bold'>
                  {getInitials(fullName, user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className='absolute -bottom-0 -right-0 bg-white rounded-full p-1 shadow-lg'>
                <Camera className='h-4 w-4 text-gray-600' />
              </div>
            </div>
            <div className='text-white space-y-1'>
              <h1 className='text-3xl font-bold'>{fullName || 'User'}</h1>
              <p className='text-white/90 flex items-center gap-2'>
                <Mail className='h-4 w-4' />
                {user?.email}
              </p>
              <p className='text-white/80 text-sm mt-1 flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Member since {new Date(userStats.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </header>

      <Tabs defaultValue='profile' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4 h-12'>
          <TabsTrigger value='profile' className='flex items-center gap-2'>
            <UserCircle className='w-4 h-4' />
            <span className='hidden sm:inline'>Profile</span>
          </TabsTrigger>
          <TabsTrigger value='preferences' className='flex items-center gap-2'>
            <Palette className='w-4 h-4' />
            <span className='hidden sm:inline'>Preferences</span>
          </TabsTrigger>
          <TabsTrigger value='privacy' className='flex items-center gap-2'>
            <Shield className='w-4 h-4' />
            <span className='hidden sm:inline'>Privacy</span>
          </TabsTrigger>
          <TabsTrigger value='settings' className='flex items-center gap-2'>
            <Lock className='w-4 h-4' />
            <span className='hidden sm:inline'>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value='profile'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2'>
              <Card className='shadow-lg'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your profile information and how others see you on
                    the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              <Card className='shadow-lg'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Users className='h-5 w-5' />
                    Social Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>
                      Followers
                    </span>
                    <Badge variant='secondary'>{userStats.followers}</Badge>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>
                      Following
                    </span>
                    <Badge variant='secondary'>{userStats.following}</Badge>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>
                      Total Hours
                    </span>
                    <Badge variant='outline'>{userStats.totalHours}h</Badge>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-muted-foreground'>
                      Favorite Genre
                    </span>
                    <Badge className='bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'>
                      {userStats.favoriteGenre}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className='shadow-lg'>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <Button variant='outline' className='w-full justify-between'>
                    <span className='flex items-center gap-2'>
                      <Download className='h-4 w-4' />
                      Export Data
                    </span>
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                  <Button variant='outline' className='w-full justify-between'>
                    <span className='flex items-center gap-2'>
                      <Eye className='h-4 w-4' />
                      View Public Profile
                    </span>
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='preferences'>
          <Card className='shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Palette className='h-5 w-5' />
                Appearance & Preferences
              </CardTitle>
              <CardDescription>
                Customize your viewing experience and app preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label className='flex items-center gap-2'>
                      <Sun className='h-4 w-4' />
                      Theme
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Choose your preferred theme
                    </p>
                  </div>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className='w-32'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='light'>Light</SelectItem>
                      <SelectItem value='dark'>Dark</SelectItem>
                      <SelectItem value='system'>System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='privacy'>
          <Card className='shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control who can see your information and activity.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label>Public Profile</Label>
                    <p className='text-sm text-muted-foreground'>
                      Allow others to view your profile
                    </p>
                  </div>
                  <Switch
                    checked={privacy.profilePublic}
                    onCheckedChange={(checked) =>
                      setPrivacy((prev) => ({
                        ...prev,
                        profilePublic: checked,
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label>Show Watchlist</Label>
                    <p className='text-sm text-muted-foreground'>
                      Let others see your watchlist
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showWatchlist}
                    onCheckedChange={(checked) =>
                      setPrivacy((prev) => ({
                        ...prev,
                        showWatchlist: checked,
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label>Show Activity</Label>
                    <p className='text-sm text-muted-foreground'>
                      Display your recent activity
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showActivity}
                    onCheckedChange={(checked) =>
                      setPrivacy((prev) => ({
                        ...prev,
                        showActivity: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings'>
          <div className='space-y-6'>
            <Card className='shadow-lg'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Bell className='h-5 w-5' />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label>Email Notifications</Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        email: checked,
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label>Push Notifications</Label>
                    <p className='text-sm text-muted-foreground'>
                      Get notified about new releases
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, push: checked }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label>Marketing Emails</Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive promotional content
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        marketing: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className='shadow-lg border-red-200 dark:border-red-800'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-red-600 dark:text-red-400'>
                  <Trash2 className='h-5 w-5' />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that will affect your account.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='destructive' className='w-full'>
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers including:
                        <ul className='list-disc list-inside mt-2 space-y-1'>
                          <li>Your profile information</li>
                          <li>Your watchlist and favorites</li>
                          <li>Your reviews and ratings</li>
                          <li>Your social connections</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete Account
                          </>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
