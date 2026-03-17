import { Star } from 'lucide-react'
import Image from 'next/image'

export default function ReviewsTab({ tvReviews }: { tvReviews: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {tvReviews.slice(0, 4).map(review => (
        <div key={review.id} className="glass-dark p-8 rounded-lg border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5"><Star className="size-24 text-primary" /></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="size-12 rounded-full overflow-hidden ring-2 ring-primary/20 relative">
              <Image 
                src={review.author_details.avatar_path ? `https://image.tmdb.org/t/p/w185${review.author_details.avatar_path}` : '/avatar.jpg'} 
                alt={review.author} 
                fill
                className='object-cover'
              />
            </div>
            <div>
              <h4 className="font-medium text-lg">{review.author}</h4>
              <span className="text-xs text-white/40">{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed italic line-clamp-6 ">"{review.content}"</p>
        </div>
      ))}
    </div>
  )
}
