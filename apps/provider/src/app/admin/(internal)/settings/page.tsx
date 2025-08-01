import type { Metadata } from 'next'
import React from 'react';
import {
  GetAppName,
} from '@/actions/ApplicationSettings'
import SettingsForm from '@/app/admin/(internal)/settings/Form'

export async function generateMetadata(): Promise<Metadata> {
  const appName = await GetAppName()

  return {
    title: `Settings - ${appName}`,
    description: "Light up your earnings with Igniter",
  }
}

export default function SettingsPage() {
  return (
    <SettingsForm />
  )
}
