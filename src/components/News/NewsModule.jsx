import React, { useState, useEffect, useCallback } from 'react'
import { fetchCryptoNews, getNewsCategories, filterNewsByCategory } from '../../services/api/news'
// 导入翻译服务
import { translateText, mockTranslateText } from '../../services/api/translation'

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
  
  // 新增：翻译相关状态
  const [translatingId, setTranslatingId] = useState(null)
  const [translatedItems, setTranslatedItems] = useState({})
  const [showTranslated, setShowTranslated] = useState({})

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
      
      // 重置翻译状态
      setTranslatedItems({})
      setShowTranslated({})
      
      console.log('新闻获取成功:', newsData.length, '条')
      
    } catch (err) {
      console.error('新闻获取失败:', err)
      setError('新闻加载遇到问题，已显示备用内容')
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [activeCategory])

  // 新增：处理单条新闻翻译
  const handleTranslateNews = async (newsItem) => {
    const { id, title, description } = newsItem
    
    // 如果已经翻译过，直接切换显示状态
    if (translatedItems[id]) {
      setShowTranslated(prev => ({
        ...prev,
        [id]: !prev[id]
      }))
      return
    }
    
    // 开始翻译
    setTranslatingId(id)
    
    try {
      // 并行翻译标题和描述
      const [translatedTitle, translatedDescription] = await Promise.all([
        translateText(title),
        description ? translateText(description) : Promise.resolve('')
      ])
      
      // 保存翻译结果
      setTranslatedItems(prev => ({
        ...prev,
        [id]: {
          title: translatedTitle,
          description: translatedDescription
        }
      }))
      
      // 自动显示翻译结果
      setShowTranslated(prev => ({
        ...prev,
        [id]: true
      }))
      
      console.log(`新闻 ${id} 翻译完成`)
      
    } catch (err) {
      console.error(`翻译新闻 ${id} 失败:`, err)
      
      // 提供用户反馈
      if (err.message.includes('网络错误') || err.message.includes('超时')) {
        alert('翻译失败：请检查网络连接后重试')
      } else {
        alert('翻译服务暂时不可用，请稍后重试')
      }
    } finally {
      setTranslatingId(null)
    }
  }

  // 新增：判断是否需要显示翻译按钮（仅英文内容显示）
  const shouldShowTranslateButton = (text) => {
    if (!text || typeof text !== 'string') return false
    
    // 简单检测是否为英文内容（包含英文字母）
    const hasEnglishChars = /[a-zA-Z]/.test(text)
    // 中文字符比例很低（小于10%）
    const chineseCharRatio = (text.match(/[\u4e00-\u9fa5]/g) || []).length / text.length
    
    return hasEnglishChars && chineseCharRatio < 0.1
  }

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
          {/* 新增：翻译状态统计 */}
          <span className="stat-item">
            🌐 翻译: {Object.keys(translatedItems).length} 条已翻译
          </span>
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
            {filteredNews.map((item) => {
              const isTranslating = translatingId === item.id
              const hasTranslation = !!translatedItems[item.id]
              const showTranslation = showTranslated[item.id]
              
              // 判断是否需要显示翻译按钮
              const showTranslateBtn = 
                shouldShowTranslateButton(item.title) || 
                shouldShowTranslateButton(item.description)
              
              // 确定显示的内容
              const displayTitle = showTranslation && translatedItems[item.id]?.title 
                ? translatedItems[item.id].title 
                : item.title
                
              const displayDescription = showTranslation && translatedItems[item.id]?.description 
                ? translatedItems[item.id].description 
                : item.description

              return (
                <div 
                  key={item.id} 
                  className="news-card"
                  onClick={(e) => {
                    // 防止点击翻译按钮时触发卡片点击
                    if (e.target.closest('.translate-btn')) {
                      return
                    }
                    if (item.url && !item.url.includes('#')) {
                      window.open(item.url, '_blank', 'noopener,noreferrer')
                    }
                  }}
                  title={item.url ? '点击查看原文' : '无原文链接'}
                >
                  <div className="news-image">
                    <img 
                      src={item.image} 
                      alt={displayTitle}
                      onError={handleImageError}
                      loading="lazy"
                    />
                    <div className="image-overlay">
                      <span className="news-source">{item.source}</span>
                      <span className="news-type">{getTypeIcon(item.type)}</span>
                    </div>
                  </div>
                  
                  <div className="news-body">
                    <h3 className="news-title">
                      {displayTitle}
                      {/* 翻译状态指示器 */}
                      {hasTranslation && showTranslation && (
                        <span className="translation-badge" title="已翻译">🌐</span>
                      )}
                    </h3>
                    <p className="news-description">{displayDescription}</p>
                    
                    <div className="news-meta">
                      <div className="meta-left">
                        <span className="news-time">{formatTime(item.published_at)}</span>
                        {item.type && (
                          <span className="news-type-label">{item.type === 'discussion' ? '社区讨论' : '新闻文章'}</span>
                        )}
                        
                        {/* 翻译按钮 */}
                        {showTranslateBtn && (
                          <button 
                            className={`translate-btn ${isTranslating ? 'translating' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTranslateNews(item)
                            }}
                            disabled={isTranslating}
                            title={hasTranslation 
                              ? (showTranslation ? '显示原文' : '显示翻译') 
                              : '翻译成中文'}
                          >
                            {isTranslating ? (
                              <>
                                <span className="translate-spinner"></span>
                                翻译中...
                              </>
                            ) : hasTranslation ? (
                              showTranslation ? '显示原文' : '显示翻译'
                            ) : '翻译成中文'}
                          </button>
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
              )
            })}
          </div>
        )}
      </div>

      <div className="news-footer">
        <div className="data-notice">
          <small>数据来源: CoinDesk • CoinTelegraph • 金色财经 • Reddit • Decrypt</small>
          <small>📱 点击新闻卡片查看原文 | 所有源均无需API Key</small>
          {/* 新增翻译服务说明 */}
          <small>🌐 翻译服务: Microsoft Translator (免费版)</small>
        </div>
        {filteredNews.length > 0 && (
          <div className="news-tip">
            <small>💡 提示: {activeCategory === 'All' ? '使用分类标签筛选特定内容' : '切换到"All"查看所有新闻'}</small>
            <small>🌐 点击"翻译成中文"按钮将英文新闻翻译为中文</small>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewsModule