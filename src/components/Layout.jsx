import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './Layout.module.css'

const NAV_ITEMS = [
  { path: '/estimator', label: 'Estimator', icon: IconEstimator },
  { path: '/settings',  label: 'Settings',  icon: IconSettings  },
]

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className={styles.app}>
      {/* Top header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <LogoMark />
          <div>
            <div className={styles.company}>
              <span className={styles.companyTech}>TECH</span>
              <span className={styles.companyNeaux}>NEAUX</span>
            </div>
            <div className={styles.tagline}>TECHNOLOGY SERVICES</div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className={styles.main}>
        {children}
      </main>

      {/* Bottom navigation — mobile first */}
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname.startsWith(path)
          return (
            <NavItem key={path} path={path} label={label} active={active}>
              <Icon />
            </NavItem>
          )
        })}
      </nav>
    </div>
  )
}

function NavItem({ path, label, active, children }) {
  const navigate = useNavigate()
  return (
    <button
      className={`${styles.navItem} ${active ? styles.navActive : ''}`}
      onClick={() => navigate(path)}
      aria-label={label}
    >
      <span className={styles.navIcon}>{children}</span>
      <span className={styles.navLabel}>{label}</span>
    </button>
  )
}

function LogoMark() {
  return (
    <svg width="42" height="35" viewBox="0 0 42 35" fill="none">
      {/* Gray band: upper-left to lower-right (background layer) */}
      <path d="M0 0 L12 0 L42 35 L30 35 Z" fill="#666666"/>
      {/* Orange band: upper-right to lower-left (foreground layer) */}
      <path d="M30 0 L42 0 L12 35 L0 35 Z" fill="#E8722A"/>
    </svg>
  )
}

function IconEstimator() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 12h8M8 8h8M8 16h5" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  )
}
