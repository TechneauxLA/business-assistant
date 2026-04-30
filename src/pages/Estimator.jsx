import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, SectionHeader, Pill } from '../components/UI'
import { useEngine } from '../lib/useEngine'
import styles from './Estimator.module.css'

const CANON_PHASES = [
  'Discovery & Requirements',
  'Analysis & Design',
  'Implementation',
  'Testing & UAT',
  'Deployment & Post-Cutover',
  'Project Management',
]

function toCanon(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('requirements') || n.includes('data discovery') || n.includes('discovery') || n.includes('preliminary')) return 'Discovery & Requirements'
  if (n.includes('functional design') || n.includes('design') || n.includes('documentation') || n.includes('analysis and design') || n.includes('analysis & design')) return 'Analysis & Design'
  if (n.includes('implementation') || n.includes('cleanup') || n.includes('prework') || n.includes('pre-work') || n.includes('solution impl') || n.includes('cygnet upgrade') || n.includes('ignition phase') || n.includes('cygnet phase')) return 'Implementation'
  if (n.includes('testing') || n.includes('system test') || n.includes('uat') || n.includes('qaqc') || n.includes('beta')) return 'Testing & UAT'
  if (n.includes('deployment') || n.includes('cutover') || n.includes('post cutover') || n.includes('post-cutover')) return 'Deployment & Post-Cutover'
  if (n.includes('project management') || n.startsWith('pm ') || n === 'pm') return 'Project Management'
  return null
}

const TYPE_LABELS = {
  'Migration':                          'Migration (CygNet → CygNet)',
  'Migration_to_Ignition':              'Migration (CygNet → Ignition)',
  'Reimplementation / Standardization': 'Standardization',
  'Upgrade':                            'CygNet Upgrade',
}

