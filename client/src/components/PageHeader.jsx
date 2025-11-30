import React from 'react'

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <header style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>{title}</h1>
          {subtitle && <div className="small muted" style={{ marginTop: 6 }}>{subtitle}</div>}
        </div>
        <div>
          {actions}
        </div>
      </div>
    </header>
  )
}

export default PageHeader
