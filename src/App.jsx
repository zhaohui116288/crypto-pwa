 import React, { useState, useEffect } from 'react'
import TraditionalMarket from './components/MarketRanking/TraditionalMarket'
import OnChainRanking from './components/MarketRanking/OnChainRanking'
import NewsModule from './components/News/NewsModule'
import SettingsModule from './components/Settings/SettingsModule'
import Navigation from './components/Navigation/Navigation'
import './styles/main.css'

const App = () => {
  const [activeModule, setActiveModule] = useState('traditional')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [appTheme, setAppTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'auto'
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const applyTheme = () => {
      if (appTheme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      } else {
        document.documentElement.setAttribute('data-theme', appTheme)
      }
    }

    applyTheme()
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (appTheme === 'auto') applyTheme()
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [appTheme])

  const handleThemeChange = (theme) => {
    setAppTheme(theme)
    localStorage.setItem('app-theme', theme)
  }

  const modules = {
    traditional: {
      id: 'traditional',
      label: '传统市场',
      icon: '📊',
      component: <TraditionalMarket />
    },
    onchain: {
      id: 'onchain',
      label: '链上数据',
      icon: '🔗',
      component: <OnChainRanking />
    },
    news: {
      id: 'news',
      label: '新闻资讯',
      icon: '📰',
      component: <NewsModule />
    },
    settings: {
      id: 'settings',
      label: '设置',
      icon: '⚙️',
      component: <SettingsModule currentTheme={appTheme} onThemeChange={handleThemeChange} />
    }
  }

  return (
    <div className="app-container">
      {!isOnline && (
        <div className="offline-banner">
          ⚠️ 当前处于离线模式，显示最后缓存数据
        </div>
      )}

      <main className="main-content">
        <div className="module-header">
          <h1>{modules[activeModule].label}</h1>
          <span className="module-icon">{modules[activeModule].icon}</span>
        </div>
        
        <div className="module-content">
          {modules[activeModule].component}
        </div>
      </main>

      <Navigation
        activeModule={activeModule}
        modules={Object.values(modules)}
        onModuleChange={setActiveModule}
      />
    {/* 新增：最后更新时间戳 */}
<div style={{
    textAlign: 'center',
    marginTop: '2rem',
    padding: '1rem',
    fontSize: '0.9rem',
    color: '#666',
    borderTop: '1px solid var(--border-color)'
}}>
    页面最后更新于: {new Date().toLocaleString()}
</div>
    </div>
  )
}

export default App