export default function Estimator() {
  const navigate      = useNavigate()
  const engine        = useEngine()
  const [analysisType, setAnalysisType] = useState('all')

  // ── Analysis aggregation ────────────────────────────────────────
  const allProjects = Object.values(engine.example_projects || {})

  const projectTypes = useMemo(() => {
    const types = [...new Set(allProjects.map(p => p.project_type))]
    return types.filter(t => t !== 'Greenfield / Other')
  }, [allProjects])

  const filteredProjects = useMemo(() =>
    analysisType === 'all'
      ? allProjects.filter(p => p.project_type !== 'Greenfield / Other')
      : allProjects.filter(p => p.project_type === analysisType),
    [allProjects, analysisType]
  )

  // Only projects that have at least one phase with both est and actual
  const comparableProjects = useMemo(() =>
    filteredProjects.filter(p =>
      p.totals?.estimated_hrs && p.totals?.actual_hrs
    ),
    [filteredProjects]
  )

  const phaseAgg = useMemo(() => {
    const agg = {}
    CANON_PHASES.forEach(cp => { agg[cp] = { estSamples: [], actSamples: [] } })

    comparableProjects.forEach(proj => {
      // bucket each raw phase into a canonical bucket PER PROJECT (sum within project first)
      const projBuckets = {}
      ;(proj.phases || []).forEach(ph => {
        const canon = toCanon(ph.phase)
        if (!canon) return
        if (!projBuckets[canon]) projBuckets[canon] = { est: 0, act: 0, hasEst: false, hasAct: false }
        if (ph.estimated_hrs) { projBuckets[canon].est += ph.estimated_hrs; projBuckets[canon].hasEst = true }
        if (ph.actual_hrs)    { projBuckets[canon].act += ph.actual_hrs;    projBuckets[canon].hasAct = true }
      })
      // push each project's bucket total as one sample
      Object.entries(projBuckets).forEach(([canon, vals]) => {
        if (vals.hasEst) agg[canon].estSamples.push(vals.est)
        if (vals.hasAct) agg[canon].actSamples.push(vals.act)
      })
    })

    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
    return CANON_PHASES.map(cp => {
      const { estSamples, actSamples } = agg[cp]
      const avgEst = avg(estSamples)
      const avgAct = avg(actSamples)
      const varPct = avgEst > 0 ? (avgAct - avgEst) / avgEst * 100 : null
      return { phase: cp, avgEst: Math.round(avgEst), avgAct: Math.round(avgAct), varPct, n: actSamples.length }
    }).filter(r => r.n > 0)
  }, [comparableProjects])

  const maxPhaseHrs = Math.max(...phaseAgg.map(r => Math.max(r.avgEst, r.avgAct)), 1)

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Quick actions */}
        <div className={styles.actions}>
          <button className={styles.primaryAction} onClick={() => navigate('/estimator/new')}>
            <span className={styles.actionIcon}>＋</span>
            <div>
              <div className={styles.actionTitle}>New Estimate</div>
              <div className={styles.actionSub}>Start a new project quote</div>
            </div>
          </button>
          <button className={styles.secondaryAction} onClick={() => navigate('/estimator/saved')}>
            <span className={styles.actionIcon}>📋</span>
            <div>
              <div className={styles.actionTitle}>Saved Estimates</div>
              <div className={styles.actionSub}>View & edit past estimates</div>
            </div>
          </button>
        </div>

        {/* Engine stats */}
        <Card>
          <SectionHeader title="Estimation engine" sub="Powered by 2025 ConnectWise data" />
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <div className={styles.statValue}>51,626h</div>
              <div className={styles.statLabel}>Hours analyzed</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>17</div>
              <div className={styles.statLabel}>Projects</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>4</div>
              <div className={styles.statLabel}>Project types</div>
            </div>
          </div>
        </Card>

        {/* Example projects */}
        {engine.example_projects && Object.keys(engine.example_projects).length > 0 && (
          <Card>
            <SectionHeader
              title="Example projects"
              sub="Real actuals from completed engagements"
              action={<Pill intent="good">Completed</Pill>}
            />
            {Object.entries(engine.example_projects).map(([key, proj]) => {
              const t = proj.totals
              return (
                <button
                  key={key}
                  className={styles.exampleCard}
                  onClick={() => navigate(`/estimator/example/${key}`)}
                >
                  <div className={styles.exampleName}>{proj.name}</div>
                  <div className={styles.exampleType}>{proj.project_type} · {proj.platform}</div>
                  <div className={styles.exampleMeta}>
                    {t.estimated_hrs ? (
                      <>
                        <span>Est: {t.estimated_hrs}h</span>
                        <span>·</span>
                        <span>Actual: {t.actual_hrs}h</span>
                        <span>·</span>
                        <span style={{ color: t.variance_hrs <= 0 ? 'var(--green)' : 'var(--red)' }}>
                          {t.variance_hrs > 0 ? '+' : ''}{t.variance_hrs}h
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Actual: {t.actual_hrs}h</span>
                        <span>·</span>
                        <span style={{ color: 'var(--orange)' }}>${t.blended_rate}/hr blended</span>
                      </>
                    )}
                  </div>
                  <div className={styles.exampleArrow}>View full breakdown →</div>
                </button>
              )
            })}
          </Card>
        )}

        {/* ── Est vs Actual analysis ── */}
        <Card>
          <SectionHeader
            title="Estimate accuracy by phase"
            sub="Average est vs actual across completed projects"
          />

          {/* Type filter */}
          <div className={styles.analysisFilters}>
            <select
              className={styles.typeSelect}
              value={analysisType}
              onChange={e => setAnalysisType(e.target.value)}
            >
              <option value="all">All project types</option>
              {projectTypes.map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
              ))}
            </select>
            <span className={styles.analysisMeta}>
              {comparableProjects.length} project{comparableProjects.length !== 1 ? 's' : ''} with estimates
            </span>
          </div>

          {/* Project chips */}
          {comparableProjects.length > 0 && (
            <div className={styles.projChips}>
              {comparableProjects.map(p => {
                const vp = p.totals.variance_pct
                const color = vp == null ? 'var(--mid-gray)' : vp > 15 ? 'var(--red)' : vp < -15 ? 'var(--green)' : 'var(--orange)'
                return (
                  <button
                    key={p.id}
                    className={styles.projChip}
                    onClick={() => navigate(`/estimator/example/${p.id}`)}
                  >
                    <span className={styles.projChipName}>{p.name.replace(/^[^–—]+[–—]\s*/, '')}</span>
                    <span className={styles.projChipVar} style={{ color }}>
                      {vp != null ? (vp > 0 ? '+' : '') + vp.toFixed(0) + '%' : '—'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Phase accuracy bars */}
          {phaseAgg.length === 0 ? (
            <div className={styles.emptyAnalysis}>No estimate data for this filter</div>
          ) : (
            <div className={styles.phaseAnalysis}>
              <div className={styles.phaseAnalysisLegend}>
                <span className={styles.legendEst}>■ Est avg</span>
                <span className={styles.legendAct}>■ Actual avg</span>
              </div>
              {phaseAgg.map(row => {
                const isOver  = row.varPct != null && row.varPct >  15
                const isUnder = row.varPct != null && row.varPct < -15
                const barColor = isOver ? 'var(--red)' : isUnder ? 'var(--green)' : 'var(--orange)'
                return (
                  <div key={row.phase} className={styles.phaseAnalysisRow}>
                    <div className={styles.phaseAnalysisLabel}>
                      <span>{row.phase}</span>
                      <span className={styles.phaseSampleCount}>n={row.n}</span>
                    </div>
                    <div className={styles.phaseDualBars}>
                      {row.avgEst > 0 && (
                        <div className={styles.barWrap}>
                          <div className={styles.barEst} style={{ width: `${row.avgEst / maxPhaseHrs * 100}%` }} />
                          <span className={styles.barLabel}>{row.avgEst}h est</span>
                        </div>
                      )}
                      <div className={styles.barWrap}>
                        <div className={styles.barAct} style={{ width: `${row.avgAct / maxPhaseHrs * 100}%`, background: barColor }} />
                        <span className={styles.barLabel} style={{ color: barColor }}>
                          {row.avgAct}h actual
                          {row.varPct != null && (
                            <span className={styles.varTag}>
                              {' '}{row.varPct > 0 ? '+' : ''}{row.varPct.toFixed(0)}%
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}
