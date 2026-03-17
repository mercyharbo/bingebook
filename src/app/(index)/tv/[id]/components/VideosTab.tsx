type Video = {
  id: string
  key: string
  name: string
  type: string
}

export default function VideosTab({ trailers }: { trailers: Video[] }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
      {trailers.map((video) => (
        <div key={video.id} className='group space-y-4'>
          <div className='aspect-video bg-white/5 rounded-lg border border-white/10 overflow-hidden relative shadow-xl'>
            <iframe
              src={`https://www.youtube.com/embed/${video.key}`}
              title={video.name}
              className='w-full h-full'
              allowFullScreen
            />
          </div>
          <div className='px-2'>
            <h4 className='font-medium text-lg group-hover:text-primary transition-colors'>
              {video.name}
            </h4>
            <p className='text-sm text-white/40 font-medium'>{video.type}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
