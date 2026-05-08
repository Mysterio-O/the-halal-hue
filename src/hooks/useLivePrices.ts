"use client"
import { useEffect, useRef, useState } from 'react'
import { Perfume } from '../types/perfume'
import { REFRESH_INTERVAL_MS } from '../lib/constants'

export function useLivePrices(intervalMs?: number){
  const [perfumes, setPerfumes] = useState<Perfume[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const timer = useRef<number | null>(null)
  const ms = intervalMs ?? REFRESH_INTERVAL_MS

  async function fetchData(){
    try{
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/perfumes')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Perfume[] = await res.json()
      setPerfumes(data)
      setLastUpdated(new Date())
    }catch(e:any){
      setError(e?.message ?? 'Unknown error')
    }finally{
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    timer.current = window.setInterval(fetchData, ms)
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [ms])

  return { perfumes, isLoading, error, lastUpdated }
}

export default useLivePrices
