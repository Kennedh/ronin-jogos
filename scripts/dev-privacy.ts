import { NICKNAME_REASONS, Privacy } from "@ronin/data";
import { developmentPool } from "./development.ts";
import { developmentAuthMail } from "./local-auth-mail.ts";

const [command, playerId, decision, ...rest] = process.argv.slice(2);
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const reason = NICKNAME_REASONS.find((reason) => reason === decision);
const maintenance = ["finalize", "queue"].includes(command!) && !playerId;
const moderation =
  !!playerId &&
  uuid.test(playerId) &&
  ((command === "hide" && !!reason) ||
    (command === "inspect" && !decision) ||
    (command === "resolve" &&
      (decision === "RESTORED" || decision === "UPHELD")));
if ((!maintenance && !moderation) || (maintenance && decision) || rest.length)
  throw new Error(
    "Usage: finalize | queue | inspect <player-uuid> | hide <player-uuid> <reason> | resolve <player-uuid> <RESTORED|UPHELD>",
  );

const pool = developmentPool(),
  privacy = new Privacy(pool);
try {
  if (command === "queue") {
    console.log(JSON.stringify(await privacy.moderationQueue()));
  } else if (command === "inspect") {
    console.log(JSON.stringify(await privacy.inspectNickname(playerId!)));
  } else if (maintenance) {
    const { key } = await developmentAuthMail();
    let completed = 0;
    while (completed < 100 && (await privacy.finalizeOne(key))) completed++;
    console.log(JSON.stringify({ completed }));
  } else if (command === "hide" && reason) {
    const { nickname_moderation } = await privacy.moderateNickname(playerId!, {
      hide: reason,
    });
    console.log(JSON.stringify(nickname_moderation));
  } else if (decision === "RESTORED" || decision === "UPHELD") {
    const { nickname_moderation } = await privacy.moderateNickname(playerId!, {
      resolve: decision,
    });
    console.log(JSON.stringify(nickname_moderation));
  }
} finally {
  await pool.end();
}
