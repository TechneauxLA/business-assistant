import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Card, SectionHeader, Pill, Button } from '../components/UI'
import styles from './SavedEstimates.module.css'

export default function SavedEstimates() {
  const navigate = useNavigate()
  const [estimates, setEstimates] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      if (supabase) {
        const { data, error } = await supabase
          .from('estimates')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        if (!error) setEstimates(data || [])
      } else {
        // Demo mode — read from localStorage
        const saved = JSON.parse(localStorage.getItem('estimates') || '[]')
        setEstimates(saved)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function deleteEstimate(id) {
    if (supabase) {
      await supabase.from('estimates').delete().eq('id', id)
    } else {
      const saved = JSON.parse(localStorage.getItem('estimates') || '[]')
      localStorage.setItem('estimates', JSON.stringify(saved.filter(e => e.id !== id)))
    }
    setEstimates(prev => prev.filter(e => e.id !== id))
  }

  if (loading) return <div className={styles.loading}>Loading estimates…</div>

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <SectionHeader
          title="Saved estimates"
          sub={`${estimates.length} estimate${estimates.length !== 1 ? 's' : ''}`}
          action={
            <Button variant="ghost" onClick={() => navigate('/estimator/new')}>+ New</Button>
          }
        />

        {estimates.length === 0 ? (
          <Card>
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📋</div>
              <div className={styles.emptyTitle}>No estimates yet</div>
              <div className={styles.emptySub}>Create your first project estimate to see it here</div>
              <Button onClick={() => navigate('/estimator/new')}>Create estimate</Button>
            </div>
          </Card>
        ) : (
          estimates.map(est => (
            <div key={est.id} className={styles.estimateCard}>
              <div className={styles.estHeader}>
                <div className={styles.estName}>{est.name}</div>
                <Pill intent="orange">{est.project_type?.split(' / ')[0]}</Pill>
              </div>
              <div className={styles.estMeta}>
                <span>{est.total_hours}h</span>
                <span>·</span>
                <span style={{ color: 'var(--green)' }}>${(est.total_cost || 0).toLocaleString()}</span>
                <span>·</span>
                <span>{new Date(est.created_at).toLocaleDateString()}</span>
              </div>
              {est.breakdown && (
                <div className={styles.estPhases}>
                  {(est.breakdown || []).slice(0, 4).map(row => (
                    <div key={row.phase} className={styles.estPhaseChip}>
                      {row.phase.split(' ')[0]}: {Math.round(row.hrs)}h
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.estActions}>
                <button className={styles.deleteBtn} onClick={() => deleteEstimate(est.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
