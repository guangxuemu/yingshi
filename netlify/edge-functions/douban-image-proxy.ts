import type { Context } from "https://edge.netlify.com"

// 缓存对象
const imageCache = new Map()

export default async (request: Request) => {
  const url = new URL(request.url);
  const imagePath = decodeURIComponent(url.searchParams.get('path') || '');
  
  if (!imagePath) {
    return new Response('Missing image path', { status: 400 });
  }

  // 检查缓存
  if (imageCache.has(imagePath)) {
    const cached = imageCache.get(imagePath)
    if (Date.now() - cached.timestamp < 86400000) { // 24小时缓存
      return new Response(cached.body, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'HIT'
        }
      })
    }
  }

  // 随机选择1-9的图片服务器
  const serverNum = Math.floor(Math.random() * 9) + 1;
  const imageUrl = `https://img${serverNum}.doubanio.com${imagePath}`;

  // 最多重试5次
  let retries = 5;
  while (retries > 0) {
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'Referer': 'https://movie.douban.com/',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      // 缓存响应
      const body = await response.arrayBuffer()
      imageCache.set(imagePath, {
        body,
        timestamp: Date.now()
      })

      return new Response(body, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'MISS'
        }
      });
    } catch (error) {
      retries--;
      if (retries === 0) {
        return new Response('Image load failed after retries', { 
          status: 500,
          headers: {
            'Retry-After': '60' // 60秒后重试
          }
        });
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // 延迟1秒重试
    }
  }
}
