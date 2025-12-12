 import React, { useState } from 'react'

const SettingsModule = ({ currentTheme, onThemeChange }) => {
  const [refreshInterval, setRefreshInterval] = useState('30')

  const handleClearCache = () => {
    if (window.confirm('确定要清除所有缓存数据吗？')) {
      localStorage.clear()
      if (caches && caches.keys) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName)
          })
        })
      }
      alert('缓存已清除！')
    }
  }

  const handleResetSettings = () => {
    if (window.confirm('确定要重置所有设置吗？')) {
      localStorage.removeItem('app-theme')
      localStorage.removeItem('refresh-interval')
      setRefreshInterval('30')
      onThemeChange('auto')
      alert('设置已重置！')
    }
  }

  return (
    <div className="settings-module">
      <h2>应用设置</h2>
      <div className="settings-content">
        <div className="setting-section">
          <h3>外观设置</h3>
          <div className="theme-options">
            <button 
              className={`theme-btn ${currentTheme === 'light' ? 'active' : ''}`}
              onClick={() => onThemeChange('light')}
            >
              🌞 浅色模式
            </button>
            <button 
              className={`theme-btn ${currentTheme === 'dark' ? 'active' : ''}`}
              onClick={() => onThemeChange('dark')}
            >
              🌙 深色模式
            </button>
            <button 
              className={`theme-btn ${currentTheme === 'auto' ? 'active' : ''}`}
              onClick={() => onThemeChange('auto')}
            >
              🔄 自动模式
            </button>
          </div>
        </div>
        
        <div className="setting-section">
          <h3>数据设置</h3>
          <div className="data-options">
            <div className="setting-item">
              <label>自动刷新频率</label>
              <select 
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
              >
                <option value="10">10秒</option>
                <option value="30">30秒</option>
                <option value="60">1分钟</option>
                <option value="300">5分钟</option>
              </select>
            </div>
            <button 
              className="clear-cache-btn"
              onClick={handleClearCache}
            >
              🗑️ 清除缓存
            </button>
            <button 
              className="reset-btn"
              onClick={handleResetSettings}
            >
              🔄 重置所有设置
            </button>
          </div>
        </div>
        
        <div className="setting-section">
          <h3>价格提醒</h3>
          <p className="feature-coming">🚧 价格提醒功能正在开发中</p>
          <div className="alert-preview">
            <div className="alert-item">
              <span>{'BTC > $50,000'}</span>
              <button className="alert-delete">×</button>
            </div>
            <button className="add-alert-btn">+ 添加提醒</button>
          </div>
        </div>
        
        <div className="setting-section">
          <h3>关于</h3>
          <div className="app-info">
            <p><strong>加密货币市场分析器</strong></p>
            <p>版本: 1.0.0</p>
            <p>数据源: CoinGecko API</p>
            <p>链上数据: 演示模式</p>
            <p>PWA支持: 已启用</p>
            <p className="app-links">
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault()
                  alert('隐私政策页面正在开发中')
                }}
              >
                隐私政策
              </a>
              <span> | </span>
              <a 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault()
                  alert('用户协议页面正在开发中')
                }}
              >
                用户协议
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModule