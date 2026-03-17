import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Play } from 'lucide-react'

interface TrailerDialogProps {
  trailerKey: string
  trailerName: string
}

export default function TrailerDialog({ trailerKey, trailerName }: TrailerDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size='lg'
          className='bg-white text-black hover:bg-white/90 h-12 px-8 transition-all hover:scale-105 active:scale-95'
        >
          <Play className='h-6 w-6 mr-2 fill-current' />
          Watch Trailer
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-[90vw] lg:max-w-4xl bg-black/90 backdrop-blur-3xl border-white/10 p-1 rounded-lg overflow-hidden'>
        <div className='aspect-video'>
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
            title={trailerName}
            className='w-full h-full'
            allow='autoplay'
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
