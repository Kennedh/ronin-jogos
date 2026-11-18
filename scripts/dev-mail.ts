import { developmentPool } from "./development.ts";
import { developmentAuthMail } from "./local-auth-mail.ts";
import { deliverAuthMail } from "@ronin/data";
import { setTimeout as wait } from "node:timers/promises";
const pool = developmentPool(),
  { key, transport } = await developmentAuthMail();
let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.once(signal, () => {
    stopping = true;
  });
try {
  await pool.query("SELECT id FROM auth_mail_outbox LIMIT 0");
  console.log(
    "Ronin dev mail: entrega local privada em artifacts/dev-auth/inbox; nenhum SMTP conectado.",
  );
  do {
    const result = await deliverAuthMail(pool, key, transport);
    if (process.argv.includes("--once")) break;
    if (result === "IDLE") await wait(500);
  } while (!stopping);
} finally {
  await pool.end();
}
