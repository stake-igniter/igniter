import type { Metadata } from 'next'
import { GetAppName } from '@/actions/ApplicationSettings'
import SettingsForm from '@/app/admin/(internal)/settings/Form'

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Settings - ${appName}`,
  }
}

export default function SettingsPage() {
  return (
    <SettingsForm />
  );
}
