export default function PersonDetailsSkeleton() {
  return (
    <main className='min-h-screen -mt-16 bg-white dark:bg-slate-950'>
      {/* Hero Section Skeleton */}
      <div className='relative bg-slate-100 dark:bg-slate-800 pt-[7rem] border-b border-slate-200 dark:border-slate-800'>
        <div className='relative w-[90%] lg:w-[80%] mx-auto px-4 py-12'>
          <div className='flex flex-col lg:flex-row gap-8 lg:items-start items-center'>
            {/* Avatar Skeleton */}
            <div className='w-48 h-48 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse' />

            <div className='flex-1 w-full flex lg:justify-start lg:items-start flex-col justify-center items-center space-y-4'>
              <div className='space-y-3 w-full'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  {/* Name Skeleton */}
                  <div className='h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-3/4 lg:w-1/2' />
                  {/* Badges Skeleton */}
                  <div className='flex items-center gap-3'>
                    <div className='h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-24' />
                    <div className='h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-28' />
                  </div>
                </div>

                {/* Info Cards Skeleton */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 shadow-sm'>
                  <div className='relative space-y-2 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm'>
                    <div className='h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-20' />
                    <div className='h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-32 mt-2' />
                  </div>
                  <div className='relative space-y-2 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm'>
                    <div className='h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-24' />
                    <div className='h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-28 mt-2' />
                  </div>
                </div>
              </div>

              {/* Stats Cards Skeleton */}
              <div className='grid grid-cols-1 w-full lg:w-auto lg:grid-cols-3 gap-3'>
                <div className='flex items-start gap-2 p-3 bg-slate-200 dark:bg-slate-800 rounded-lg'>
                  <div className='w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse' />
                  <div className='space-y-1'>
                    <div className='h-3 bg-slate-300 dark:bg-slate-600 rounded animate-pulse w-12' />
                    <div className='h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse w-16' />
                  </div>
                </div>
                <div className='flex items-start gap-2 p-3 bg-slate-200 dark:bg-slate-800 rounded-lg'>
                  <div className='w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse' />
                  <div className='space-y-1'>
                    <div className='h-3 bg-slate-300 dark:bg-slate-600 rounded animate-pulse w-14' />
                    <div className='h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse w-20' />
                  </div>
                </div>
                <div className='flex items-start gap-2 p-3 bg-slate-200 dark:bg-slate-800 rounded-lg'>
                  <div className='w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse' />
                  <div className='space-y-1'>
                    <div className='h-3 bg-slate-300 dark:bg-slate-600 rounded animate-pulse w-20' />
                    <div className='h-4 bg-slate-300 dark:bg-slate-600 rounded animate-pulse w-18' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs Skeleton */}
      <div className='lg:w-[80%] w-full mx-auto px-4 py-8'>
        <div className='space-y-8'>
          {/* Tabs List Skeleton */}
          <div className='flex gap-2'>
            <div className='h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-24' />
            <div className='h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-20' />
            <div className='h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-24' />
            <div className='h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-28' />
          </div>

          {/* Content Skeleton */}
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div className='h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-48' />
              <div className='h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse w-20' />
            </div>

            {/* Cards Grid Skeleton */}
            <div className='grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 3xl:grid-cols-5 gap-5'>
              {Array.from({ length: 15 }).map((_, index) => (
                <div key={index} className='space-y-3'>
                  {/* Image Skeleton */}
                  <div className='relative mb-3 overflow-hidden rounded-lg'>
                    <div className='w-full h-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse' />
                  </div>
                  {/* Content Skeleton */}
                  <div className='space-y-1'>
                    <div className='h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4' />
                    <div className='flex justify-between'>
                      <div className='h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-12' />
                      <div className='h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
