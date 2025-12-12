import React, { useState, useEffect, useCallback } from 'react'

const OnChainRanking = () => {
  const [activeMetric, setActiveMetric] = useState('active_addresses')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState('demo')
  const [lastUpdated, setLastUpdated] = useState(null)

  const metrics = [
    { 
      id: 'active_addresses', 
      label: '活跃地址数', 
      description: '24小时链上活跃地址数量',
      icon: '👥'
    },
    { 
      id: 'transaction_count', 
      label: '交易笔数', 
      description: '24小时链上交易数量',
      icon: '🔄'
    },
    { 
      id: 'gas_used', 
      label: 'Gas消耗', 
      description: '网络燃料消耗量',
      icon: '⛽'
    },
    { 
      id: 'nft_volume', 
      label: 'NFT交易量', 
      description: 'NFT市场交易额',
      icon: '🖼️'
    }
  ]

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // 这里暂时使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const demoData = getDemoData(activeMetric)
      setData(demoData)
      setDataSource('demo')
      setLastUpdated(new Date())
    } catch (error) {
      console.error('On-chain data error:', error)
      const demoData = getDemoData(activeMetric)
      setData(demoData)
      setDataSource('demo')
    } finally {
      setLoading(false)
    }
  }, [activeMetric])

  useEffect(() => {
    loadData()
    
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [loadData])

  const getDemoData = (metric) => {
    const baseData = [
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
      { id: 'ethereum', name: 'Ethereum', symbol: 'eth', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
      { id: 'binancecoin', name: 'BNB', symbol: 'bnb', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
      { id: 'solana', name: 'Solana', symbol: 'sol', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
      { id: 'cardano', name: 'Cardano', symbol: 'ada', image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' }
    ]

    const metricRanges = {
      active_addresses: { min: 50000, max: 1000000 },
      transaction_count: { min: 100000, max: 3000000 },
      gas_used: { min: 1000000000, max: 50000000000 },
      nft_volume: { min: 500000, max: 50000000 }
    }

    return baseData.map((coin, index) => {
      const range = metricRanges[metric] || metricRanges.active_addresses
      const baseValue = range.min + (range.max - range.min) * (1 - index / baseData.length)
      const variation = 0.8 + Math.random() * 0.4
      const value = Math.round(baseValue * variation)
      const change = (Math.random() * 20 - 10).toFixed(1)
      
      const trends = ['up', 'down', 'stable', 'volatile']
      const trend = trends[Math.floor(Math.random() * trends.length)]
      
      return {
        ...coin,
        value,
        change: parseFloat(change),
        trend,
        timestamp: new Date().toISOString()
      }
    }).sort((a, b) => b.value - a.value)
  }

  const formatMetricValue = (value, metric) => {
    const formatters = {
      active_addresses: (v) => `${(v / 1000).toFixed(1)}K`,
      transaction_count: (v) => `${(v / 1000).toFixed(1)}K`,
      gas_used: (v) => `${(v / 1e9).toFixed(2)}B`,
      nft_volume: (v) => `$${(v / 1e6).toFixed(2)}M`
    }
    
    const formatter = formatters[metric] || ((v) => v.toLocaleString())
    return formatter(value)
  }

  const renderTrendIndicator = (trend) => {
    const trends = {
      up: '📈',
      down: '📉',
      stable: '➡️',
      volatile: '⚡'
    }
    return trends[trend] || '📊'
  }

  return (
    <div className="on-chain-ranking">
      <div className="on-chain-header">
        <div className="data-status">
          <span className="status-label">数据源:</span>
          <span className={`status-value ${dataSource}`}>
            {dataSource === 'api' ? '实时API' : '演示数据'}
          </span>
          {lastUpdated && (
            <span className="update-time">
              更新于 {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      <div className="metric-selector">
        {metrics.map(metric => (
          <button
            key={metric.id}
            className={`metric-btn ${activeMetric === metric.id ? 'active' : ''}`}
            onClick={() => setActiveMetric(metric.id)}
          >
            <span className="metric-btn-icon">{metric.icon}</span>
            <span className="metric-btn-label">{metric.label}</span>
          </button>
        ))}
      </div>

      <div className="on-chain-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>正在获取链上数据...</p>
          </div>
        ) : (
          <>
            <div className="metric-info">
              <h3>
                <span className="metric-icon">
                  {metrics.find(m => m.id === activeMetric)?.icon}
                </span>
                {metrics.find(m => m.id === activeMetric)?.label}
              </h3>
              <p className="metric-description">
                {metrics.find(m => m.id === activeMetric)?.description}
              </p>
            </div>

            <div className="on-chain-list">
              {data.map((item, index) => (
                <div key={item.id} className="on-chain-item">
                  <div className="rank-badge">
                    <span className="rank-number">{index + 1}</span>
                  </div>
                  
                  <div className="coin-info">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="coin-icon"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%234361ee"/></svg>'
                      }}
                    />
                    <div className="coin-details">
                      <span className="coin-name">{item.name}</span>
                      <span className="coin-symbol">{item.symbol.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div className="metric-value">
                    <div className="value-main">
                      {formatMetricValue(item.value, activeMetric)}
                    </div>
                    <div className="value-change">
                      {item.change !== undefined && (
                        <span className={`change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                          {item.change >= 0 ? '↑' : '↓'} {Math.abs(item.change).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="trend-indicator">
                    {renderTrendIndicator(item.trend)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      {dataSource === 'demo' && (
        <div className="demo-notice">
          <p>⚠️ 当前显示演示数据，真实API正在调试中</p>
          <button onClick={loadData} className="retry-btn">
            重试连接真实API
          </button>
        </div>
      )}
    </div>
  )
}

export default OnChainRanking