import { createRemoteJWKSet, errors, jwtVerify } from "jose";
import type { JWTVerifyGetKey } from "jose";
import { Fault } from "@ronin/data";

export interface GoogleConfig {
  clientId: string;
  /** Used by integration tests to verify real JWT signatures with local keys. */
  keys?: JWTVerifyGetKey;
}

const googleKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
  { timeoutDuration: 3000 },
);

export function googleVerifier(config: GoogleConfig, clock?: () => Date) {
  if (
    !/^[A-Za-z0-9_-]{1,200}\.apps\.googleusercontent\.com$/.test(
      config.clientId,
    )
  )
    throw new Error("invalid_google_client_id");

  return async (token: string) => {
    try {
      const { payload } = await jwtVerify(token, config.keys ?? googleKeys, {
        algorithms: ["RS256"],
        issuer: ["accounts.google.com", "https://accounts.google.com"],
        audience: config.clientId,
        requiredClaims: ["sub", "exp", "iat", "nonce"],
        maxTokenAge: "5 min",
        ...(clock ? { currentDate: clock() } : {}),
      });
      if (
        typeof payload.sub !== "string" ||
        !/^[\x21-\x7e]{1,255}$/.test(payload.sub) ||
        typeof payload["nonce"] !== "string" ||
        !/^[A-Za-z0-9_-]{43}$/.test(payload["nonce"]) ||
        (payload["azp"] !== undefined && payload["azp"] !== config.clientId) ||
        (Array.isArray(payload.aud) &&
          payload.aud.length > 1 &&
          payload["azp"] !== config.clientId)
      )
        throw new Fault(401, "GOOGLE_CREDENTIAL_INVALID");
      return {
        subject: payload.sub,
        nonce: payload["nonce"],
        expiresAt: new Date(payload.exp! * 1000),
      };
    } catch (error) {
      if (
        error instanceof errors.JWKSTimeout ||
        error instanceof TypeError ||
        (error instanceof errors.JOSEError && error.code === "ERR_JOSE_GENERIC")
      )
        throw new Fault(503, "GOOGLE_UNAVAILABLE");
      throw new Fault(401, "GOOGLE_CREDENTIAL_INVALID");
    }
  };
}
