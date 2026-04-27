import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import LOCAL_ENGINE from '../data/estimationEngine.json'

// Module-level cache — one fetch per session, shared across all component instances
let _cached = null

export function useEngine() {
  const [engine, setEngine] = useState(_cached ?? LOCAL_ENGINE)

  useEffect(() => {
    if (_cached) return
    if (!supabase) return

    supabase
      .from('engine_config')
      .select('data')
      .eq('key', 'main')
      .single()
      .then(({ data, error }) => {
        if (!error && data?.data) {
          _cached = data.data
          setEngine(data.data)
        }
      })
  }, [])

  return engine
}
