
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return new Response(JSON.stringify({ error: 'Admin password not set in environment' }), { status: 500 });
    }
    if (password === adminPassword) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Invalid password' }), { status: 401 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
}
