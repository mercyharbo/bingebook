import TvShowDetailsComp from '@/app/(index)/tv/[id]/TvShowDetailsComp'
import { fetcher } from '@/lib/utils'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const tvShow = await fetcher(
      `${process.env.NEXT_PUBLIC_BASE_URL}/tv/${id}?language=en-US`
    )

    const description = tvShow.overview
      ? tvShow.overview.slice(0, 160) +
        (tvShow.overview.length > 160 ? '...' : '')
      : `Watch ${tvShow.name}, a ${tvShow.genres
          ?.map((g: { name: string }) => g.name)
          .join(', ')} TV series. ${tvShow.number_of_seasons} seasons, ${
          tvShow.number_of_episodes
        } episodes.`

    return {
      title: `${tvShow.name} (TV Series ${new Date(
        tvShow.first_air_date
      ).getFullYear()}) - Episodes & Info`,
      description,
      openGraph: {
        title: `${tvShow.name} (TV Series ${new Date(
          tvShow.first_air_date
        ).getFullYear()})`,
        description,
        images: tvShow.backdrop_path
          ? [
              {
                url: `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`,
                width: 1280,
                height: 720,
                alt: tvShow.name,
              },
              {
                url: `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`,
                width: 500,
                height: 750,
                alt: `${tvShow.name} Poster`,
              },
            ]
          : [],
        type: 'video.tv_show',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${tvShow.name} (TV Series ${new Date(
          tvShow.first_air_date
        ).getFullYear()})`,
        description,
        images: tvShow.backdrop_path
          ? [`https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`]
          : [],
      },
    }
  } catch (error) {
    console.log(error)
    return {
      title: 'TV Show Details',
      description:
        'View detailed information about TV shows, including episodes, cast, ratings, and more.',
    }
  }
}

export default async function TVShowDetails({ params }: Props) {
  const { id } = await params

  return <TvShowDetailsComp tvId={id} />
}
