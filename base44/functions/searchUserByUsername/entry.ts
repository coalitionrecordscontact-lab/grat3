import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await req.json();
    if (!username) {
      return Response.json({ error: 'Missing username' }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.filter({ username: username.trim() });

    if (users.length === 0) {
      return Response.json({ found: false });
    }

    const found = users[0];
    return Response.json({
      found: true,
      user: {
        email: found.email,
        username: found.username,
        full_name: found.full_name,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});