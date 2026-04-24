import React from 'react'
import styles from './UI.module.css'

/* ── Card ────────────────────────────────────────────────────── */
export function Card({ children, className = '', accent }) {
  return (
    <div
      className={`${styles.card} ${className}`}
      style={accent ? { borderTop: `3px solid ${accent}` } : {}}
    >
      {children}
    </div>
  )
}

/* ── Section label ───────────────────────────────────────────── */
export function Label({ children }) {
  return <div className={styles.label}>{children}</div>
}

/* ── Metric card ─────────────────────────────────────────────── */
export function MetricCard({ label, value, sub, intent }) {
  const intentColor = {
    good: 'var(--green)',
    warn: 'var(--amber)',
    bad:  'var(--red)',
    info: 'var(--blue)',
  }[intent] || 'var(--mid-gray)'
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
      {sub && <div className={styles.metricSub} style={{ color: intentColor }}>{sub}</div>}
    </div>
  )
}

/* ── Pill / badge ────────────────────────────────────────────── */
export function Pill({ children, intent = 'default' }) {
  return <span className={`${styles.pill} ${styles['pill_'+intent]}`}>{children}</span>
}

/* ── Toggle chip ─────────────────────────────────────────────── */
export function Chip({ children, active, onClick }) {
  return (
    <button
      className={`${styles.chip} ${active ? styles.chipActive : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

/* ── Toggle switch row ───────────────────────────────────────── */
export function ToggleRow({ label, sublabel, checked, onChange }) {
  return (
    <div className={styles.toggleRow} onClick={() => onChange(!checked)}>
      <div className={styles.toggleText}>
        <div className={styles.toggleLabel}>{label}</div>
        {sublabel && <div className={styles.toggleSub}>{sublabel}</div>}
      </div>
      <div className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}>
        <div className={styles.toggleThumb} />
      </div>
    </div>
  )
}

/* ── Select ──────────────────────────────────────────────────── */
export function Select({ label, value, onChange, options }) {
  return (
    <div className={styles.field}>
      {label && <Label>{label}</Label>}
      <select className={styles.select} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  )
}

/* ── Number input ────────────────────────────────────────────── */
export function NumberInput({ label, value, onChange, min, max, step, suffix }) {
  return (
    <div className={styles.field}>
      {label && <Label>{label}</Label>}
      <div className={styles.inputWrap}>
        <input
          type="number"
          className={styles.input}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className={styles.inputSuffix}>{suffix}</span>}
      </div>
    </div>
  )
}

/* ── Section header ──────────────────────────────────────────── */
export function SectionHeader({ title, sub, action }) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <div className={styles.sectionTitle}>{title}</div>
        {sub && <div className={styles.sectionSub}>{sub}</div>}
      </div>
      {action}
    </div>
  )
}

/* ── Button ──────────────────────────────────────────────────── */
export function Button({ children, onClick, variant = 'primary', fullWidth, disabled }) {
  return (
    <button
      className={`${styles.btn} ${styles['btn_'+variant]} ${fullWidth ? styles.btnFull : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

/* ── Horizontal rule ─────────────────────────────────────────── */
export function Divider() {
  return <div className={styles.divider} />
}

/* ── Variance display ────────────────────────────────────────── */
export function Variance({ est, actual }) {
  if (!est && !actual) return null
  const v = (actual || 0) - (est || 0)
  const cls = v > 20 ? styles.varOver : v < -20 ? styles.varUnder : styles.varMatch
  const str = v === 0 ? '—' : (v > 0 ? '+' : '') + v + 'h'
  return <span className={`${styles.variance} ${cls}`}>{str}</span>
}

/* ── Role mix bar ────────────────────────────────────────────── */
export const ROLE_COLORS = {
  Architect:       '#E8722A',
  Expert:          '#4A90D9',
  Integrator:      '#4CAF7D',
  Specialist:      '#F5A623',
  'Project Manager': '#9B59B6',
}

export function RoleMixBar({ roleHours, height = 12 }) {
  const total = Object.values(roleHours).reduce((a, b) => a + b, 0)
  if (!total) return null
  return (
    <div style={{ display: 'flex', height, borderRadius: 4, overflow: 'hidden', background: 'var(--border)' }}>
      {Object.entries(roleHours)
        .filter(([, h]) => h > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([role, hrs]) => (
          <div
            key={role}
            title={`${role}: ${hrs}h (${Math.round(hrs / total * 100)}%)`}
            style={{
              width: `${hrs / total * 100}%`,
              background: ROLE_COLORS[role] || '#888',
              minWidth: 2,
            }}
          />
        ))}
    </div>
  )
}
