import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, SectionHeader, Pill } from '../components/UI'
import ENGINE from '../data/estimationEngine.json'
import styles from './Estimator.module.css'

export default function Estimator() {
  const navigate = useNavigate()
  const bp = ENGINE.example_projects?.BP_HPU_STD

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
              <div className={styles.statValue}>94,753h</div>
              <div className={styles.statLabel}>Hours analyzed</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>3</div>
              <div className={styles.statLabel}>Project types</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>7</div>
              <div className={styles.statLabel}>Phase categories</div>
            </div>
          </div>
        </Card>

        {/* Example project */}
        {bp && (
          <Card>
            <SectionHeader
              title="Example project"
              sub="Real estimate vs actual data"
              action={<Pill intent="good">Completed</Pill>}
            />
            <button
              className={styles.exampleCard}
              onClick={() => navigate('/estimator/example/BP_HPU_STD')}
            >
              <div className={styles.exampleName}>{bp.name}</div>
              <div className={styles.exampleType}>{bp.project_type} · {bp.platform}</div>
              <div className={styles.exampleMeta}>
                <span>Est: {bp.totals.estimated_hrs}h</span>
                <span>·</span>
                <span>Actual: {bp.totals.actual_hrs}h</span>
                <span>·</span>
                <span style={{ color: bp.totals.variance_hrs < 0 ? 'var(--green)' : 'var(--red)' }}>
                  {bp.totals.variance_hrs > 0 ? '+' : ''}{bp.totals.variance_hrs}h
                </span>
              </div>
              <div className={styles.exampleArrow}>View full breakdown →</div>
            </button>
          </Card>
        )}

        {/* Project type reference */}
        <Card>
          <SectionHeader title="Historical phase splits" sub="% of total hours by project type" />
          {Object.entries(ENGINE.phase_pcts_by_type || {}).map(([type, pcts]) => (
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
