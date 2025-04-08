export default async (request: Request) => {
  const url = new URL(request.url);
  const target = url.searchParams.get('url');
  
  if (!target) {
    return new Response('Missing URL parameter', { status: 400 });
  }

  return fetch(target, {
    headers: request.headers,
    method: request.method
  });
};
