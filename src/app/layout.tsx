import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FPL Analytics',
  description: 'Football data and FPL analytics platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-slate-800 text-white p-4">
          <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              FPL Analytics
            </Link>
            <div className="space-x-4">
              <Link href="/matches" className="hover:text-slate-300">
                Matches
              </Link>
              <Link href="/teams" className="hover:text-slate-300">
                Teams
              </Link>
              <Link href="/players" className="hover:text-slate-300">
                Players
              </Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto py-8">
          {children}
        </main>
      </body>
    </html>
  )
} 