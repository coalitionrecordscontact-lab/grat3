import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  const users = await base44.asServiceRole.entities.User.list();

  let sent = 0;

  for (const u of users) {
    if (u.notifications_enabled === false) continue;
    if (!u.email) continue;

    const tz = u.timezone || 'UTC';

    // Get current hour in user's timezone
    const userHour = parseInt(
      new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: tz }).format(now),
      10
    );

    if (userHour !== 20) continue;

    // Check if user already wrote today in their timezone
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now); // YYYY-MM-DD
    const entries = await base44.asServiceRole.entities.GratitudeEntry.filter({
      created_by: u.email,
      date: todayStr,
    });

    if (entries.length > 0 && entries[0].is_complete) continue;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: u.email,
      subject: "✨ Your 3 positive moments today",
      body: `Hi ${u.username || u.full_name || 'there'},\n\nDon't forget to write your 3 positive moments for today!\n\nTake a moment to reflect on what went well — it only takes a minute.\n\nOpen the app: ${req.headers.get('origin') || 'https://your-app.base44.app'}\n\nHave a wonderful evening 🌙`,
    });

    sent++;
  }

  return Response.json({ sent, checked: users.length });
});