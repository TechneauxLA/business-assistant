import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Card, Label, MetricCard, Chip, Select, NumberInput, Button, RoleMixBar, ROLE_COLORS, Divider, SectionHeader } from '../components/UI'
import { useEngine } from '../lib/useEngine'
import styles from './NewEstimate.module.css'

const PROJECT_TYPES = [
  { value: 'Reimplementation / Standardization', label: 'Reimplementation / Standardization' },
  { value: 'Migration',                          label: 'Migration (CygNet → CygNet)' },
  { value: 'Migration_to_Ignition',              label: 'Migration (CygNet → Ignition)' },
  { value: 'Upgrade',                            label: 'CygNet Upgrade' },
]

const COMPLEXITY_LEVELS = [
  { value: 'low',       label: 'Low – clean data, simple tag structure' },
  { value: 'medium',    label: 'Medium – typical CygNet project' },
  { value: 'high',      label: 'High – messy data, custom scripts, tight timeline' },
  { value: 'very_high', label: 'Very High – multi-site, legacy integrations, scope risk' },
]

function calcComplexityHours(projectType, params, model) {
  const m = model?.[projectType] || model?.['Migration']
  if (!m) return 500

  const mul = m.complexity_range?.[params.complexity] ?? 1.0

  let hrs = m.base_hrs || 0
  if (projectType === 'Upgrade') {
    hrs += (params.servers  || 0) * (m.per_server  || 50)
    hrs += (params.regions  || 0) * (m.per_region  || 150)
    hrs *= mul
    hrs += hrs * (m.post_cutover_buffer_pct || 0)
  } else if (projectType === 'Reimplementation / Standardization') {
    hrs += (params.regions  || 0) * (m.per_region  || 500)
    hrs += (params.points   || 0) / 100 * (m.per_100_points || 5)
    hrs += (params.screens  || 0) * (m.per_screen  || 4)
    hrs += (params.facilities || 0) * (m.per_facility || 8)
    hrs *= mul
  } else {
    hrs += (params.facilities || 0) * (m.per_facility    || 12)
    hrs += (params.points     || 0) / 100 * (m.per_100_points || 10)
    hrs += (params.screens    || 0) * (m.per_screen     || 6)
    hrs += (params.devices    || 0) / 100 * (m.per_100_devices || 8)
    hrs += (params.scripts    || 0) * (m.per_script     || 3)
    hrs *= mul
  }
  return Math.round(hrs / 10) * 10
}

