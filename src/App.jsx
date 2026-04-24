import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login       from './pages/Login'
import Estimator   from './pages/Estimator'
import NewEstimate from './pages/NewEstimate'
import SavedEstimates from './pages/SavedEstimates'
import ExampleProject from './pages/ExampleProject'
import Settings    from './pages/Settings'
import Layout      from './components/Layout'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    // If no Supabase configured, run in demo mode (internal dev)
    if (!supabase) { setSession({ demo: true }); return }

    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Show blank while checking auth
  if (session === undefined) return <div style={{ background: '#1A1A1A', minHeight: '100dvh' }} />

  // Not logged in
  if (!session) return <Login />

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
