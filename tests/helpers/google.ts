import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import type { JWTPayload } from "jose";

export async function syntheticGoogle(now: () => number) {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const outside = await generateKeyPair("RS256");
  const clientId = "fixture-ronin.apps.googleusercontent.com";
  const keys = createLocalJWKSet({
    keys: [
      {
        ...(await exportJWK(publicKey)),
        kid: "fixture",
        alg: "RS256",
        use: "sig",
      },
    ],
  });
  return {
    config: { clientId, keys },
    async sign(
      nonce: string,
      subject: string,
      options: JWTPayload = {},
      wrongKey = false,
    ) {
      const issued = Math.floor(now() / 1000);
      return new SignJWT({
        sub: subject,
        nonce,
        iss: "https://accounts.google.com",
        aud: clientId,
        iat: issued,
        exp: issued + 120,
        email: "synthetic@example.test",
        email_verified: true,
        ...options,
      })
        .setProtectedHeader({ alg: "RS256", kid: "fixture" })
        .sign(wrongKey ? outside.privateKey : privateKey);
    },
  };
}
