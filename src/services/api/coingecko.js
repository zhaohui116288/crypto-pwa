 const BASE_URL = 'https://api.coingecko.com/api/v3'

export const fetchMarketData = async (limit = 50) => {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
    )
    
    if (!response.ok) {
      throw new Error('API请求失败')
    }
    
    const data = await response.json()
    return data.map(item => ({
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      image: item.image,
      current_price: item.current_price,
      market_cap: item.market_cap,
      market_cap_rank: item.market_cap_rank,
      price_change_percentage_24h: item.price_change_percentage_24h,
      total_volume: item.total_volume
    }))
  } catch (error) {
    console.error('Error fetching market data:', error)
    throw error
  }
}

export const fetchByVolume = async (limit = 50) => {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=volume_desc&per_page=${limit}&page=1`
    )
    
    if (!response.ok) throw new Error('API请求失败')
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching volume data:', error)
    throw error
  }
}

export const fetchCoinDetail = async (coinId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
    )
    
    if (!response.ok) throw new Error('获取详情失败')
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching coin detail:', error)
    throw error
  }
}