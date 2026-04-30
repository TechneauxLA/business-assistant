import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, SectionHeader, Pill } from '../components/UI'
import { useEngine } from '../lib/useEngine'
import styles from './Estimator.module.css'

export default function Estimator() {
  const navigate = useNavigate()
  const engine   = useEngine()

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

        {/* Project type reference */}
        <Card>
          <SectionHeader title="Historical phase splits" sub="% of total hours by project type" />
          {Object.entries(engine.phase_pcts_by_type || {}).map(([type, pcts]) => (
            <div key={type} className={styles.typeBlock}>
              <div className={styles.typeName}>{type}</div>
              {Object.entries(pcts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([phase, pct]) => (
                  <div key={phase} className={styles.phaseRow}>
                    <div className={styles.phaseLabel}>{phase}</div>
                    <div className={styles.phaseBar}>
                      <div className={styles.phaseBarFill} style={{ width: `${pct}%` }} />
                    </div>
                    <div className={styles.phasePct}>{pct}%</div>
                  </div>
                ))}
            </div>
          ))}
        </Card>

      </div>
    </div>
  )
}
