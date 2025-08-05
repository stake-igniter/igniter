import type { Metadata } from 'next'
import Hero from "./components/Hero";
import About from "./components/About";
import EmptySpace from "./components/EmptySpace";
import { GetAppName } from '@/actions/ApplicationSettings'

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Home - ${appName}`,
    description: `Light up your earnings with ${appName}`,
  }
}

export default function Landing() {
    return (
        <>
          <Hero />
          <About />
          <EmptySpace />
        </>
    );
}
