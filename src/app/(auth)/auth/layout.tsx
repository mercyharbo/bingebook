import type { ReactNode } from 'react'

export const metadata = {
  title: 'Login | ShowTrackr',
  description: 'Sign in to your ShowTrackr account',
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className=''>{children}</main>
}
