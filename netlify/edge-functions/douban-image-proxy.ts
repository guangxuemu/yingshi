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

  // 最多重试3次
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'Referer': 'https://movie.douban.com/',
          'User-Agent': 'Mozilla/5.0'
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
