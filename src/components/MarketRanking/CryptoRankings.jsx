 import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchMarketData, fetchByVolume } from '../../services/api/coingecko'

const CryptoRankings = () => {
  const [activeTab, setActiveTab] = useState('market_cap')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [displayLimit, setDisplayLimit] = useState(20)

  const tabs = [
    { 
      id: 'market_cap', 
      label: '市值排名', 
      icon: '📈',
      description: '按市值排序',
      apiMethod: fetchMarketData
    },
    { 
      id: 'volume', 
      label: '交易量', 
      icon: '💰',
      description: '按24h交易量排序',
      apiMethod: fetchByVolume
    },
    { 
      id: 'gainers', 
      label: '涨幅榜', 
      icon: '🚀',
      description: '24小时涨幅最大',
      apiMethod: fetchMarketData
    },
    { 
      id: 'losers', 
      label: '跌幅榜', 
      icon: '📉',
      description: '24小时跌幅最大',
      apiMethod: fetchMarketData
    }
  ]

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let apiData = []
      const currentTab = tabs.find(tab => tab.id === activeTab)
      
      if (currentTab) {
        apiData = await currentTab.apiMethod(100)
      }
      
      if (!apiData || apiData.length === 0) {
        throw new Error('未获取到数据')
      }
      
      const processedData = apiData.map(item => ({
        id: item.id || '',
        symbol: item.symbol || '',
        name: item.name || '',
        image: item.image || `https://assets.coingecko.com/coins/images/1/large/bitcoin.png`,
        current_price: item.current_price || 0,
        market_cap: item.market_cap || 0,
        market_cap_rank: item.market_cap_rank || 0,
        total_volume: item.total_volume || 0,
        price_change_percentage_24h: item.price_change_percentage_24h || 0,
        circulating_supply: item.circulating_supply || 0,
        ath: item.ath || 0,
        ath_change_percentage: item.ath_change_percentage || 0
      }))
      
      setData(processedData)
      setLastUpdated(new Date())
      
    } catch (err) {
      console.error('API Error:', err)
      setError(`数据加载失败: ${err.message}`)
      
      if (data.length === 0) {
        console.log('使用模拟数据')
        setData(getMockData())
      }
    } finally {
      setLoading(false)
    }
  }, [activeTab, data.length])

  const getSortedData = useMemo(() => {
    if (data.length === 0) return []
    
    let sortedData = [...data]
    
    switch (activeTab) {
      case 'market_cap':
        sortedData.sort((a, b) => (a.market_cap_rank || 9999) - (b.market_cap_rank || 9999))
        break
      case 'volume':
        break
      case 'gainers':
        sortedData.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
        break
      case 'losers':
        sortedData.sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
        break
      default:
        sortedData.sort((a, b) => (a.market_cap_rank || 9999) - (b.market_cap_rank || 9999))
    }
    
    if (activeTab === 'gainers' || activeTab === 'losers') {
      sortedData = sortedData.filter(item => item.price_change_percentage_24h !== null)
    }
    
    return sortedData.slice(0, displayLimit)
  }, [data, activeTab, displayLimit])

  const getMockData = () => {
    return [
      { 
        id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', 
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', 
        current_price: 45000, market_cap: 882000000000, market_cap_rank: 1,
        total_volume: 25000000000, price_change_percentage_24h: 2.5
      },
      { 
        id: 'ethereum', symbol: 'eth', name: 'Ethereum', 
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', 
        current_price: 2500, market_cap: 300000000000, market_cap_rank: 2,
        total_volume: 15000000000, price_change_percentage_24h: 1.8
      }
    ]
  }

  const handleRefresh = () => {
    fetchData()
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
  }

  const handleLimitChange = (newLimit) => {
    setDisplayLimit(newLimit)
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchData, 60000)
    }
    return () => clearInterval(interval)
  }, [autoRefresh, activeTab])

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '$0.00'
    const absNum = Math.abs(num)
    if (absNum >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (absNum >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (absNum >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (absNum >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    if (absNum < 1) return `$${num.toFixed(4)}`
    return `$${num.toFixed(2)}`
  }

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '$0.00'
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const displayData = getSortedData
  const currentTab = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="crypto-rankings">
      <div className="rankings-header">
        <div className="header-left">
          <h2>加密货币排名</h2>
          {currentTab && (
            <p className="tab-description">{currentTab.description}</p>
          )}
        </div>
        
        <div className="header-controls">
          <div className="refresh-controls">
            <span className="last-update">
              {lastUpdated ? `更新: ${lastUpdated.toLocaleTimeString()}` : '正在加载...'}
            </span>
            <button 
              className={`refresh-btn ${loading ? 'loading' : ''}`}
              onClick={handleRefresh}
              disabled={loading}
              title="手动刷新"
            >
              {loading ? (
                <>
                  <span className="spinner-mini"></span>
                  <span className="btn-text">加载中</span>
                </>
              ) : (
                <>
                  <span className="icon">🔄</span>
                  <span className="btn-text">刷新</span>
                </>
              )}
            </button>
            <button 
              className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
              onClick={toggleAutoRefresh}
              title={autoRefresh ? '关闭自动刷新 (60秒/次)' : '开启自动刷新'}
            >
              {autoRefresh ? '⏸️' : '▶️'}
            </button>
          </div>
          
          <div className="limit-controls">
            <span className="limit-label">显示数量:</span>
            {[10, 20, 50].map(limit => (
              <button
                key={limit}
                className={`limit-btn ${displayLimit === limit ? 'active' : ''}`}
                onClick={() => handleLimitChange(limit)}
              >
                {limit}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tab-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.description}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="rankings-content">
        {loading && data.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>正在从 CoinGecko 加载实时数据...</p>
            <p className="loading-sub">请稍候，正在获取最新市场数据</p>
          </div>
        ) : error && data.length === 0 ? (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <p className="fallback-notice">显示模拟数据供参考</p>
            <button onClick={handleRefresh} className="retry-btn">重新加载</button>
          </div>
        ) : (
          <>
            {error && (
              <div className="warning-banner">
                <span className="warning-icon">⚠️</span>
                <span>数据加载异常：{error}，显示缓存/模拟数据</span>
              </div>
            )}
            
            <div className="stats-summary">
              <div className="stat-item">
                <span className="stat-label">总币种数:</span>
                <span className="stat-value">{displayData.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">更新时间:</span>
                <span className="stat-value">{lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}</span>
              </div>
            </div>
            
            <div className="crypto-list">
              <div className="list-header">
                <div className="header-rank">排名</div>
                <div className="header-name">币种</div>
                <div className="header-price">价格</div>
                <div className="header-change">24h涨跌</div>
                <div className="header-marketcap">市值</div>
                <div className="header-volume">24h交易量</div>
              </div>
              
              {displayData.map((crypto, index) => (
                <div 
                  key={`${crypto.id}-${index}`} 
                  className="crypto-row"
                  onClick={() => console.log('查看详情:', crypto.name)}
                  title={`点击查看 ${crypto.name} 详情`}
                >
                  <div className="rank-cell">
                    <div className="rank-number">
                      {activeTab === 'market_cap' ? crypto.market_cap_rank : index + 1}
                    </div>
                  </div>
                  
                  <div className="name-cell">
                    <img 
                      src={crypto.image} 
                      alt={crypto.name}
                      className="coin-icon"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23666"/></svg>'
                      }}
                    />
                    <div className="coin-details">
                      <span className="coin-name">{crypto.name}</span>
                      <span className="coin-symbol">{crypto.symbol.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div className="price-cell">
                    <div className="price-main">
                      {formatPrice(crypto.current_price)}
                    </div>
                  </div>
                  
                  <div className="change-cell">
                    <div className={`price-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                      <span className="change-icon">
                        {crypto.price_change_percentage_24h >= 0 ? '↗' : '↘'}
                      </span>
                      <span className="change-value">
                        {Math.abs(crypto.price_change_percentage_24h || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="marketcap-cell">
                    <div className="marketcap-value">
                      {formatNumber(crypto.market_cap)}
                    </div>
                  </div>
                  
                  <div className="volume-cell">
                    <div className="volume-value">
                      {formatNumber(crypto.total_volume)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="data-footer">
        <div className="data-source">
          <span className="source-icon">📊</span>
          <span>数据来源: CoinGecko API • 实时更新 • 自动刷新: {autoRefresh ? '开启' : '关闭'}</span>
        </div>
        <div className="data-info">
          <span>共 {displayData.length} 个币种 • 点击任意行查看详情</span>
        </div>
      </div>
    </div>
  )
}

export default CryptoRankings