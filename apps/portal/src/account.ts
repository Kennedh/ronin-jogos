import { RunnerApi, ClientError } from "@ronin/runner-client";
import type { components } from "@ronin/contracts";
import { canvasBrush, demoPose, drawRig } from "@ronin/runner-client";
import { RULES_V2 } from "@ronin/runner-core";
import {
  partsById,
  resolveAppearance,
  defaultAppearance,
} from "@ronin/content/character";
import { accountCopy } from "@ronin/content/account-copy";
import type { AccountTextKey } from "@ronin/content/account-copy";
import { apiErrorMessage, runnerPath } from "@ronin/content";
import type { Locale } from "@ronin/content";
import { renderGoogleButton } from "./google-sign-in.ts";

export async function initializeAccount(
  root: HTMLElement,
  context: { locale: () => Locale; setRedraw: (fn: () => void) => void },
  intent: { kind: "verify" | "reset" | "invalid" | ""; token: string },
) {
  const api = new RunnerApi(),
    get = <T extends HTMLElement = HTMLElement>(id: string) => {
      const e = document.getElementById(id);
      if (!e) throw new Error("missing_account_element");
      return e as T;
    };
  let profile: components["schemas"]["PlayerSummary"] | undefined,
    profileInForm: typeof profile,
    privacy: components["schemas"]["PrivacyStatus"] | undefined,
    list: components["schemas"]["AccountSessions"] | undefined,
    googleClientId: string | null = null,
    googleRequest: { playerId: string } | undefined,
    mergeOpen = false,
    mergePreview: components["schemas"]["MergePreview"] | undefined,
    busy = true,
    reauth = false,
    message: AccountTextKey | "" = "",
    error: ClientError | undefined,
    bootstrapError = false;
  const copy = () => accountCopy(context.locale());
  let character: components["schemas"]["Character"] | undefined;
  async function loadAvatar() {
    character =
      profile && profile.account_status !== "DELETION_PENDING"
        ? await api.character().catch(() => undefined)
        : undefined;
  }
  function renderAvatar() {
    const figure = get("account-avatar");
    figure.hidden = !character || character.player_id !== profile?.player_id;
    if (figure.hidden || !character) return;
    const slots = resolveAppearance(character.slots),
      canvas = figure.querySelector("canvas")!,
      ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(76, 126);
      drawRig(
        canvasBrush(ctx),
        demoPose("IDLE", 0),
        RULES_V2,
        true,
        false,
        slots,
      );
      ctx.restore();
    }
    const ids = [slots.outfit_id];
    if (slots.profile_emblem_id !== defaultAppearance.profile_emblem_id)
      ids.push(slots.profile_emblem_id);
    figure.querySelector("figcaption")!.textContent = ids
      .map((id) => partsById.get(id)?.labels[context.locale()])
      .join(" · ");
  }
  function clearGoogleButton() {
    googleRequest = undefined;
    get("account-google-button").replaceChildren();
    get("account-merge-google-button").replaceChildren();
  }
  function clearMerge() {
    mergeOpen = false;
    mergePreview = undefined;
    get<HTMLInputElement>("account-merge-agree").checked = false;
  }
  function showMerge(preview: components["schemas"]["MergePreview"]) {
    mergeOpen = true;
    mergePreview = preview;
    get<HTMLInputElement>("account-merge-look").checked =
      preview.summary.source.character.appearance_version > 1 &&
      preview.summary.target.character.appearance_version === 1;
    get<HTMLInputElement>("account-merge-agree").checked = false;
    message = "mergeReviewReady";
  }
  function renderMerge(t: ReturnType<typeof copy>, registered: boolean) {
    const guest = !!profile && !registered;
    get("account-merge-panel").hidden = !guest || !mergeOpen;
    get("account-merge-open").hidden = !guest || mergeOpen;
    get("account-merge-google").hidden = !googleClientId;
    get("account-merge-proof").hidden = !!mergePreview;
    get("account-merge-preview").hidden = !mergePreview;
    const comparison = get("account-merge-comparison");
    comparison.replaceChildren();
    if (!mergePreview) return;
    const number = new Intl.NumberFormat(context.locale());
    for (const [key, data] of [
      ["mergeSource", mergePreview.summary.source],
      ["mergeTarget", mergePreview.summary.target],
    ] as const) {
      const section = document.createElement("section");
      const heading = document.createElement("h3");
      const list = document.createElement("dl");
      heading.textContent = t[key];
      for (const [label, value] of [
        [t.nickname, data.nickname ?? t.mergeNoNickname],
        [
          t.mergeAppearance,
          partsById.get(data.character.slots["outfit_id"] ?? "")?.labels[
            context.locale()
          ] ?? "—",
        ],
        [t.mergeRuns, number.format(data.runs)],
        [t.mergeVerified, number.format(data.verified)],
        [
          t.mergeBest,
          data.best_ranked_score === null
            ? "—"
            : number.format(BigInt(data.best_ranked_score)),
        ],
        [t.mergeRegions, number.format(data.regions.length)],
        [t.mergeSeals, number.format(data.seals.length)],
        [t.mergeRewards, number.format(data.rewards.length)],
      ]) {
        const term = document.createElement("dt");
        const description = document.createElement("dd");
        term.textContent = label ?? "";
        description.textContent = value ?? "";
        list.append(term, description);
      }
      section.append(heading, list);
      comparison.append(section);
    }
    const expiry = new Intl.DateTimeFormat(context.locale(), {
      timeStyle: "short",
    });
    get("account-merge-expiry").textContent =
      t.mergeExpiry + " " + expiry.format(new Date(mergePreview.expires_at));
  }
  function renderPrivacy(t: ReturnType<typeof copy>, registered: boolean) {
    const moderation = privacy?.nickname_moderation;
    const deletion = privacy?.deletion;
    const pending = profile?.account_status === "DELETION_PENDING";
    const date = new Intl.DateTimeFormat(context.locale(), {
      dateStyle: "medium",
      timeStyle: "short",
    });
    get("account-privacy-panel").hidden =
      !profile || (!registered && !moderation);
    get("account-account-privacy").hidden = !registered;
    get("account-nickname-moderation").hidden = !moderation;
    get("account-nickname-appeal").hidden =
      moderation?.state !== "HIDDEN" || pending;
    get("account-nickname-notice").textContent = moderation
      ? [
          moderation.state === "APPEALED"
            ? t.moderationPending
            : moderation.state === "RESTORED"
              ? t.moderationRestored
              : moderation.state === "UPHELD"
                ? t.moderationUpheld
                : t.moderationHidden,
          t[`moderation${moderation.reason}`],
          date.format(new Date(moderation.hidden_at)),
        ].join(" ")
      : "";
    get("account-delete-details").hidden = pending;
    get("account-deletion-status").hidden = !pending;
    get("account-deletion-status").textContent =
      pending && deletion
        ? t.privacyDeletionScheduled +
          " " +
          date.format(new Date(deletion.finalize_at))
        : t.privacyPending;
    get("account-delete-cancel").hidden = !pending;
    get<HTMLButtonElement>("account-delete-submit").disabled =
      busy || pending || !get<HTMLInputElement>("account-delete-agree").checked;
  }

  function render() {
    const t = copy();
    for (const e of root.querySelectorAll<HTMLElement>("[data-account-copy]"))
      e.textContent = t[e.dataset["accountCopy"] as AccountTextKey];
    get<HTMLAnchorElement>("account-back").href = runnerPath(context.locale());
    get<HTMLAnchorElement>("account-creator").href =
      runnerPath(context.locale()) + "#rig-lab";
    renderAvatar();
    const deletionPending = profile?.account_status === "DELETION_PENDING";
    const registered =
      profile?.account_status === "REGISTERED" || deletionPending;
    const googleOnly = profile?.account_type === "GOOGLE";
    const linkedGoogle = googleOnly || profile?.account_type === "MULTI";
    get("account-google-panel").hidden =
      !profile ||
      (!googleClientId && !linkedGoogle) ||
      profile.account_status === "EMAIL_PENDING";
    get("account-google-status").hidden = !linkedGoogle;
    get("account-google-signin").hidden = registered;
    get("account-google-link").hidden =
      deletionPending || !registered || linkedGoogle;
    get("account-google-reauth").hidden =
      !linkedGoogle || !reauth || !googleClientId;
    get("account-google-unlink").hidden =
      deletionPending || profile?.account_type !== "MULTI";
    get("account-google-unlink-hint").hidden =
      deletionPending || profile?.account_type !== "MULTI";
    get("account-guest").hidden =
      deletionPending || (registered && !googleOnly);
    get("account-email-login-panel").hidden = registered;
    get("account-register-title").textContent = googleOnly
      ? t.addEmail
      : t.registrationTitle;
    get("account-register-hint").textContent = googleOnly
      ? t.addEmailHint
      : t.continueGuest;
    get("account-logout").hidden = !registered;
    get("account-new-guest").hidden =
      !bootstrapError || error?.code !== "SESSION_REQUIRED";
    get("account-session-panel").hidden = !registered;
    const emailPending =
      profile?.account_status === "EMAIL_PENDING" ||
      (googleOnly && !!profile?.email);
    get("account-resend").hidden = !emailPending;
    get("account-name").textContent =
      profile?.nickname ?? (registered ? t.profileTitle : t.guest);
    get("account-email").textContent = profile?.email ?? "";
    get("account-profile-panel").hidden = !profile || deletionPending;
    const registerNickname = get<HTMLInputElement>("register-nickname");
    registerNickname.readOnly = !!profile?.nickname;
    registerNickname.required = !googleOnly;
    if (profileInForm !== profile) {
      get<HTMLInputElement>("account-profile-nickname").value =
        profile?.nickname ?? "";
      get<HTMLInputElement>("account-public-profile").checked =
        profile?.public_profile ?? false;
      registerNickname.value = profile?.nickname ?? "";
      profileInForm = profile;
    }
    const moderationState = privacy?.nickname_moderation?.state;
    const available =
      moderationState && moderationState !== "RESTORED"
        ? null
        : profile?.nickname_change_available_at;
    get("account-nickname-hint").textContent =
      available && new Date(available).getTime() > Date.now()
        ? t.nicknameAvailable +
          " " +
          new Intl.DateTimeFormat(context.locale(), {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(available))
        : t.nicknameHint;
    get("account-state").textContent = deletionPending
      ? t.privacyPending
      : emailPending
        ? t.pending
        : registered
          ? googleOnly
            ? t.googleLinked
            : t.registered
          : t.guest;
    get("verify-panel").hidden = intent.kind !== "verify";
    get("reset-panel").hidden = intent.kind !== "reset";
    get("account-reauth-form").hidden = !reauth || googleOnly;
    if (googleRequest && googleRequest.playerId !== profile?.player_id)
      clearGoogleButton();
    const status = busy ? t.loading : message ? t[message] : "";
    get("account-message").textContent = status;
    get("account-error").hidden =
      !error && !bootstrapError && intent.kind !== "invalid";
    get("account-error").textContent = error
      ? apiErrorMessage(error.code, context.locale())
      : intent.kind === "invalid"
        ? t.invalidLink
        : bootstrapError
          ? t.accountError
          : "";
    for (const input of root.querySelectorAll<
      HTMLButtonElement | HTMLInputElement
    >(".account-page button,.account-page input"))
      input.disabled = busy;
    renderMerge(t, registered);
    renderPrivacy(t, registered);
    get<HTMLButtonElement>("account-merge-confirm").disabled =
      busy ||
      !mergePreview ||
      !get<HTMLInputElement>("account-merge-agree").checked;
    get("account-sessions").replaceChildren();
    for (const row of list?.sessions ?? []) {
      const article = document.createElement("article"),
        p = document.createElement("p"),
        button = document.createElement("button");
      p.textContent = `${row.current ? t.current : t.other} · ${new Intl.DateTimeFormat(context.locale(), { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.created_at))} · ${t.expires}: ${new Intl.DateTimeFormat(context.locale(), { dateStyle: "medium" }).format(new Date(row.expires_at))}`;
      button.type = "button";
      button.textContent = t.revoke;
      button.disabled = busy || row.current;
      button.addEventListener("click", () => {
        void run(async () => {
          await api.revokeSession(row.session_id);
          await loadSessions();
          message = "revoked";
        });
      });
      article.append(p, button);
      get("account-sessions").append(article);
    }
  }
  async function loadSessions() {
    try {
      list = await api.accountSessions();
      reauth = false;
    } catch (e) {
      if (e instanceof ClientError && e.code === "REAUTH_REQUIRED") {
        reauth = true;
        list = undefined;
      } else throw e;
    }
  }
  async function load() {
    profile = await api.guest(context.locale());
    googleClientId =
      (await api.googleConfig().catch(() => null))?.client_id ?? null;
    await loadAvatar();
    privacy = await api.privacyStatus().catch(() => undefined);
    bootstrapError = false;
    if (
      profile.account_status === "REGISTERED" ||
      profile.account_status === "DELETION_PENDING"
    )
      await loadSessions();
    else list = undefined;
  }
  async function run(work: () => Promise<void>) {
    if (busy) return;
    busy = true;
    error = undefined;
    message = "";
    render();
    try {
      await work();
    } catch (e) {
      error =
        e instanceof ClientError ? e : new ClientError("SERVICE_UNAVAILABLE");
      if (error.code === "REAUTH_REQUIRED") reauth = true;
      if (error.code === "GUEST_PROGRESS_REQUIRES_LINK") mergeOpen = true;
      if (
        ["MERGE_PREVIEW_CHANGED", "MERGE_PROOF_INVALID"].includes(error.code)
      ) {
        mergePreview = undefined;
        get<HTMLInputElement>("account-merge-agree").checked = false;
      }
      if (["SESSION_REQUIRED", "SESSION_CHANGED"].includes(error.code)) {
        profile = undefined;
        list = undefined;
        privacy = undefined;
        clearMerge();
        bootstrapError = true;
      }
    } finally {
      busy = false;
      render();
    }
  }
  function form(id: string, work: (data: FormData) => Promise<void>) {
    get<HTMLFormElement>(id).addEventListener("submit", (event) => {
      event.preventDefault();
      const element = event.currentTarget as HTMLFormElement,
        data = new FormData(element);
      void run(async () => {
        try {
          await work(data);
        } finally {
          for (const password of element.querySelectorAll<HTMLInputElement>(
            'input[type="password"]',
          ))
            password.value = "";
        }
      });
    });
  }

  for (const [id, purpose] of [
    ["account-google-signin", "SIGN_IN"],
    ["account-google-link", "LINK"],
    ["account-google-reauth", "REAUTH"],
    ["account-merge-google", "MERGE"],
  ] as const) {
    get(id).addEventListener("click", () => {
      void run(async () => {
        if (!googleClientId || !profile) return;
        clearGoogleButton();
        const request = { playerId: profile.player_id };
        const { nonce } = await api.googleChallenge(purpose);
        googleRequest = request;
        const slot = get(
          purpose === "MERGE"
            ? "account-merge-google-button"
            : "account-google-button",
        );
        try {
          await renderGoogleButton(
            slot,
            googleClientId,
            nonce,
            context.locale(),
            (token) => {
              if (
                busy ||
                googleRequest !== request ||
                profile?.player_id !== request.playerId
              )
                return;
              clearGoogleButton();
              void run(async () => {
                if (purpose === "MERGE") {
                  showMerge(
                    await api.mergePreview({
                      method: "GOOGLE",
                      id_token: token,
                    }),
                  );
                  return;
                }
                const signedIn = await api.googleAuth(purpose, token);
                if (signedIn) {
                  profile = signedIn;
                  await loadAvatar();
                  privacy = await api.privacyStatus();
                }
                await loadSessions();
                message =
                  purpose === "LINK"
                    ? "googleLinkDone"
                    : purpose === "REAUTH"
                      ? "googleReauthDone"
                      : "googleSignInDone";
              });
            },
          );
          message = "googleContinue";
        } catch (error) {
          clearGoogleButton();
          throw error;
        }
      });
    });
  }
  get("account-google-unlink").addEventListener("click", () => {
    void run(async () => {
      clearGoogleButton();
      profile = await api.unlinkGoogle();
      await loadSessions();
      message = "googleUnlinkDone";
    });
  });
  get("account-merge-open").addEventListener("click", () => {
    clearGoogleButton();
    mergeOpen = true;
    message = "";
    render();
    get<HTMLInputElement>("merge-email").focus();
  });
  get("account-merge-cancel").addEventListener("click", () => {
    clearGoogleButton();
    clearMerge();
    message = "";
    error = undefined;
    const input = get<HTMLInputElement>("merge-password");
    input.value = "";
    render();
    get("account-merge-open").focus();
  });
  get("account-merge-agree").addEventListener("change", render);
  form("account-merge-proof-form", async (data) => {
    clearGoogleButton();
    showMerge(
      await api.mergePreview({
        method: "EMAIL",
        email: String(data.get("email")),
        password: String(data.get("password")),
      }),
    );
  });
  form("account-merge-confirm-form", async () => {
    if (!mergePreview || !get<HTMLInputElement>("account-merge-agree").checked)
      return;
    profile = await api.mergeConfirm(
      mergePreview.merge_nonce,
      get<HTMLInputElement>("account-merge-look").checked,
    );
    clearMerge();
    await loadAvatar();
    privacy = await api.privacyStatus();
    await loadSessions();
    message = "mergeDone";
  });
  get("account-export").addEventListener("click", () => {
    void run(async () => {
      const { next_cursor, ...first } = await api.exportData();
      const runs = first.runs;
      let cursor = next_cursor;
      while (cursor) {
        const page = await api.exportData(cursor);
        if (
          page.profile.player_id !== first.profile.player_id ||
          page.exported_at !== first.exported_at ||
          (page.next_cursor && page.next_cursor.after_id <= cursor.after_id)
        )
          throw new ClientError("INVALID_SERVER_RESPONSE");
        runs.push(...page.runs);
        cursor = page.next_cursor;
      }
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(first, null, 2) + "\n"], {
          type: "application/json",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "ronin-id-data.json";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      message = "privacyExportReady";
    });
  });
  get("account-delete-agree").addEventListener("change", render);
  form("account-delete-form", async () => {
    if (!get<HTMLInputElement>("account-delete-agree").checked) return;
    privacy = await api.requestDeletion();
    profile = await api.profile();
    get<HTMLInputElement>("account-delete-agree").checked = false;
    get<HTMLDetailsElement>("account-delete-details").open = false;
    await loadSessions();
    message = "privacyRequested";
  });
  get("account-delete-cancel").addEventListener("click", () => {
    void run(async () => {
      privacy = await api.cancelDeletion();
      profile = await api.profile();
      await loadAvatar();
      message = "privacyCancelled";
    });
  });
  get("account-nickname-appeal").addEventListener("click", () => {
    void run(async () => {
      privacy = await api.appealNickname();
      message = "moderationReviewSent";
    });
  });
  form("account-profile-form", async (data) => {
    if (!profile) return;
    const nickname = String(data.get("nickname")).trim();
    const isPublic = data.has("public_profile");
    const update: components["schemas"]["UpdateProfileRequest"] = {};
    if (nickname && nickname !== profile.nickname) update.nickname = nickname;
    if (isPublic !== profile.public_profile) update.public_profile = isPublic;
    if (!Object.keys(update).length) return;
    profile = await api.updateProfile(update);
    message = "profileSaved";
  });
  form("account-register-form", async (data) => {
    const name = String(data.get("nickname")).trim();
    await api.register({
      email: String(data.get("email")),
      password: String(data.get("password")),
      ...(name ? { nickname: name } : {}),
      locale: context.locale(),
    });
    profile = await api.profile();
    message = "sent";
  });
  form("account-login-form", async (data) => {
    clearGoogleButton();
    profile = await api.login(
      String(data.get("email")),
      String(data.get("password")),
    );
    await loadAvatar();
    privacy = await api.privacyStatus();
    await loadSessions();
  });
  form("account-forgot-form", async (data) => {
    await api.forgot(String(data.get("email")));
    message = "sent";
  });
  form("account-reset-form", async (data) => {
    await api.resetPassword(intent.token, String(data.get("new_password")));
    intent.token = "";
    intent.kind = "";
    profile = undefined;
    list = undefined;
    message = "resetDone";
  });
  get("account-verify").addEventListener("click", () => {
    void run(async () => {
      await api.verifyEmail(intent.token);
      intent.token = "";
      intent.kind = "";
      profile = await api.profile();
      await loadSessions();
      await loadAvatar();
      message = "verified";
    });
  });
  get("account-resend").addEventListener("click", () => {
    void run(async () => {
      await api.resendEmail(context.locale());
      message = "sent";
    });
  });
  get("account-reload").addEventListener("click", () => {
    if (error?.code === "SESSION_CHANGED") {
      location.reload();
      return;
    }
    void run(load);
  });
  get("account-sessions-refresh").addEventListener("click", () => {
    void run(loadSessions);
  });
  form("account-reauth-form", async () => {
    const input = get<HTMLInputElement>("reauth-password");
    try {
      await api.reauth(input.value);
      await loadSessions();
      message = "reauthDone";
    } finally {
      input.value = "";
    }
  });
  get("account-logout").addEventListener("click", () => {
    void run(async () => {
      clearGoogleButton();
      await api.logout();
      profile = undefined;
      list = undefined;
      await load();
      message = "signedOut";
    });
  });
  get("account-new-guest").addEventListener("click", () => {
    void run(async () => {
      await api.logout();
      await load();
    });
  });
  window.addEventListener("ronin-account-link", () => {
    error = undefined;
    message = "";
    render();
  });
  context.setRedraw(render);
  render();
  try {
    await load();
  } catch (e) {
    bootstrapError = true;
    error =
      e instanceof ClientError ? e : new ClientError("SERVICE_UNAVAILABLE");
  } finally {
    busy = false;
    render();
  }
}
