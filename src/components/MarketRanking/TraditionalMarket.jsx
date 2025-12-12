import React, { useState, useEffect, useCallback } from 'react'
import { fetchMarketData } from '../../services/api/coingecko'

const TraditionalMarket = () => {
  const [activeTab, setActiveTab] = useState('market_cap')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const tabs = [
    { id: 'market_cap', label: '市值排名', icon: '📈' },
    { id: 'volume', label: '交易量', icon: '💰' },
    { id: 'gainers', label: '涨幅榜', icon: '🚀' },
    { id: 'losers', label: '跌幅榜', icon: '📉' }
  ]

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const marketData = await fetchMarketData(50)
      setData(marketData)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Fetch error:', err)
      setError('数据加载失败，请检查网络连接')
      // 使用模拟数据
      setData(getMockData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const getMockData = () => {
    const coins = [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 45000, market_cap: 882000000000, price_change_percentage_24h: 2.5 },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 2500, market_cap: 300000000000, price_change_percentage_24h: 1.8 },
      { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', current_price: 320, market_cap: 49000000000, price_change_percentage_24h: -0.5 },
      { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 95, market_cap: 41000000000, price_change_percentage_24h: 5.2 },
      { id: 'cardano', symbol: 'ada', name: 'Cardano', image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png', current_price: 0.55, market_cap: 19500000000, price_change_percentage_24h: -1.2 }
    ]
    
    return coins.map((coin, index) => ({
      ...coin,
      market_cap_rank: index + 1,
      total_volume: Math.random() * 1000000000 + 500000000
    }))
  }

  return (
    <div className="traditional-market">
      <div className="market-header">
        <div className="refresh-info">
          <span className="last-update">
            最后更新: {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
          </span>
          <button 
            className="refresh-btn"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? '🔄' : '🔄'}
          </button>
        </div>
      </div>

      <div className="tab-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="market-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>正在加载数据...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchData} className="retry-btn">重试</button>
          </div>
        ) : (
          <div className="crypto-list">
            {data.map((crypto, index) => (
              <div key={crypto.id} className="crypto-card" onClick={() => console.log('选择:', crypto.name)}>
                <div className="rank-badge">
                  <span className="rank-number">{index + 1}</span>
                </div>
                
                <div className="coin-info">
                  <img 
                    src={crypto.image} 
                    alt={crypto.name}
                    className="coin-icon"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%234361ee"/></svg>'
                    }}
                  />
                  <div className="coin-details">
                    <span className="coin-name">{crypto.name}</span>
                    <span className="coin-symbol">{crypto.symbol.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="price-info">
                  <div className="price-main">
                    ${crypto.current_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`price-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                    {crypto.price_change_percentage_24h >= 0 ? '↗' : '↘'} 
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TraditionalMarket