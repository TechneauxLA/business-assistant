import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card, SectionHeader, Button, ROLE_COLORS } from '../components/UI'
import { useEngine } from '../lib/useEngine'
import styles from './Settings.module.css'

export default function Settings() {
  const engine = useEngine()
  const [rates, setRates] = useState(() => ({ ...engine.rates }))
  const [saved, setSaved] = useState(false)

  async function handleSignOut() {
    if (supabase) await supabase.auth.signOut()
    else window.location.reload()
  }

  function saveRates() {
    localStorage.setItem('custom_rates', JSON.stringify(rates))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <SectionHeader title="Settings" />

        <Card>
          <SectionHeader title="Bill rates" sub="Default rates used in new estimates" />
          {(engine.roles || []).map(role => (
            <div key={role} className={styles.rateRow}>
              <div className={styles.roleDot} style={{ background: ROLE_COLORS[role] || '#888' }} />
              <div className={styles.roleLabel}>{role}</div>
              <div className={styles.rateWrap}>
                <span className={styles.dollar}>$</span>
                <input
                  type="number"
                  className={styles.rateInput}
                  value={rates[role] || 0}
                  onChange={e => setRates({ ...rates, [role]: Number(e.target.value) })}
                  min={0} step={5}
                />
                <span className={styles.perhr}>/hr</span>
              </div>
            </div>
          ))}
          <Button fullWidth onClick={saveRates} variant={saved ? 'secondary' : 'primary'}>
            {saved ? '✓ Saved' : 'Save rates'}
          </Button>
        </Card>

        <Card>
          <SectionHeader title="Data" sub="Estimation engine version" />
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Engine data</span>
            <span className={styles.infoVal}>2025 CW Export</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Project types</span>
            <span className={styles.infoVal}>{Object.keys(engine.phase_pcts_by_type || {}).length}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Benchmark project</span>
            <span className={styles.infoVal}>{engine.example_projects?.BP_HPU_STD?.name || '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Total hours analyzed</span>
            <span className={styles.infoVal}>94,753h</span>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Account" />
          <Button fullWidth variant="secondary" onClick={handleSignOut}>Sign out</Button>
        </Card>

        <div className={styles.footer}>
          Business Assistant · Techneaux Technology Services<br />Internal Use Only
        </div>
      </div>
    </div>
  )
}
