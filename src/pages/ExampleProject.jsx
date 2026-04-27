import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, SectionHeader, Pill, RoleMixBar, ROLE_COLORS, Variance } from '../components/UI'
import { useEngine } from '../lib/useEngine'
import styles from './ExampleProject.module.css'

export default function ExampleProject() {
  const navigate   = useNavigate()
  const engine     = useEngine()
  const BP         = engine.example_projects?.BP_HPU_STD
  const [tab, setTab] = useState('overview')
  const [expanded, setExpanded] = useState(new Set([0]))

  if (!BP) return <div className={styles.empty}>No example project data found.</div>

  const tot = BP.totals

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'phases',   label: 'Phases' },
    { id: 'roles',    label: 'Roles' },
    { id: 'insights', label: 'Insights' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate('/estimator')}>← Back</button>
          <div className={styles.projectName}>{BP.name}</div>
          <div className={styles.projectMeta}>
            <span>{BP.project_type}</span>
            <span>·</span>
            <span>{BP.platform}</span>
            <Pill intent="good">Completed</Pill>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
              onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Estimated</div>
                <div className={styles.metricValue}>{tot.estimated_hrs}h</div>
                <div className={styles.metricSub}>Original proposal</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Actual</div>
                <div className={styles.metricValue}>{tot.actual_hrs}h</div>
                <div className={styles.metricSub} style={{ color: tot.variance_hrs <= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {tot.variance_hrs > 0 ? '+' : ''}{tot.variance_hrs}h ({tot.variance_pct}%)
                </div>
              </div>
            </div>

            <Card>
              <SectionHeader title="Estimate vs actual by phase" />
              {BP.phases.map(p => {
                const maxH = Math.max(...BP.phases.map(x => Math.max(x.estimated_hrs, x.actual_hrs)))
                const vr = p.actual_hrs - p.estimated_hrs
                const isOver = vr > 20
                return (
                  <div key={p.phase} className={styles.wfRow}>
                    <div className={styles.wfLabel}>{p.phase}</div>
                    <div className={styles.wfBars}>
                      <div className={styles.wfEst} style={{ width: `${p.estimated_hrs / maxH * 100}%` }} />
                      <div
                        className={`${styles.wfAct} ${isOver ? styles.wfOver : ''}`}
                        style={{ width: `${p.actual_hrs / maxH * 100}%` }}
                      />
                    </div>
                    <div className={styles.wfVals}>
                      <span>{p.estimated_hrs}h</span>
                      <span style={{ color: isOver ? 'var(--red)' : 'var(--green)' }}>
                        {vr > 0 ? '+' : ''}{vr !== 0 ? vr + 'h' : '✓'}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div className={styles.wfLegend}>
                <span className={styles.wfLegendEst}>■ Estimated</span>
                <span className={styles.wfLegendAct}>■ Actual</span>
                <span className={styles.wfLegendOver}>■ Overrun</span>
              </div>
            </Card>

            <Card>
              <SectionHeader title="Overall role mix (actual)" />
              <RoleMixBar roleHours={tot.roles_actual} height={18} />
              <div className={styles.roleLegend}>
                {Object.entries(tot.roles_actual).filter(([, h]) => h > 0).map(([r, h]) => {
                  const total = Object.values(tot.roles_actual).reduce((a, b) => a + b, 0)
                  return (
                    <div key={r} className={styles.roleLegendItem}>
                      <div className={styles.roleDot} style={{ background: ROLE_COLORS[r] }} />
                      <span>{r}: {h}h ({Math.round(h / total * 100)}%)</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

        {/* PHASES */}
        {tab === 'phases' && (
          <div>
            {BP.phases.map((p, i) => {
              const vr      = p.actual_hrs - p.estimated_hrs
              const isExpanded = expanded.has(i)
              const roleTotal  = Object.values(p.roles_actual || {}).reduce((a, b) => a + b, 0)
              return (
                <div key={p.phase} className={styles.phaseBlock}>
                  <button
                    className={styles.phaseHeader}
                    onClick={() => {
                      const next = new Set(expanded)
                      isExpanded ? next.delete(i) : next.add(i)
                      setExpanded(next)
                    }}
                  >
                    <div className={styles.phaseHeaderLeft}>
                      <span className={styles.phaseNum}>{i + 1}</span>
                      <span className={styles.phaseTitle}>{p.phase}</span>
                    </div>
                    <div className={styles.phaseHeaderRight}>
                      <span className={styles.phaseHrs}>{p.actual_hrs}h</span>
                      <Variance est={p.estimated_hrs} actual={p.actual_hrs} />
                      <span className={styles.chevron}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className={styles.phaseBody}>
                      {roleTotal > 0 && (
                        <div className={styles.phaseRoles}>
                          <RoleMixBar roleHours={p.roles_actual || {}} height={8} />
                        </div>
                      )}
                      <table className={styles.subTable}>
                        <thead>
                          <tr>
                            <th>Work type</th>
                            <th>Est</th>
                            <th>Actual</th>
                            <th>Var</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(p.subphases || []).map(s => {
                            const sv = (s.actual || 0) - (s.est || 0)
                            return (
                              <tr key={s.name}>
                                <td>{s.name}</td>
                                <td>{s.est || 0}h</td>
                                <td className={styles.actualCell}>{s.actual || 0}h</td>
                                <td>
                                  {s.variance_note
                                    ? <span className={styles.varNote}>Unscoped</span>
                                    : <Variance est={s.est} actual={s.actual || 0} />
                                  }
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      {p.variance_note && (
                        <div className={styles.phaseWarning}>⚠ {p.variance_note}</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ROLES */}
        {tab === 'roles' && (
          <div>
            <Card>
              <SectionHeader title="Hours by role (actual)" />
              {Object.entries(tot.roles_actual).filter(([, h]) => h > 0).map(([role, hrs]) => {
                const total = Object.values(tot.roles_actual).reduce((a, b) => a + b, 0)
                const pct   = Math.round(hrs / total * 100)
                const rate  = engine.rates?.[role] || 0
                return (
                  <div key={role} className={styles.roleRow}>
                    <div className={styles.roleDotLg} style={{ background: ROLE_COLORS[role] || '#888' }} />
                    <div className={styles.roleInfo}>
                      <div className={styles.roleName}>{role}</div>
                      <div className={styles.roleBar}>
                        <div className={styles.roleBarFill} style={{ width: `${pct}%`, background: ROLE_COLORS[role] }} />
                      </div>
                    </div>
                    <div className={styles.roleStats}>
                      <div className={styles.roleHrs}>{hrs}h</div>
                      <div className={styles.rolePct}>{pct}%</div>
                      {rate > 0 && <div className={styles.roleCost}>${Math.round(hrs * rate).toLocaleString()}</div>}
                    </div>
                  </div>
                )
              })}
            </Card>

            <Card>
              <SectionHeader title="Role intensity by phase" sub="Hours each role contributed per phase" />
              {BP.phases.map(p => {
                const pr = p.roles_actual || {}
                const pt = Object.values(pr).reduce((a, b) => a + b, 0) || 1
                return (
                  <div key={p.phase} className={styles.heatRow}>
                    <div className={styles.heatLabel}>{p.phase}</div>
                    <div className={styles.heatCells}>
                      {['Architect', 'Expert', 'Integrator'].map(r => {
                        const h   = pr[r] || 0
                        const pct = Math.round(h / pt * 100)
                        const opacity = pct >= 50 ? 0.8 : pct >= 25 ? 0.45 : pct > 0 ? 0.2 : 0
                        return (
                          <div key={r} className={styles.heatCell}
                            style={{ background: opacity > 0 ? `rgba(232,114,42,${opacity})` : 'transparent' }}>
                            {h > 0 ? h + 'h' : '—'}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              <div className={styles.heatHeaders}>
                <div className={styles.heatHeaderSpacer} />
                {['Architect', 'Expert', 'Integrator'].map(r => (
                  <div key={r} className={styles.heatHeaderCell} style={{ color: ROLE_COLORS[r] }}>{r}</div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* INSIGHTS */}
        {tab === 'insights' && (
          <div>
            {(BP.insights || []).map((ins, i) => {
              const icons = { overrun: '⚠', accurate: '✓', underrun: '↓', role_shift: '⟳', pattern: '📊' }
              const clrs  = { overrun: 'var(--red)', accurate: 'var(--green)', underrun: 'var(--green)', role_shift: 'var(--blue)', pattern: 'var(--amber)' }
              return (
                <div key={i} className={styles.insightCard} style={{ borderLeftColor: clrs[ins.type] || 'var(--orange)' }}>
                  <div className={styles.insightIcon}>{icons[ins.type] || '•'}</div>
                  <div>
                    <div className={styles.insightPhase}>{ins.phase}</div>
                    <div className={styles.insightText}>{ins.text}</div>
                  </div>
                </div>
              )
            })}

            <Card>
              <SectionHeader title="Key estimating takeaway" />
              <div className={styles.takeaway}>
                Post-cutover support was absent from the original scope and ran to <strong>184 hours</strong> — 3.8× the cutover estimate.
                Future projects of this type should budget post-cutover support at a minimum of <strong style={{ color: 'var(--orange)' }}>10–15% of total project hours</strong>.
                Testing &amp; UAT represented <strong>26%</strong> of actual hours, consistent with the 21–28% range seen across all reimplementation projects in the 2025 dataset.
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
