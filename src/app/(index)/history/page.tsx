'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { History, Trash2, Clock, Trash } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import EmptyState from '@/components/WatchlistEmptyState'

// Mock history data for UI demonstration
const mockHistory = [
  {
    id: 1,
    title: 'Interstellar',
    media_type: 'movie',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlSaba7.jpg',
    viewed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    genre: 'Sci-Fi'
  },
  {
    id: 2,
    title: 'The Dark Knight',
    media_type: 'movie',
    poster_path: '/qJ2tW6WMUDp9QmSJJVI9pU7BrTM.jpg',
    viewed_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    genre: 'Action'
  },
  {
    id: 3,
    title: 'Better Call Saul',
    media_type: 'tv',
    poster_path: '/fC2S3Basefv1Z97p9Z2zJu97Yp4.jpg',
    viewed_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    genre: 'Drama'
  }
]

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState(mockHistory)

  const clearHistory = () => {
    setHistoryItems([])
  }

  const removeItem = (id: number) => {
    setHistoryItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-premium overflow-x-hidden">
      <div className="flex flex-col gap-8 px-6 py-12 lg:px-12">
        <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center w-full gap-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-glow">
              History
            </h1>
            <p className="text-muted-foreground font-medium max-w-lg">
              Shows and movies you've recently viewed or interacted with.
            </p>
          </div>

          {historyItems.length > 0 && (
            <Button
              variant="destructive"
              size="lg"
              onClick={clearHistory}
              className="rounded-xl shadow-lg shadow-destructive/20 gap-2"
            >
              <Trash2 className="size-4" />
              Clear History
            </Button>
          )}
        </header>

        {historyItems.length === 0 ? (
          <div className="py-20">
            <EmptyState 
              // Customizing empty state for history
            />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" />
              <span className="text-sm font-medium">Recorded activity from the last 30 days</span>
            </div>

            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex items-center gap-4 p-4 rounded-lg glass-dark border border-white/5 hover:border-primary/30 transition-all hover:translate-x-1"
                >
                  <div className="relative h-24 aspect-[2/3] overflow-hidden rounded-xl shadow-lg">
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-base truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="size-8 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <Trash className="size-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                      <Badge className="bg-primary/20 text-primary-foreground text-[9px] border-none px-1.5 py-0">
                        {item.media_type === 'movie' ? 'Movie' : 'TV'}
                      </Badge>
                      <span>•</span>
                      <span>{item.genre}</span>
                    </div>

                    <p className="text-[10px] text-muted-foreground/60 italic pt-1">
                      Viewed {new Date(item.viewed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
