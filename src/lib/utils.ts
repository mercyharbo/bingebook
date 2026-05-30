import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const getServerBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.APP_URL) return process.env.APP_URL
  return 'http://localhost:3000'
}

export const fetcher = async (url: string) => {
  const requestUrl =
    typeof window === 'undefined' && url.startsWith('/')
      ? `${getServerBaseUrl()}${url}`
      : url

  const res = await fetch(requestUrl)

  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}
