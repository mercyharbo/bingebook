import Image from 'next/image'
import { Badge } from '@/components/ui/badge'

export default function ReviewsTab({ movieReviews }: { movieReviews: any[] }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {movieReviews.slice(0, 6).map((review) => (
        <div
          key={review.id}
          className='p-8 rounded-lg glass-dark border border-white/5 space-y-6 shadow-xl'
        >
          <div className='flex items-center gap-4'>
            <div className='size-12 relative overflow-hidden rounded-full ring-2 ring-primary/20'>
              <Image
                src={
                  review.author_details.avatar_path
                    ? `https://image.tmdb.org/t/p/w185${review.author_details.avatar_path}`
                    : '/avatar.jpg'
                }
                alt={review.author}
                fill
                className='object-cover'
              />
            </div>
            <div>
              <h4 className='font-medium text-lg'>{review.author}</h4>
              <div className='flex items-center gap-2'>
                {review.author_details.rating && (
                  <Badge className='bg-yellow-400/20 text-yellow-400 border-none px-2 py-0 h-5 text-[10px] font-bold'>
                    {review.author_details.rating}/10
                  </Badge>
                )}
                <span className='text-white/40 text-xs font-medium'>
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <p className='text-gray-300 text-sm line-clamp-6'>
            "{review.content}"
          </p>
        </div>
      ))}
    </div>
  )
}
