 /**
 * 使用 MyMemory Translation API 翻译文本
 * 完全免费，可在浏览器中直接使用
 * @param {string} text - 要翻译的文本
 * @param {string} targetLang - 目标语言，默认为简体中文
 * @returns {Promise<string>} 翻译结果
 */
export const translateText = async (text, targetLang = 'zh-CN') => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return text || '';
  }
  
  try {
    console.log('开始翻译:', text.substring(0, 50) + '...');
    
    // 免费翻译 API，支持浏览器环境
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=en|${targetLang}`
    );
    
    if (!response.ok) {
      throw new Error(`翻译请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.responseData && data.responseData.translatedText) {
      console.log('翻译成功');
      return data.responseData.translatedText;
    } else {
      console.warn('翻译返回空结果，返回原文');
      return text;
    }
  } catch (error) {
    console.error('翻译失败:', error);
    throw new Error(`翻译服务暂时不可用: ${error.message}`);
  }
};

/**
 * 备用方案：模拟翻译（用于开发测试）
 */
export const mockTranslateText = async (text, targetLang = 'zh-CN') => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 返回模拟的翻译结果
  return `[翻译测试] ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`;
};