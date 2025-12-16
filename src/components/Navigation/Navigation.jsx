 import React from 'react'

const Navigation = ({ activeModule, setActiveModule }) => {
  const navItems = [
    { id: 'market', label: '市场排名', icon: '📈' },
    { id: 'news', label: '新闻资讯', icon: '📰' },
    { id: 'settings', label: '设置', icon: '⚙️' }
  ]

  return (
    <nav className="top-navigation">
      <div className="top-nav-container">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`top-nav-item ${activeModule === item.id ? 'active' : ''}`}
            onClick={() => setActiveModule(item.id)}
            aria-label={item.label}
          >
            <span className="top-nav-icon">{item.icon}</span>
            <span className="top-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default Navigation