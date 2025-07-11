'use client'
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  BarController,
  Filler,
  Legend,
  PointElement,
  Tooltip,
  ArcElement,
  LineController,
  Title,
  LogarithmicScale,
  registerables,
} from 'chart.js'
import { useEffect } from 'react'

export default function RegisterPlugins() {
  useEffect(() => {
    Chart.register(
      BarController,
      LineController,
      LineElement,
      ArcElement,
      PointElement,
      BarElement,
      CategoryScale,
      LinearScale,
      Title,
      Filler,
      Legend,
      Tooltip,
      LogarithmicScale,
      ...registerables
    )
  }, [])

  return null

}
