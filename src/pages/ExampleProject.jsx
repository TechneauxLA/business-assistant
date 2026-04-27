import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, SectionHeader, Pill, RoleMixBar, ROLE_COLORS, Variance } from '../components/UI'
import { useEngine } from '../lib/useEngine'
import styles from './ExampleProject.module.css'

export default function ExampleProject() {
  const navigate   = useNavigate()
  const { id }     = useParams()
  const engine     = useEngine()
  const proj       = engine.example_projects?.[id]
  const [tab, setTab] = useState('overview')
  const [expanded, setExpanded] = useState(new Set([0]))

  if (!proj) return <div className={styles.empty}>No example project data found for "{id}".</div>

  const tot = proj.totals
  const hasEstimates = !!tot.estimated_hrs

  const tabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'phases',    label: 'Phases' },
    { id: 'roles',     label: 'Roles' },
    { id: 'insights',  label: 'Insights' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Header */}
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate('/estimator')}>← Back</button>
          <div className={styles.projectName}>{proj.name}</div>
          <div className={styles.projectMeta}>
            <span>{proj.project_type}</span>
            <span>·</span>
            <span>{proj.platform}</span>
            <Pill intent="good">Completed</Pill>
          </div>
          {proj.scope_note && (
            <div className={styles.scopeNote}>{proj.scope_note}</div>
          )}
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
            {/* Metrics grid */}
            <div className={styles.metricsGrid}>
              {hasEstimates && (
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Estimated</div>
                  <div className={styles.metricValue}>{tot.estimated_hrs}h</div>
                  <div className={styles.metricSub}>Original proposal</div>
                </div>
              )}
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Actual</div>
                <div className={styles.metricValue}>{tot.actual_hrs}h</div>
                {hasEstimates && (
                  <div className={styles.metricSub} style={{ color: tot.variance_hrs <= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {tot.variance_hrs > 0 ? '+' : ''}{tot.variance_hrs}h ({tot.variance_pct}%)
                  </div>
                )}
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Blended Rate</div>
                <div className={styles.metricValue}>${tot.blended_rate}/hr</div>
                <div className={styles.metricSub}>Weighted avg billing</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Revenue / Member</div>
                <div className={styles.metricValue}>${tot.revenue_per_member?.toLocaleString()}</div>
                <div className={styles.metricSub}>{tot.team_size} team members</div>
              </div>
            </div>

            {/* Cost summary */}
            <Card>
              <SectionHeader title="Financial summary" />
              <div className={styles.financialRows}>
                <div className={styles.financialRow}>
                  <span className={styles.financialLabel}>Labor cost (at standard rates)</span>
                  <span className={styles.financialValue}>${tot.actual_cost?.toLocaleString()}</span>
                </div>
                {tot.invoiced_revenue && (
                  <div className={styles.financialRow}>
                    <span className={styles.financialLabel}>Invoiced revenue</span>
                    <span className={styles.financialValue} style={{ color: 'var(--green)' }}>
                      ${tot.invoiced_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {tot.invoiced_revenue && tot.actual_cost && (
                  <div className={styles.financialRow}>
                    <span className={styles.financialLabel}>Margin above labor cost</span>
                    <span className={styles.financialValue} style={{ color: 'var(--orange)' }}>
                      +{Math.round((tot.invoiced_revenue / tot.actual_cost - 1) * 100)}%
                    </span>
                  </div>
                )}
                {tot.integrator_rate_note && (
                  <div className={styles.rateNote}>ⓘ {tot.integrator_rate_note}</div>
                )}
              </div>
            </Card>

            {/* Est vs Actual chart — only when estimates exist */}
            {hasEstimates && (
              <Card>
                <SectionHeader title="Estimate vs actual by phase" />
                {proj.phases.map(p => {
                  const estH = p.estimated_hrs || 0
                  const actH = p.actual_hrs || 0
                  const maxH = Math.max(...proj.phases.map(x => Math.max(x.estimated_hrs || 0, x.actual_hrs || 0)))
                  const vr   = actH - estH
                  const isOver = vr > 20
                  return (
                    <div key={p.phase} className={styles.wfRow}>
                      <div className={styles.wfLabel}>{p.phase}</div>
                      <div className={styles.wfBars}>
                        {estH > 0 && <div className={styles.wfEst} style={{ width: `${estH / maxH * 100}%` }} />}
                        <div
                          className={`${styles.wfAct} ${isOver ? styles.wfOver : ''}`}
                          style={{ width: `${actH / maxH * 100}%` }}
                        />
                      </div>
                      <div className={styles.wfVals}>
                        {estH > 0 && <span>{estH}h</span>}
                        <span style={{ color: isOver ? 'var(--red)' : vr < -20 ? 'var(--green)' : 'var(--mid-gray)' }}>
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
            )}

            {/* Role mix */}
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
            {proj.phases.map((p, i) => {
              const vr         = p.actual_hrs - (p.estimated_hrs || 0)
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
                            // Estimate-only detail row (no actual data)
                            if (s.est_only) {
                              return (
                                <tr key={s.name} className={styles.estOnlyRow}>
                                  <td className={styles.estOnlyName}>↳ {s.name}</td>
                                  <td>{s.est}h</td>
                                  <td className={styles.estOnlyDash}>—</td>
                                  <td className={styles.estOnlyDash}>est only</td>
                                </tr>
                              )
                            }
                            // Child row — indented, has both est and actual
                            if (s.child_item) {
                              return (
                                <tr key={s.name} className={styles.childRow}>
                                  <td className={styles.childName}>↳ {s.name}</td>
                                  <td>{s.est != null ? s.est + 'h' : '—'}</td>
                                  <td className={styles.childActual}>{s.actual != null ? s.actual + 'h' : '—'}</td>
                                  <td>
                                    {s.variance_note
                                      ? <span className={styles.varNote}>Unscoped</span>
                                      : <Variance est={s.est} actual={s.actual} />
                                    }
                                  </td>
                                </tr>
                              )
                            }
                            // Standard subphase row
                            return (
                              <tr key={s.name}>
                                <td>{s.name}</td>
                                <td>{s.est != null ? s.est + 'h' : '—'}</td>
                                <td className={styles.actualCell}>{s.actual != null ? s.actual + 'h' : '—'}</td>
                                <td>
                                  {s.variance_note
                                    ? <span className={styles.varNote}>Unscoped</span>
                                    : <Variance est={s.est} actual={s.actual} />
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
              {proj.phases.map(p => {
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
            {(proj.insights || []).map((ins, i) => {
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
          </div>
        )}
      </div>
    </div>
  )
}
