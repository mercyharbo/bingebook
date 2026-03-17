import Image from 'next/image'
import Link from 'next/link'

export default function CastTab({ cast }: { cast: any[] }) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6'>
      {cast.map((actor) => (
        <Link key={actor.id} href={`/person/${actor.id}`} className='group cursor-pointer'>
          <div className='relative aspect-[2/3] overflow-hidden rounded-lg shadow-xl transition-all group-hover:shadow-primary/20 group-hover:shadow-2xl mb-4 border border-white/5'>
            <Image
              src={
                actor.profile_path
                  ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                  : '/avatar.jpg'
              }
              alt={actor.name}
              fill
              className='object-cover transition-transform duration-500 group-hover:scale-110'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
          </div>
          <h4 className='font-medium text-lg truncate group-hover:text-primary transition-colors'>
            {actor.name}
          </h4>
          <p className='text-sm text-white/40 truncate font-medium'>
            {actor.character}
          </p>
        </Link>
      ))}
    </div>
  )
}
