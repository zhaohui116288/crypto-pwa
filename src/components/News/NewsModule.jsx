 import React, { useState, useEffect, useCallback } from 'react'
import { fetchCryptoNews, getNewsCategories, filterNewsByCategory } from '../../services/api/news'

const NewsModule = () => {
  const [news, setNews] = useState([])
  const [filteredNews, setFilteredNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [sources, setSources] = useState([])
  const [stats, setStats] = useState({ total: 0, sources: 0 })

  const categories = getNewsCategories()

  const fetchNews = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)
      
      console.log('开始获取新闻数据...')
      const newsData = await fetchCryptoNews(20)
      
      if (!newsData || newsData.length === 0) {
        throw new Error('暂时无法获取新闻数据')
      }
      
      const sourceSet = new Set()
      newsData.forEach(item => {
        if (item.source) sourceSet.add(item.source)
      })
      const sourceList = Array.from(sourceSet)
      setSources(sourceList.slice(0, 5))
      
      setStats({
        total: newsData.length,
        sources: sourceList.length
      })
      
      setNews(newsData)
      setFilteredNews(filterNewsByCategory(newsData, activeCategory))
      setLastUpdated(new Date())
      
      console.log('新闻获取成功:', newsData.length, '条')
      
    } catch (err) {
      console.error('新闻获取失败:', err)
      setError('新闻加载遇到问题，已显示备用内容')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [activeCategory])

  useEffect(() => {
    if (news.length > 0) {
      const filtered = filterNewsByCategory(news, activeCategory)
      setFilteredNews(filtered)
    }
  }, [activeCategory, news])

  useEffect(() => {
    fetchNews()
  }, [])

  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchNews(false)
      }, 600000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, fetchNews])

  const formatTime = (date) => {
    if (!date) return '未知'
    
    const now = new Date()
    const newsDate = new Date(date)
    const diff = now - newsDate
    
    if (isNaN(diff)) return '未知'
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%234361ee"/><text x="150" y="110" font-family="Arial" font-size="14" fill="white" text-anchor="middle">Crypto News</text></svg>'
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'article': return '📰'
      case 'discussion': return '💬'
      default: return '📄'
    }
  }

  return (
    <div className="news-module">
      <div className="news-header">
        <div className="header-main">
          <h2>加密货币新闻</h2>
          <div className="source-indicator">
            <div className="sources-list">
              {sources.length > 0 ? (
                <span className="source-text">
                  来源: {sources.join(', ')}
                  {stats.sources > 5 && '...'}
                </span>
              ) : (
                <span className="source-text">正在连接新闻源...</span>
              )}
            </div>
            <span className="update-time">
              {lastUpdated ? `更新: ${formatTime(lastUpdated)}` : '正在加载...'}
            </span>
          </div>
        </div>
        
        <div className="header-controls">
          <button 
            className={`refresh-btn ${loading ? 'loading' : ''}`}
            onClick={() => fetchNews(true)}
            disabled={loading}
            title="手动刷新新闻"
          >
            <span className="btn-icon">{loading ? '⏳' : '🔄'}</span>
            <span className="btn-text">{loading ? '加载中...' : '刷新'}</span>
          </button>
          
          <button 
            className={`auto-refresh-btn ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? '关闭自动刷新 (10分钟/次)' : '开启自动刷新'}
          >
            {autoRefresh ? '⏸️' : '▶️'}
          </button>
        </div>
      </div>

      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category}
            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
            title={`筛选 ${category} 新闻`}
          >
            {category}
          </button>
        ))}
      </div>

      {!loading && !error && (
        <div className="stats-bar">
          <span className="stat-item">📊 共 {stats.total} 条新闻</span>
          <span className="stat-item">🏷️ {activeCategory}</span>
          <span className="stat-item">🔄 自动刷新: {autoRefresh ? '开' : '关'}</span>
        </div>
      )}

      <div className="news-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>正在从多个新闻源获取最新资讯...</p>
            <p className="loading-sub">请稍候，正在实时抓取新闻内容</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
            <p className="error-sub">正在显示备用内容</p>
            <button onClick={() => fetchNews(true)} className="retry-btn">
              重新尝试
            </button>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="no-news">
            <div className="no-news-icon">📰</div>
            <p>当前分类暂无新闻</p>
            <p className="no-news-sub">尝试切换分类或稍后刷新</p>
            <button 
              onClick={() => setActiveCategory('All')}
              className="view-all-btn"
            >
              查看所有新闻
            </button>
          </div>
        ) : (
          <div className="news-grid">
            {filteredNews.map((item) => (
              <div 
                key={item.id} 
                className="news-card"
                onClick={() => {
                  if (item.url && !item.url.includes('#')) {
                    window.open(item.url, '_blank', 'noopener,noreferrer')
                  }
                }}
                title={item.url ? '点击查看原文' : '无原文链接'}
              >
                <div className="news-image">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    onError={handleImageError}
                    loading="lazy"
                  />
                  <div className="image-overlay">
                    <span className="news-source">{item.source}</span>
                    <span className="news-type">{getTypeIcon(item.type)}</span>
                  </div>
                </div>
                
                <div className="news-body">
                  <h3 className="news-title">{item.title}</h3>
                  <p className="news-description">{item.description}</p>
                  
                  <div className="news-meta">
                    <div className="meta-left">
                      <span className="news-time">{formatTime(item.published_at)}</span>
                      {item.type && (
                        <span className="news-type-label">{item.type === 'discussion' ? '社区讨论' : '新闻文章'}</span>
                      )}
                    </div>
                    
                    <div className="news-tags">
                      {item.categories?.slice(0, 2).map((cat, idx) => (
                        <span key={idx} className="news-tag">{cat}</span>
                      ))}
                    </div>
                  </div>
                  
                  {item.upvotes && (
                    <div className="news-stats">
                      <span className="stat upvotes">⬆️ {item.upvotes}</span>
                      <span className="stat comments">💬 {item.comments}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="news-footer">
        <div className="data-notice">
          <small>数据来源: CoinDesk • CoinTelegraph • 金色财经 • Reddit • Decrypt</small>
          <small>📱 点击新闻卡片查看原文 | 所有源均无需API Key</small>
        </div>
        {filteredNews.length > 0 && (
          <div className="news-tip">
            <small>💡 提示: {activeCategory === 'All' ? '使用分类标签筛选特定内容' : '切换到"All"查看所有新闻'}</small>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewsModule