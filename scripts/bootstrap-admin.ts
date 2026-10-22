// Promotes an existing account to administrator.
// Usage: bun scripts/bootstrap-admin.ts --email <email> [--remote]
// The user must sign up first; this script only changes the role of an existing row.
const EMAIL_PATTERN = /^[^\s'";\\]+@[^\s'";\\]+\.[^\s'";\\]+$/;

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const args = process.argv.slice(2);
const emailFlag = args.indexOf('--email');
const email = emailFlag >= 0 ? args[emailFlag + 1]?.trim().toLowerCase() : undefined;
const remote = args.includes('--remote');

if (!email || !EMAIL_PATTERN.test(email)) {
  fail('Usage: bun scripts/bootstrap-admin.ts --email <email> [--remote]');
}

// The email passed the pattern above (no quotes, semicolons or backslashes), and the command
// is an argument vector, not a shell string, so nothing can break out of the SQL literal.
// RETURNING makes the number of updated rows visible: local wrangler omits `meta.changes`.
const sql = `UPDATE user SET role = 'admin' WHERE email = '${email}' RETURNING id`;
const child = Bun.spawn(
  [
    'bunx',
    'wrangler',
    'd1',
    'execute',
    'cset-learning-db',
    remote ? '--remote' : '--local',
    '--json',
    '--command',
    sql
  ],
  { stdout: 'pipe', stderr: 'inherit' }
);

const output = await new Response(child.stdout).text();
const exitCode = await child.exited;
if (exitCode !== 0) fail(`wrangler exited with code ${exitCode}`);

let updatedRows = 0;
try {
  const results: Array<{ results?: unknown[] }> = JSON.parse(output);
  updatedRows = results.reduce((sum, result) => sum + (result.results?.length ?? 0), 0);
} catch {
  fail('Could not parse the wrangler output.');
}

if (updatedRows === 0) fail(`No account with the email ${email} exists yet. Sign up first.`);
console.info(`${email} is now an administrator (${remote ? 'remote' : 'local'} database).`);
