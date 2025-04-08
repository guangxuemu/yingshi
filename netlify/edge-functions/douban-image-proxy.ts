export default async (request: Request) => {
  const url = new URL(request.url);
  const imagePath = url.searchParams.get('path'); // 只需要传入图片路径部分
  
  if (!imagePath) {
    return new Response('Missing image path', { status: 400 });
  }

  try {
    // 随机选择1-9的图片服务器
    const serverNum = Math.floor(Math.random() * 9) + 1;
    const imageUrl = `https://img${serverNum}.doubanio.com${imagePath}`;
    
    // 转发请求到豆瓣图片服务器
    const response = await fetch(imageUrl, {
      headers: {
        'Referer': 'https://movie.douban.com/',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    // 返回图片响应
    return new Response(response.body, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response('Image load failed', { status: 500 });
  }
}
