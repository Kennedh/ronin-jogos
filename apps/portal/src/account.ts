import { RunnerApi, ClientError } from "@ronin/runner-client";
import type { components } from "@ronin/contracts";
import { accountCopy } from "@ronin/content/account-copy";
import type { AccountTextKey } from "@ronin/content/account-copy";
import { apiErrorMessage, runnerPath } from "@ronin/content";
import type { Locale } from "@ronin/content";
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
    list: components["schemas"]["AccountSessions"] | undefined,
    busy = true,
    reauth = false,
    message: AccountTextKey | "" = "",
    error: ClientError | undefined,
    bootstrapError = false;
  const copy = () => accountCopy(context.locale());
  function render() {
    const t = copy();
    for (const e of root.querySelectorAll<HTMLElement>("[data-account-copy]"))
      e.textContent = t[e.dataset["accountCopy"] as AccountTextKey];
    get<HTMLAnchorElement>("account-back").href = runnerPath(context.locale());
    const registered = profile?.account_status === "REGISTERED";
    get("account-guest").hidden = registered;
    get("account-logout").hidden = !registered;
    get("account-new-guest").hidden =
      !bootstrapError || error?.code !== "SESSION_REQUIRED";
    get("account-session-panel").hidden = !registered;
    get("account-resend").hidden = profile?.account_status !== "EMAIL_PENDING";
    get("account-name").textContent = profile?.nickname ?? t.guest;
    get("account-email").textContent = profile?.email ?? "";
    get("account-profile-panel").hidden = !profile;
    const registerNickname = get<HTMLInputElement>("register-nickname");
    registerNickname.readOnly = !!profile?.nickname;
    if (profileInForm !== profile) {
      get<HTMLInputElement>("account-profile-nickname").value =
        profile?.nickname ?? "";
      get<HTMLInputElement>("account-public-profile").checked =
        profile?.public_profile ?? false;
      registerNickname.value = profile?.nickname ?? "";
      profileInForm = profile;
    }
    const available = profile?.nickname_change_available_at;
    get("account-nickname-hint").textContent =
      available && new Date(available).getTime() > Date.now()
        ? t.nicknameAvailable +
          " " +
          new Intl.DateTimeFormat(context.locale(), {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(available))
        : t.nicknameHint;
    get("account-state").textContent = registered
      ? t.registered
      : profile?.account_status === "EMAIL_PENDING"
        ? t.pending
        : t.guest;
    get("verify-panel").hidden = intent.kind !== "verify";
    get("reset-panel").hidden = intent.kind !== "reset";
    get("account-reauth-form").hidden = !reauth;
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
    bootstrapError = false;
    if (profile.account_status === "REGISTERED") await loadSessions();
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
      if (["SESSION_REQUIRED", "SESSION_CHANGED"].includes(error.code)) {
        profile = undefined;
        list = undefined;
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
    await api.register({
      email: String(data.get("email")),
      password: String(data.get("password")),
      nickname: String(data.get("nickname")),
      locale: context.locale(),
    });
    profile = await api.profile();
    message = "sent";
  });
  form("account-login-form", async (data) => {
    profile = await api.login(
      String(data.get("email")),
      String(data.get("password")),
    );
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
