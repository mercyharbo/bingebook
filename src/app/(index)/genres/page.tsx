'use client'

import { Card } from '@/components/ui/card'
import { useDiscoverStore } from '@/lib/store/discoverStore'
import {
  Crosshair,
  Film,
  Ghost,
  Heart,
  Landmark,
  Monitor,
  Music,
  Search,
  Star,
  Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const movieGenres = [
  {
    id: 28,
    name: 'Action',
    icon: Zap,
    color: 'from-orange-500/20 to-red-500/20',
  },
  {
    id: 12,
    name: 'Adventure',
    icon: Compass,
    color: 'from-green-500/20 to-emerald-500/20',
  },
  {
    id: 16,
    name: 'Animation',
    icon: Star,
    color: 'from-blue-400/20 to-indigo-400/20',
  },
  {
    id: 35,
    name: 'Comedy',
    icon: Laugh,
    color: 'from-yellow-400/20 to-orange-400/20',
  },
  {
    id: 80,
    name: 'Crime',
    icon: Shield,
    color: 'from-gray-700/20 to-slate-900/20',
  },
  {
    id: 99,
    name: 'Documentary',
    icon: Landmark,
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 18,
    name: 'Drama',
    icon: Heart,
    color: 'from-pink-500/20 to-rose-500/20',
  },
  {
    id: 10751,
    name: 'Family',
    icon: Smile,
    color: 'from-green-400/20 to-lime-400/20',
  },
  {
    id: 14,
    name: 'Fantasy',
    icon: Cloud,
    color: 'from-purple-500/20 to-indigo-500/20',
  },
  {
    id: 27,
    name: 'Horror',
    icon: Ghost,
    color: 'from-red-900/20 to-gray-900/20',
  },
  {
    id: 10402,
    name: 'Music',
    icon: Music,
    color: 'from-purple-400/20 to-pink-400/20',
  },
  {
    id: 9648,
    name: 'Mystery',
    icon: Search,
    color: 'from-slate-500/20 to-gray-700/20',
  },
  {
    id: 10749,
    name: 'Romance',
    icon: Heart,
    color: 'from-red-400/20 to-pink-400/20',
  },
  {
    id: 878,
    name: 'Science Fiction',
    icon: Rocket,
    color: 'from-blue-600/20 to-purple-600/20',
  },
  {
    id: 53,
    name: 'Thriller',
    icon: Crosshair,
    color: 'from-orange-600/20 to-red-600/20',
  },
  {
    id: 10752,
    name: 'War',
    icon: Sword,
    color: 'from-stone-600/20 to-gray-800/20',
  },
  {
    id: 37,
    name: 'Western',
    icon: Sun,
    color: 'from-amber-600/20 to-orange-700/20',
  },
]

import {
  Cloud,
  Compass,
  Laugh,
  Rocket,
  Shield,
  Smile,
  Sun,
  Sword,
} from 'lucide-react'

export default function GenresPage() {
  const router = useRouter()
  const { setSelectedGenres, setMediaType } = useDiscoverStore()

  const handleGenreClick = (genreId: number, type: 'movie' | 'tv') => {
    setMediaType(type)
    setSelectedGenres([genreId.toString()])
    router.push('/discover')
  }

  return (
    <main className='flex flex-col min-h-screen bg-gradient-premium overflow-x-hidden'>
      <div className='flex flex-col gap-12 px-6 py-12 lg:px-12'>
        <header className='space-y-2'>
          <h1 className='text-4xl font-bold text-glow'>Browse by Genre</h1>
          <p className='text-muted-foreground font-medium text-lg max-w-2xl'>
            Find exactly what you&apos;re in the mood for. Explore our curated
            collections cross movies and TV shows.
          </p>
        </header>

        <section className='space-y-8'>
          <div className='flex items-center gap-3'>
            <Film className='size-6 text-primary' />
            <h2 className='text-2xl font-medium'>Movies</h2>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
            {movieGenres.map((genre) => (
              <Card
                key={genre.id}
                onClick={() => handleGenreClick(genre.id, 'movie')}
                className={`group relative h-32 overflow-hidden border-white/5 bg-gradient-to-br ${genre.color} cursor-pointer transition-all hover:scale-[1.02] hover:border-primary/50 active:scale-95 glass-dark`}
              >
                <div className='absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors' />
                <div className='relative h-full p-6 flex flex-col justify-between items-start'>
                  <div className='bg-white/10 p-2 rounded-lg backdrop-blur-md group-hover:bg-primary/20 transition-colors'>
                    <genre.icon className='size-5 text-white/80 group-hover:text-primary transition-colors' />
                  </div>
                  <span className='font-medium text-lg'>{genre.name}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className='space-y-8 pt-12'>
          <div className='flex items-center gap-3'>
            <Monitor className='size-6 text-primary' />
            <h2 className='text-2xl font-medium'>TV Shows</h2>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
            {/* Using a mix for TV shows to keep it interesting */}
            {[
              ...movieGenres.slice(0, 10),
              {
                id: 10759,
                name: 'Action & Adventure',
                icon: Zap,
                color: 'from-orange-500/20 to-red-500/20',
              },
            ].map((genre) => (
              <Card
                key={`tv-${genre.id}`}
                onClick={() => handleGenreClick(genre.id, 'tv')}
                className={`group relative h-32 overflow-hidden border-white/5 bg-gradient-to-br ${genre.color} cursor-pointer transition-all hover:scale-[1.02] hover:border-primary/50 active:scale-95 glass-dark`}
              >
                <div className='absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors' />
                <div className='relative h-full p-6 flex flex-col justify-between items-start'>
                  <div className='bg-white/10 p-2 rounded-lg backdrop-blur-md group-hover:bg-primary/20 transition-colors'>
                    <genre.icon className='size-5 text-white/80 group-hover:text-primary transition-colors' />
                  </div>
                  <span className='font-medium text-lg'>{genre.name}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
