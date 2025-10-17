import MovieDetailsComp from '@/app/(index)/movie/[id]/MovieDetailsComp'
import { fetcher } from '@/lib/utils'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const movie = await fetcher(
      `${process.env.NEXT_PUBLIC_BASE_URL}/movie/${id}?language=en-US`
    )

    const description = movie.overview
      ? movie.overview.slice(0, 160) +
        (movie.overview.length > 160 ? '...' : '')
      : `Watch ${movie.title} (${new Date(
          movie.release_date
        ).getFullYear()}), a ${movie.genres
          ?.map((g: { name: string }) => g.name)
          .join(', ')} movie. Runtime: ${movie.runtime} minutes.`

    const releaseYear = new Date(movie.release_date).getFullYear()
    const formattedTitle = `${movie.title}${
      movie.title.includes(releaseYear.toString()) ? '' : ` (${releaseYear})`
    }`

    return {
      title: `${formattedTitle} - Movie Details & Reviews`,
      description,
      openGraph: {
        title: formattedTitle,
        description,
        images: [
          movie.backdrop_path && {
            url: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
            width: 1280,
            height: 720,
            alt: movie.title,
          },
          movie.poster_path && {
            url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            width: 500,
            height: 750,
            alt: `${movie.title} Poster`,
          },
        ].filter(Boolean),
        type: 'video.movie',
        releaseDate: movie.release_date,
      },
      twitter: {
        card: 'summary_large_image',
        title: formattedTitle,
        description,
        images: movie.backdrop_path
          ? [`https://image.tmdb.org/t/p/original${movie.backdrop_path}`]
          : [],
      },
    }
  } catch (error) {
    console.log(error)
    return {
      title: 'Movie Details',
      description:
        'View detailed information about movies, including cast, ratings, reviews, and more.',
    }
  }
}

export default async function MovieDetails({ params }: Props) {
  const { id } = await params

  return <MovieDetailsComp movieId={id} />
}
