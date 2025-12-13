// 完全无需API Key的新API集合 - 优化版
const NEWS_APIS = [
  // 1. CoinDesk RSS (最稳定)
  {
    name: 'CoinDesk RSS',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/',
    parseData: (data) => {
      if (!data.items || !Array.isArray(data.items)) return []
      return data.items.slice(0, 20).map(item => ({
        id: `coindesk-${item.guid || item.link}`,
        title: item.title,
        description: cleanHTML(item.description || '').substring(0, 120) + '...',
        url: item.link,
        source: 'CoinDesk',
        image: getImageFromDescription(item.description) || 'https://images.unsplash.com/photo-1620336655055-bd87c5d1d73f?w=300&h=200&fit=crop',
        published_at: new Date(item.pubDate),
        categories: ['News', 'English'],
        type: 'article'
      }))
    },
    timeout: 8000
  },
  
  // 2. CoinTelegraph RSS (备用英文源)
  {
    name: 'CoinTelegraph',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss',
    parseData: (data) => {
      if (!data.items) return []
      return data.items.slice(0, 15).map(item => ({
        id: `cointelegraph-${item.guid || item.link}`,
        title: item.title,
        description: cleanHTML(item.description || '').substring(0, 100) + '...',
        url: item.link,
        source: 'CoinTelegraph',
        image: getImageFromDescription(item.description) || 'https://images.unsplash.com/photo-1620336655055-bd87c5d1d73f?w=300&h=200&fit=crop',
        published_at: new Date(item.pubDate),
        categories: ['News', 'English'],
        type: 'article'
      }))
    },
    timeout: 8000
  },
  
  // 3. 金色财经 RSS (中文源)
  {
    name: 'Jinse Finance',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.jinse.com/rss',
    parseData: (data) => {
      if (!data.items) return []
      return data.items.slice(0, 12).map(item => ({
        id: `jinse-${item.guid || item.link}`,
        title: item.title,
        description: '金色财经 - 区块链行业新闻',
        url: item.link,
        source: '金色财经',
        image: 'https://images.unsplash.com/photo-1620336655055-bd87c5d1d73f?w=300&h=200&fit=crop',
        published_at: new Date(item.pubDate),
        categories: ['News', 'Chinese'],
        type: 'article'
      }))
    },
    timeout: 8000
  },
  
  // 4. Reddit r/CryptoCurrency (社区讨论)
  {
    name: 'Reddit Crypto',
    url: 'https://www.reddit.com/r/CryptoCurrency/hot.json?limit=15',
    parseData: (data) => {
      if (!data.data?.children) return []
      return data.data.children.map(item => ({
        id: `reddit-${item.data.id}`,
        title: item.data.title,
        description: item.data.selftext?.substring(0, 80) + '...' || '查看社区讨论...',
        url: `https://reddit.com${item.data.permalink}`,
        source: 'Reddit r/CryptoCurrency',
        image: 'https://images.unsplash.com/photo-1620336655055-bd87c5d1d73f?w=300&h=200&fit=crop',
        published_at: new Date(item.data.created_utc * 1000),
        categories: ['Community', 'Discussion'],
        upvotes: item.data.ups,
        comments: item.data.num_comments,
        type: 'discussion'
      }))
    },
    timeout: 10000
  },
  
  // 5. Decrypt RSS (英文技术新闻)
  {
    name: 'Decrypt',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://decrypt.co/feed',
    parseData: (data) => {
      if (!data.items) return []
      return data.items.slice(0, 10).map(item => ({
        id: `decrypt-${item.guid || item.link}`,
        title: item.title,
        description: cleanHTML(item.description || '').substring(0, 90) + '...',
        url: item.link,
        source: 'Decrypt',
        image: getImageFromDescription(item.description) || 'https://images.unsplash.com/photo-1620336655055-bd87c5d1d73f?w=300&h=200&fit=crop',
        published_at: new Date(item.pubDate),
        categories: ['News', 'Technology'],
        type: 'article'
      }))
    },
    timeout: 8000
  }
]

// 辅助函数
const cleanHTML = (html) => {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()
}

const getImageFromDescription = (description) => {
  if (!description) return null
  const imgMatch = description.match(/<img[^>]+src="([^">]+)"/)
  return imgMatch ? imgMatch[1] : null
}

// 带超时的fetch
const fetchWithTimeout = (url, options = {}, timeout = 8000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('请求超时')), timeout)
    )
  ])
}

