import PersonDetailsContent from '@/components/PersonDetailsComp'
import { fetcher } from '@/lib/utils'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const person = await fetcher(
      `${process.env.NEXT_PUBLIC_BASE_URL}/person/${id}?language=en-US`
    )

    const description = person.biography
      ? person.biography.slice(0, 160)
      : `Discover ${person.name}, known for ${person.known_for_department}. View their movies, TV shows, and upcoming projects.`

    return {
      title: `${person.name} - Biography, Movies & TV Shows`,
      description,
      openGraph: {
        title: `${person.name} - Biography, Movies & TV Shows`,
        description,
        images: person.profile_path
          ? [`https://image.tmdb.org/t/p/w500${person.profile_path}`]
          : [],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${person.name} - Biography, Movies & TV Shows`,
        description,
        images: person.profile_path
          ? [`https://image.tmdb.org/t/p/w500${person.profile_path}`]
          : [],
      },
    }
  } catch (error) {
    console.log(error)
    return {
      title: 'Person Details',
      description:
        'View detailed information about your favorite celebrities, including their biography, movies, and TV shows.',
    }
  }
}

export default async function PersonDetailsPage({ params }: Props) {
  const { id } = await params

  return <PersonDetailsContent personId={id} />
}
