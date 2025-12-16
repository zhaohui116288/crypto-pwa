 import React, { useState, useEffect } from 'react'
import CryptoRankings from './components/MarketRanking/CryptoRankings'
import NewsModule from './components/News/NewsModule'
import SettingsModule from './components/Settings/SettingsModule'
import Navigation from './components/Navigation/Navigation'
import './styles/main.css'

const App = () => {
  const [activeModule, setActiveModule] = useState('market')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [appTheme, setAppTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'auto'
  })
  const [timestamp, setTimestamp] = useState(new Date())

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const handleThemeChange = (theme) => {
    setAppTheme(theme)
    localStorage.setItem('app-theme', theme)
  }

  const modules = {
    market: {
      id: 'market',
      label: '市场排名',
      icon: '📈',
      component: <CryptoRankings />
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
      <Navigation
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />
      
      <main className="main-content">
        {!isOnline && (
          <div className="offline-banner">
            ⚠️ 当前处于离线模式，显示最后缓存数据
          </div>
        )}

        <div className="module-header">
          <h1>{modules[activeModule].label}</h1>
          <span className="module-icon">{modules[activeModule].icon}</span>
        </div>
        
        <div className="module-content">
          {modules[activeModule].component}
        </div>

        <div className="timestamp">
          页面最后同步: {timestamp.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </main>
    </div>
  )
}

export default App