// 主获取函数
export const fetchCryptoNews = async (limit = 25) => {
  console.log('开始从无API Key源获取新闻...')
  
  const allNews = []
  const successfulSources = []
  
  // 按顺序尝试，一旦有足够数据就返回
  for (const api of NEWS_APIS) {
    if (allNews.length >= limit) break
    
    try {
      console.log(`尝试: ${api.name}`)
      
      const response = await fetchWithTimeout(api.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      }, api.timeout || 8000)
      
      if (!response.ok) {
        console.warn(`${api.name} 响应失败: ${response.status}`)
        continue
      }
      
      const data = await response.json()
      const newsItems = api.parseData(data) || []
      
      if (newsItems.length > 0) {
        console.log(`✓ ${api.name}: 获取 ${newsItems.length} 条`)
        allNews.push(...newsItems)
        successfulSources.push(api.name)
      }
      
    } catch (error) {
      console.warn(`${api.name} 请求失败:`, error.message)
      continue
    }
  }
  
  console.log(`总计获取: ${allNews.length} 条新闻，来源: ${successfulSources.join(', ')}`)
  
  // 去重和排序
  const uniqueNews = removeDuplicates(allNews)
  uniqueNews.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
  
  // 如果没获取到数据，返回备用数据
  if (uniqueNews.length === 0) {
    console.log('所有源都失败，返回备用数据')
    return getFallbackNews().slice(0, limit)
  }
  
  return uniqueNews.slice(0, limit)
}

// 去重函数
const removeDuplicates = (newsItems) => {
  const seen = new Set()
  return newsItems.filter(item => {
    const key = item.title.toLowerCase().trim().substring(0, 50)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// 备用数据
const getFallbackNews = () => {
  const timestamp = Date.now()
  return [
    {
      id: `fallback-${timestamp}-1`,
      title: '加密市场动态：比特币突破关键价位',
      description: '比特币价格突破重要技术阻力位，市场情绪转暖，分析师看好短期走势...',
      url: 'https://www.coindesk.com',
      source: '市场快讯',
      image: 'https://images.unsplash.com/photo-1620336655055-bd87c5d1d73f?w=300&h=200&fit=crop',
      published_at: new Date(timestamp - 3600000),
      categories: ['Bitcoin', 'Market'],
      type: 'article'
    },
    {
      id: `fallback-${timestamp}-2`,
      title: '以太坊网络升级进展顺利',
      description: '以太坊2.0验证节点数量稳步增长，网络安全性进一步提升...',
      url: 'https://cointelegraph.com',
      source: '技术更新',
      image: 'https://images.unsplash.com/photo-1620336655055-bd87c5d1d73f?w=300&h=200&fit=crop',
      published_at: new Date(timestamp - 7200000),
      categories: ['Ethereum', 'Technology'],
      type: 'article'
    },
    {
      id: `fallback-${timestamp}-3`,
      title: 'DeFi生态持续扩张',
      description: '去中心化金融协议总锁仓价值创新高，用户参与度持续提升...',
      url: 'https://decrypt.co',
      source: 'DeFi日报',
      image: 'https://images.unsplash.com/photo-1620336655055-bd87c5d1d73f?w=300&h=200&fit=crop',
      published_at: new Date(timestamp - 10800000),
      categories: ['DeFi', 'Finance'],
      type: 'article'
    },
    {
      id: `fallback-${timestamp}-4`,
      title: 'NFT市场交易活跃',
      description: '数字收藏品市场出现新热点，多个NFT项目交易量显著增长...',
      url: 'https://www.jinse.com',
      source: 'NFT观察',
      image: 'https://images.unsplash.com/photo-1620336655055-bd87c5d1d73f?w=300&h=200&fit=crop',
      published_at: new Date(timestamp - 14400000),
      categories: ['NFT', 'Market'],
      type: 'article'
    },
    {
      id: `fallback-${timestamp}-5`,
      title: '全球监管框架逐步完善',
      description: '各国加密资产监管政策陆续出台，市场规范化进程加速...',
      url: 'https://cryptoslate.com',
      source: '政策动态',
      image: 'https://images.unsplash.com/photo-1620336655055-bd87c5d1d73f?w=300&h=200&fit=crop',
      published_at: new Date(timestamp - 18000000),
      categories: ['Regulation', 'Policy'],
      type: 'article'
    }
  ]
}

// 分类和过滤函数
export const getNewsCategories = () => {
  return ['All', 'Bitcoin', 'Ethereum', 'DeFi', 'NFT', 'Market', 'Technology', 'Chinese', 'Community']
}

export const filterNewsByCategory = (news, category) => {
  if (category === 'All') return news
  
  const categoryMap = {
    'Bitcoin': ['bitcoin', 'btc'],
    'Ethereum': ['ethereum', 'eth'],
    'DeFi': ['defi', 'decentralized finance'],
    'NFT': ['nft', 'non-fungible'],
    'Market': ['market', 'price', 'trading', '投资'],
    'Technology': ['technology', 'tech', 'upgrade', '技术'],
    'Chinese': ['chinese', '中文', '金色财经'],
    'Community': ['community', 'discussion', 'reddit']
  }
  
  const keywords = categoryMap[category] || [category.toLowerCase()]
  
  return news.filter(item => {
    const searchText = `${item.title} ${item.description} ${item.categories?.join(' ') || ''}`.toLowerCase()
    return keywords.some(keyword => searchText.includes(keyword.toLowerCase()))
  })
}