export default function NewEstimate() {
  const navigate = useNavigate()
  const engine   = useEngine()
  const PHASES   = engine.canon_phases    || []
  const SUBS     = engine.canon_subphases || []
  const RATES    = engine.rates           || {}
  const ROLES    = engine.roles           || []

  const [step,         setStep]         = useState(0)
  const [projectName,  setProjectName]  = useState('')
  const [projectType,  setProjectType]  = useState('Reimplementation / Standardization')
  const [totalHours,   setTotalHours]   = useState(500)
  const [useComplexity, setUseComplexity] = useState(false)
  const [complexity,   setComplexity]   = useState({
    facilities: 0, points: 0, screens: 0, devices: 0,
    scripts: 0, regions: 1, servers: 1, complexity: 'medium',
  })
  const [activePhases, setActivePhases] = useState(() => new Set(PHASES.slice(0, 6)))
  const [activeSubs,   setActiveSubs]   = useState(() => new Set(SUBS))
  const [rates,        setRates]        = useState(() => ({ ...RATES }))
  const [saving,       setSaving]       = useState(false)

  // Migration_to_Ignition uses Migration phase distribution with higher total
  const pctKey    = projectType === 'Migration_to_Ignition' ? 'Migration' : projectType
  const pcts      = engine.phase_pcts_by_type?.[pctKey] || {}
  const roleSplit = engine.role_splits_by_phase || {}
  const bp        = engine.bp_benchmark || {}

  const complexityHours = useMemo(
    () => calcComplexityHours(projectType, complexity, engine.complexity_model),
    [projectType, complexity, engine.complexity_model]
  )
  const effectiveHours = useComplexity ? complexityHours : totalHours

  // ── Core calculation ──────────────────────────────────────────
  const estimate = useMemo(() => {
    const activePctSum = PHASES
      .filter(p => activePhases.has(p))
      .reduce((a, p) => a + (pcts[p] || 0), 0)

    let totalCost = 0
    let grandHrs  = 0
    const roleTotals = {}
    const phaseRows  = []

    PHASES.forEach(ph => {
      if (!activePhases.has(ph)) return
      const phHrs = activePctSum > 0
        ? effectiveHours * ((pcts[ph] || 0) / activePctSum)
        : effectiveHours / activePhases.size

      const splits = roleSplit[ph] || { Integrator: 100 }
      const benchSubs = bp.phases?.[ph]?.subphases || {}
      const hasBench  = Object.keys(benchSubs).length > 0

      let phCost = 0
      const subRows = []

      if (hasBench) {
        const benchTotal = Object.values(benchSubs)
          .reduce((a, d) => a + (typeof d === 'object' ? (d.est || d.actual || 0) : 0), 0)
        Object.entries(benchSubs).forEach(([sub, data]) => {
          if (!activeSubs.has(sub)) return
          const bHrs = typeof data === 'object' ? (data.est || data.actual || 0) : 0
          if (!bHrs) return
          const sHrs = benchTotal > 0 ? phHrs * (bHrs / benchTotal) : 0
          const sCost = Object.entries(splits).reduce((a, [r, p]) =>
            a + sHrs * (p / 100) * (rates[r] || 0), 0)
          phCost += sCost
          subRows.push({ sub, hrs: Math.round(sHrs * 10) / 10, cost: sCost })
        })
        if (!phCost) phCost = Object.entries(splits).reduce((a, [r, p]) =>
          a + phHrs * (p / 100) * (rates[r] || 0), 0)
      } else {
        phCost = Object.entries(splits).reduce((a, [r, p]) =>
          a + phHrs * (p / 100) * (rates[r] || 0), 0)
      }

      Object.entries(splits).forEach(([r, p]) => {
        roleTotals[r] = (roleTotals[r] || 0) + phHrs * (p / 100)
      })

      grandHrs  += phHrs
      totalCost += phCost
      phaseRows.push({ phase: ph, hrs: Math.round(phHrs * 10) / 10, cost: phCost, subs: subRows })
    })

    const avgRate = grandHrs > 0 ? totalCost / grandHrs : 0
    return { grandHrs: Math.round(grandHrs), totalCost: Math.round(totalCost), avgRate: Math.round(avgRate), roleTotals, phaseRows }
  }, [engine, projectType, effectiveHours, activePhases, activeSubs, rates])

  // ── Save estimate ─────────────────────────────────────────────
  async function saveEstimate() {
    setSaving(true)
    const payload = {
      name:         projectName || `Estimate ${new Date().toLocaleDateString()}`,
      project_type: projectType,
      total_hours:  estimate.grandHrs,
      total_cost:   estimate.totalCost,
      phases:       [...activePhases],
      subphases:    [...activeSubs],
      rates,
      breakdown:    estimate.phaseRows,
    }

    let savedToCloud = false

    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { error } = await supabase
          .from('estimates')
          .insert({ ...payload, user_id: session.user.id })
        if (!error) savedToCloud = true
        else console.error('Supabase save error:', error)
      }
    }

    if (!savedToCloud) {
      // No auth session or Supabase unavailable — persist locally
      const existing = JSON.parse(localStorage.getItem('estimates') || '[]')
      existing.unshift({ ...payload, id: Date.now(), created_at: new Date().toISOString() })
      localStorage.setItem('estimates', JSON.stringify(existing))
    }

    setSaving(false)
    navigate('/estimator/saved')
  }

  const isUpgrade = projectType === 'Upgrade'
  const isStd     = projectType === 'Reimplementation / Standardization'
  const isMig     = projectType === 'Migration' || projectType === 'Migration_to_Ignition'

  // ── Step 0: Configuration ─────────────────────────────────────
  const StepConfig = (
    <div>
      <SectionHeader title="Project details" sub="Step 1 of 3" />
      <Card>
        <Label>Project name (optional)</Label>
        <input
          className={styles.nameInput}
          placeholder="e.g. BKV CygNet Reimplementation"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
        />
      </Card>
      <Card>
        <Select
          label="Project type"
          value={projectType}
          onChange={v => { setProjectType(v); setUseComplexity(false) }}
          options={PROJECT_TYPES}
        />
      </Card>

      {/* Hour input mode toggle */}
      <Card>
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${!useComplexity ? styles.modeBtnActive : ''}`}
            onClick={() => setUseComplexity(false)}
          >Enter hours directly</button>
          <button
            className={`${styles.modeBtn} ${useComplexity ? styles.modeBtnActive : ''}`}
            onClick={() => setUseComplexity(true)}
          >Estimate from scope</button>
        </div>

        {!useComplexity ? (
          <>
            <NumberInput
              label="Total project hours"
              value={totalHours}
              onChange={setTotalHours}
              min={50} max={25000} step={50}
              suffix="hrs"
            />
            <div className={styles.hint}>
              Hours are distributed across phases using historical actuals for the selected project type
            </div>
          </>
        ) : (
          <div className={styles.complexityForm}>
            <div className={styles.hint} style={{ marginBottom: 12 }}>
              Enter known scope parameters — the engine estimates total hours from calibrated historical rates.
            </div>

            {isUpgrade && (
              <>
                <div className={styles.complexRow}>
                  <label className={styles.complexLabel}>Number of servers / sites</label>
                  <input type="number" className={styles.complexInput} min={1} max={50}
                    value={complexity.servers}
                    onChange={e => setComplexity({ ...complexity, servers: +e.target.value })} />
                </div>
                <div className={styles.complexRow}>
                  <label className={styles.complexLabel}>Number of regions (multi-site)</label>
                  <input type="number" className={styles.complexInput} min={0} max={20}
                    value={complexity.regions}
                    onChange={e => setComplexity({ ...complexity, regions: +e.target.value })} />
                </div>
              </>
            )}

            {isStd && (
              <>
                <div className={styles.complexRow}>
                  <label className={styles.complexLabel}>Number of regions / sites</label>
                  <input type="number" className={styles.complexInput} min={1} max={20}
                    value={complexity.regions}
                    onChange={e => setComplexity({ ...complexity, regions: +e.target.value })} />
                </div>
                <div className={styles.complexRow}>
                  <label className={styles.complexLabel}>Total CygNet points to standardize</label>
                  <input type="number" className={styles.complexInput} min={0} max={50000} step={100}
                    value={complexity.points}
                    onChange={e => setComplexity({ ...complexity, points: +e.target.value })} />
                </div>
                <div className={styles.complexRow}>
                  <label className={styles.complexLabel}>Screens to rebuild</label>
                  <input type="number" className={styles.complexInput} min={0} max={500}
                    value={complexity.screens}
                    onChange={e => setComplexity({ ...complexity, screens: +e.target.value })} />
                </div>
                <div className={styles.complexRow}>
                  <label className={styles.complexLabel}>Facilities</label>
                  <input type="number" className={styles.complexInput} min={0} max={500}
                    value={complexity.facilities}
                    onChange={e => setComplexity({ ...complexity, facilities: +e.target.value })} />
                </div>
              </>
            )}

            {isMig && (
              <>
                <div className={styles.complexRow}>
                  <label className={styles.complexLabel}>Facilities / leases</label>
                  <input type="number" className={styles.complexInput} min={0} max={1000}
                    value={complexity.facilities}
                    onChange={e => setComplexity({ ...complexity, facilities: +e.target.value })} />
                </div>
                <div className={styles.complexRow}>
                  <label className={styles.complexLabel}>CygNet points / tags</label>
                  <input type="number" className={styles.complexInput} min={0} max={50000} step={100}
                    value={complexity.points}
                    onChange={e => setComplexity({ ...complexity, points: +e.target.value })} />
                </div>
                <div className={styles.complexRow}>
                  <label className={styles.complexLabel}>Screens to build / migrate</label>
                  <input type="number" className={styles.complexInput} min={0} max={500}
                    value={complexity.screens}
                    onChange={e => setComplexity({ ...complexity, screens: +e.target.value })} />
                </div>
                <div className={styles.complexRow}>
                  <label className={styles.complexLabel}>Devices / polling points</label>
                  <input type="number" className={styles.complexInput} min={0} max={2000}
                    value={complexity.devices}
                    onChange={e => setComplexity({ ...complexity, devices: +e.target.value })} />
                </div>
                <div className={styles.complexRow}>
                  <label className={styles.complexLabel}>Custom scripts / calcs</label>
                  <input type="number" className={styles.complexInput} min={0} max={200}
                    value={complexity.scripts}
                    onChange={e => setComplexity({ ...complexity, scripts: +e.target.value })} />
                </div>
              </>
            )}

            <div className={styles.complexRow}>
              <label className={styles.complexLabel}>Complexity / data quality</label>
              <select className={styles.complexSelect}
                value={complexity.complexity}
                onChange={e => setComplexity({ ...complexity, complexity: e.target.value })}>
                {COMPLEXITY_LEVELS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.complexResult}>
              <span className={styles.complexResultLabel}>Engine estimate</span>
              <span className={styles.complexResultHrs}>{complexityHours}h</span>
            </div>
            <div className={styles.hint}>
              Calibrated from {projectType === 'Upgrade' ? '2 upgrade' : isMig ? '4 migration' : '2 standardization'} projects. Adjust complexity multiplier to fine-tune.
            </div>
          </div>
        )}
      </Card>

      <Card>
        <SectionHeader title="Phases" sub="Toggle phases included in this project" />
        <div className={styles.phaseList}>
          {PHASES.map(ph => {
            const pct  = pcts[ph] || 0
            const active = activePhases.has(ph)
            return (
              <button
                key={ph}
                className={`${styles.phaseToggle} ${active ? styles.phaseActive : ''}`}
                onClick={() => {
                  const next = new Set(activePhases)
                  active ? next.delete(ph) : next.add(ph)
                  setActivePhases(next)
                }}
              >
                <div className={styles.phaseToggleLeft}>
                  <div className={`${styles.phaseCheck} ${active ? styles.phaseCheckOn : ''}`}>
                    {active && <span>✓</span>}
                  </div>
                  <span className={styles.phaseName}>{ph}</span>
                </div>
                {pct > 0 && <span className={styles.phasePct}>{pct}%</span>}
              </button>
            )
          })}
        </div>
      </Card>

      <Button fullWidth onClick={() => setStep(1)}>Next: Work Type Scope →</Button>
    </div>
  )

  // ── Step 1: Scope ─────────────────────────────────────────────
  const StepScope = (
    <div>
      <SectionHeader title="Work type scope" sub="Step 2 of 3" />
      <Card>
        <div className={styles.hint} style={{ marginBottom: 12 }}>
          Select which work types apply to this project. Deselecting a type removes it from the phase hour distribution.
        </div>
        <div className={styles.chipGrid}>
          {SUBS.map(s => (
            <Chip
              key={s}
              active={activeSubs.has(s)}
              onClick={() => {
                const next = new Set(activeSubs)
                activeSubs.has(s) ? next.delete(s) : next.add(s)
                setActiveSubs(next)
              }}
            >
              {s}
            </Chip>
          ))}
        </div>
        <div className={styles.scopeActions}>
          <button className={styles.scopeLink} onClick={() => setActiveSubs(new Set(SUBS))}>Select all</button>
          <button className={styles.scopeLink} onClick={() => setActiveSubs(new Set())}>Clear all</button>
        </div>
      </Card>
      <div className={styles.stepNav}>
        <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
        <Button onClick={() => setStep(2)}>Next: Bill Rates →</Button>
      </div>
    </div>
  )

  // ── Step 2: Rates ─────────────────────────────────────────────
  const StepRates = (
    <div>
      <SectionHeader title="Bill rates" sub="Step 3 of 3" />
      <Card>
        {ROLES.map(r => (
          <div key={r} className={styles.rateRow}>
            <div className={styles.roleDot} style={{ background: ROLE_COLORS[r] || '#888' }} />
            <div className={styles.roleLabel}>{r}</div>
            <div className={styles.rateInputWrap}>
              <span className={styles.rateDollar}>$</span>
              <input
                type="number"
                className={styles.rateInput}
                value={rates[r] || 0}
                onChange={e => setRates({ ...rates, [r]: Number(e.target.value) })}
                min={0} step={5}
              />
              <span className={styles.rateSlash}>/hr</span>
            </div>
          </div>
        ))}
        <button className={styles.scopeLink} style={{ marginTop: 8 }}
          onClick={() => setRates({ ...RATES })}>
          Reset to defaults
        </button>
      </Card>
      <div className={styles.stepNav}>
        <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
        <Button onClick={() => setStep(3)}>View Estimate →</Button>
      </div>
    </div>
  )

  // ── Step 3: Results ───────────────────────────────────────────
  const pctType = projectType === 'Reimplementation / Standardization' ? 'High' : 'Medium'
  const StepResults = (
    <div>
      <SectionHeader
        title={projectName || 'Estimate'}
        sub={projectType}
        action={<span className={styles.confBadge}>{pctType} confidence</span>}
      />

      {/* Summary metrics */}
      <div className={styles.metricsGrid}>
        <MetricCard label="Total hours"   value={estimate.grandHrs + 'h'}          sub={`${activePhases.size} phases`} />
        <MetricCard label="Est. cost"     value={'$' + estimate.totalCost.toLocaleString()} intent="good" sub="At current rates" />
        <MetricCard label="Blended rate"  value={'$' + estimate.avgRate + '/hr'}    sub="Weighted avg" />
        <MetricCard label="Work types"    value={activeSubs.size + '/' + SUBS.length} sub="Included" />
      </div>

      {/* Role mix */}
      <Card>
        <Label>Projected role mix</Label>
        <RoleMixBar roleHours={estimate.roleTotals} height={16} />
        <div className={styles.roleLegend}>
          {Object.entries(estimate.roleTotals)
            .filter(([, h]) => h > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([r, h]) => (
              <div key={r} className={styles.roleLegendItem}>
                <div className={styles.roleLegendDot} style={{ background: ROLE_COLORS[r] }} />
                <span>{r}: {Math.round(h)}h ({Math.round(h / estimate.grandHrs * 100)}%)</span>
              </div>
            ))}
        </div>
      </Card>

      {/* Phase breakdown */}
      <Card>
        <Label>Phase breakdown</Label>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Phase / Work type</th>
              <th>Hrs</th>
              <th>%</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {estimate.phaseRows.map(row => (
              <React.Fragment key={row.phase}>
                <tr className={styles.phaseRow}>
                  <td>{row.phase}</td>
                  <td>{Math.round(row.hrs)}h</td>
                  <td>{estimate.grandHrs > 0 ? Math.round(row.hrs / estimate.grandHrs * 100) : 0}%</td>
                  <td>${Math.round(row.cost).toLocaleString()}</td>
                </tr>
                {row.subs.map(s => (
                  <tr key={s.sub} className={styles.subRow}>
                    <td>{s.sub}</td>
                    <td>{s.hrs}h</td>
                    <td>{estimate.grandHrs > 0 ? Math.round(s.hrs / estimate.grandHrs * 100) : 0}%</td>
                    <td>${Math.round(s.cost).toLocaleString()}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            <tr className={styles.totalRow}>
              <td>Total</td>
              <td>{estimate.grandHrs}h</td>
              <td>100%</td>
              <td>${estimate.totalCost.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <div className={styles.stepNav}>
        <Button variant="secondary" onClick={() => setStep(2)}>← Edit rates</Button>
        <Button onClick={saveEstimate} disabled={saving}>
          {saving ? 'Saving…' : '💾 Save estimate'}
        </Button>
      </div>
    </div>
  )

  const steps = [StepConfig, StepScope, StepRates, StepResults]

  return (
    <div className={styles.page}>
      {/* Step indicator */}
      <div className={styles.stepBar}>
        {['Configure', 'Scope', 'Rates', 'Results'].map((s, i) => (
          <div key={s} className={`${styles.stepDot} ${i <= step ? styles.stepDotActive : ''}`}>
            <div className={styles.stepCircle}>{i < step ? '✓' : i + 1}</div>
            <div className={styles.stepDotLabel}>{s}</div>
          </div>
        ))}
      </div>
      <div className={styles.inner}>{steps[step]}</div>
    </div>
  )
}
