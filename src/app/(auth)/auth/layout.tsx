// This is a full root layout, not just a section wrapper
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Login | BingeBook',
  description: 'Sign in to your BingeBook account',
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className=''>{children}</main>
}
