import jwt from 'jsonwebtoken';

function signAppJwt() {
  const now = Math.floor(Date.now()/1000);
  return jwt.sign(
    { iat: now-60, exp: now+9*60, iss: process.env.GITHUB_APP_ID },
    process.env.GITHUB_APP_PRIVATE_KEY as string,
    { algorithm: 'RS256' }
  );
}

export async function getInstallationToken(installationId: number) {
  const jwtToken = signAppJwt();
  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: 'application/vnd.github+json',
      },
      cache: 'no-store',
    }
  );
  if (!res.ok) throw new Error(`getInstallationToken failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.token as string; // صالح ~1 ساعة
}
