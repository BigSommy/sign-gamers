export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');
  if (!handle) {
    return new Response('Missing handle', { status: 400 });
  }

  const avatarUrl = `https://unavatar.io/twitter/${handle.replace('@', '')}`;
  const avatarRes = await fetch(avatarUrl);

  if (!avatarRes.ok) {
    return new Response('Avatar not found', { status: 404 });
  }

  const headers = new Headers(avatarRes.headers);
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(avatarRes.body, {
    status: 200,
    headers,
  });
} 