import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Estimator   from './pages/Estimator'
import NewEstimate from './pages/NewEstimate'
import SavedEstimates from './pages/SavedEstimates'
import ExampleProject from './pages/ExampleProject'
import Settings    from './pages/Settings'
import Layout      from './components/Layout'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Skip auth for initial testing — restore login gate when auth is needed
    if (!supabase) { setReady(true); return }
    supabase.auth.getSession().then(() => setReady(true))
  }, [])

  if (!ready) return <div style={{ background: '#1A1A1A', minHeight: '100dvh' }} />

  return (
    <Layout>
      <Routes>
        <Route path="/"                 element={<Navigate to="/estimator" replace />} />
        <Route path="/estimator"        element={<Estimator />} />
        <Route path="/estimator/new"    element={<NewEstimate />} />
        <Route path="/estimator/saved"  element={<SavedEstimates />} />
        <Route path="/estimator/example/:id" element={<ExampleProject />} />
        <Route path="/settings"         element={<Settings />} />
        <Route path="*"                 element={<Navigate to="/estimator" replace />} />
      </Routes>
    </Layout>
  )
}
