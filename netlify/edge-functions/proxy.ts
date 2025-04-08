import type { Context } from "https://edge.netlify.com"

export default async (request: Request, context: Context) => {
  // 获取请求URL参数
  const url = new URL(request.url)
  const target = url.searchParams.get('url')
  
  if (!target) {
    return new Response('Missing URL parameter', { status: 400 })
  }

  // 转发请求到目标API
  try {
    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Netlify Edge Function'
      }
    })
    
    // 返回处理后的响应
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return new Response(error.message, { status: 500 })
  }
}
